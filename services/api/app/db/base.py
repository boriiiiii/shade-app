"""Base déclarative SQLAlchemy 2.0."""
from __future__ import annotations

from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    """Base commune à tous les modèles ORM."""
