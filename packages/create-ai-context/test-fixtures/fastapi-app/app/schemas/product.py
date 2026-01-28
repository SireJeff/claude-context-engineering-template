"""
Product Schemas
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class ProductBase(BaseModel):
    """Base product schema"""
    name: str
    description: Optional[str] = None
    price: float
    category: str
    stock: int = 0


class ProductCreate(ProductBase):
    """Schema for creating a product"""
    pass


class ProductUpdate(BaseModel):
    """Schema for updating a product"""
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    category: Optional[str] = None
    stock: Optional[int] = None


class ProductResponse(ProductBase):
    """Product response schema"""
    id: int
    is_active: bool
    owner_id: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True
