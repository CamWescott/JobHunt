import stripe
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Request

from app.config import get_settings
from app.models.schemas import CreateCheckoutRequest, SubscriptionStatus
from app.utils.auth import get_current_user
from app.services.supabase_client import get_supabase

router = APIRouter()


def get_stripe():
    settings = get_settings()
    stripe.api_key = settings.stripe_secret_key
    return stripe


@router.post("/create-checkout")
async def create_checkout_session(
    request: CreateCheckoutRequest,
    user: dict = Depends(get_current_user),
):
    """Create a Stripe checkout session."""
    settings = get_settings()
    s = get_stripe()

    try:
        session = s.checkout.Session.create(
            payment_method_types=["card"],
            line_items=[{"price": request.price_id, "quantity": 1}],
            mode="subscription",
            success_url=f"{settings.frontend_url}/dashboard?payment=success",
            cancel_url=f"{settings.frontend_url}/pricing?payment=cancelled",
            client_reference_id=user["user_id"],
            customer_email=user["email"],
        )
        return {"checkout_url": session.url}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/status", response_model=SubscriptionStatus)
async def get_subscription_status(user: dict = Depends(get_current_user)):
    """Get current subscription status."""
    supabase = get_supabase()

    # Check for active subscription
    sub = (
        supabase.table("subscriptions")
        .select("*")
        .eq("user_id", user["user_id"])
        .eq("status", "active")
        .execute()
    )

    if sub.data:
        s = sub.data[0]
        return SubscriptionStatus(
            is_active=True,
            plan=s.get("plan", "pro"),
            current_period_end=s.get("current_period_end"),
            usage_count=0,
            usage_limit=999999,
        )

    # Free tier — count usage
    now = datetime.now(timezone.utc)
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0).isoformat()

    usage = (
        supabase.table("tailor_results")
        .select("id", count="exact")
        .eq("user_id", user["user_id"])
        .gte("created_at", month_start)
        .execute()
    )

    return SubscriptionStatus(
        is_active=False,
        usage_count=usage.count or 0,
        usage_limit=3,
    )


@router.post("/webhook")
async def stripe_webhook(request: Request):
    """Handle Stripe webhook events."""
    settings = get_settings()
    s = get_stripe()

    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")

    try:
        event = s.Webhook.construct_event(
            payload, sig_header, settings.stripe_webhook_secret
        )
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid webhook signature")

    supabase = get_supabase()

    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        user_id = session.get("client_reference_id")
        subscription_id = session.get("subscription")

        if user_id and subscription_id:
            sub = s.Subscription.retrieve(subscription_id)
            supabase.table("subscriptions").upsert(
                {
                    "user_id": user_id,
                    "stripe_subscription_id": subscription_id,
                    "stripe_customer_id": session.get("customer"),
                    "status": "active",
                    "plan": "pro",
                    "current_period_end": datetime.fromtimestamp(
                        sub.current_period_end, tz=timezone.utc
                    ).isoformat(),
                }
            ).execute()

    elif event["type"] == "customer.subscription.deleted":
        sub = event["data"]["object"]
        supabase.table("subscriptions").update({"status": "cancelled"}).eq(
            "stripe_subscription_id", sub["id"]
        ).execute()

    elif event["type"] == "customer.subscription.updated":
        sub = event["data"]["object"]
        supabase.table("subscriptions").update(
            {
                "status": sub["status"],
                "current_period_end": datetime.fromtimestamp(
                    sub["current_period_end"], tz=timezone.utc
                ).isoformat(),
            }
        ).eq("stripe_subscription_id", sub["id"]).execute()

    return {"status": "ok"}
