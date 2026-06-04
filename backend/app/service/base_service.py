from sqlalchemy.ext.asyncio import AsyncSession
from abc import ABC, abstractmethod


class BaseService:
    def __init__(self,db:AsyncSession ):
        self.db = db


