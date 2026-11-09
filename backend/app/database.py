import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from .config import settings

logger = logging.getLogger("staffpulse.database")
logging.basicConfig(level=logging.INFO)

Base = declarative_base()

def get_engine_and_status():
    """
    Attempts to connect to PostgreSQL.
    If PostgreSQL is unavailable or credentials fail, falls back seamlessly to SQLite.
    """
    pg_url = settings.DATABASE_URL
    try:
        # Test connection with a short timeout
        test_engine = create_engine(
            pg_url, 
            connect_args={"connect_timeout": 3},
            pool_pre_ping=True
        )
        with test_engine.connect() as conn:
            logger.info(f" Successfully connected to PostgreSQL at {settings.DB_HOST}:{settings.DB_PORT}/{settings.DB_NAME}")
        return test_engine, "postgresql", pg_url
    except Exception as e:
        logger.warning(
            f"⚠️ PostgreSQL not reachable at {settings.DB_HOST}:{settings.DB_PORT}/{settings.DB_NAME} ({e}). "
            f"Falling back to local SQLite: {settings.SQLITE_URL}"
        )
        sqlite_engine = create_engine(
            settings.SQLITE_URL, 
            connect_args={"check_same_thread": False}
        )
        return sqlite_engine, "sqlite", settings.SQLITE_URL

engine, DB_DIALECT, ACTIVE_DB_URL = get_engine_and_status()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    """
    FastAPI dependency that provides a database session per request.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

