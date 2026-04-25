from database import SessionLocal


def get_db():
    """
    Creates a new database session for a single request and closes it once the request is finished.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()