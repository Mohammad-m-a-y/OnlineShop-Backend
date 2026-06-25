from pydantic import BaseModel
from decimal import Decimal



class AdminDashboardStatus(BaseModel):
    products_total_count: int
    products_month_count: int
    today_orders: int
    users_count: int
    month_income: Decimal