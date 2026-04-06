import stripe
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Request

from app.config import get_settings
from app.models.schemas import CreateCheckoutRequest, SubscriptionStatus
from app.utils.auth import get_current_user
from app.services.firebase_client import get_db

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
    db = get_db()

    # Check for active subscription
    subs = (
        db.collection("subscriptions")
        .where("user_id", "==", user["user_id"])
        .where("status", "==", "active")
        .limit(1)
        .stream()
    )
    sub_list = [doc.to_dict() for doc in subs]

    if sub_list:
        s = sub_list[0]
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

    usage_docs = (
        db.collection("tailor_results")
        .where("user_id", "==", user["user_id"])
        .where("created_at", ">=", month_start)
        .stream()
    )
    usage_count = sum(1 for _ in usage_docs)

    return SubscriptionStatus(
        is_active=False,
        usage_count=usage_count,
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

    db = get_db()

    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        user_id = session.get("client_reference_id")
        subscription_id = session.get("subscription")

        if user_id and subscription_id:
            sub = s.Subscription.retrieve(subscription_id)
            # Use user_id as doc ID for easy upsert
            db.collection("subscriptions").document(user_id).set(
                {
                    "user_id": user_id,
                    "stripe_subscription_id": subscription_id,
                    "stripe_customer_id": session.get("customer"),
                    "status": "active",
                    "plan": "pro",
                    "current_period_end": datetime.fromtimestamp(
                        sub.current_period_end, tz=timezone.utc
                    ).isoformat(),
                },
                merge=True,
            )

    elif event["type"] == "customer.subscription.deleted":
        sub = event["data"]["object"]
        _update_subscription_by_stripe_id(db, sub["id"], {"status": "cancelled"})

    elif event["type"] == "customer.subscription.updated":
        sub = event["data"]["object"]
        _update_subscription_by_stripe_id(
            db,
            sub["id"],
            {
                "status": sub["status"],
                "current_period_end": datetime.fromtimestamp(
                    sub["current_period_end"], tz=timezone.utc
                ).isoformat(),
            },
        )

    return {"status": "ok"}


def _update_subscription_by_stripe_id(db, stripe_sub_id: str, update_data: dict):
    """Find a subscription doc by stripe_subscription_id and update it."""
    docs = (
        db.collection("subscriptions")
        .where("stripe_subscription_id", "==", stripe_sub_id)
        .limit(1)
        .stream()
    )
    for doc in docs:
        doc.reference.update(update_data)
