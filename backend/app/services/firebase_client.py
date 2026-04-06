import firebase_admin
from firebase_admin import credentials, firestore
from app.config import get_settings

_app = None


def _init_firebase():
    global _app
    if _app is not None:
        return
    settings = get_settings()
    cred = credentials.Certificate(settings.firebase_credentials_path)
    _app = firebase_admin.initialize_app(cred)


def get_db() -> firestore.client:
    """Get Firestore client."""
    _init_firebase()
    return firestore.client()
