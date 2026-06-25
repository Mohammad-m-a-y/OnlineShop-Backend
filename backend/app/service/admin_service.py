from uuid import UUID
from app.service.base_service import BaseService
from sqlalchemy.ext.asyncio import AsyncSession
from app.exceptions.custom import (BadRequestError, NotFoundError,InternalServerError,ForbiddenError)
from app.repository.product_repository import ProductRepository
from app.repository.order_repository import OrderRepository
from app.repository.user_repository import UserRepository
from app.repository.review_repository import ReviewRepository
from app.repository.payment_repository import PaymentRepository
from datetime import datetime
 




class AdminService(BaseService):
    def __init__(self, db:AsyncSession):
        super().__init__(db)
        self.product_repo = ProductRepository(db)
        self.order_repo = OrderRepository(db)
        self.user_repo = UserRepository(db)
        self.review_repo = ReviewRepository(db)
        self.payment_repo = PaymentRepository(db)


    async def get_admin_dashboard_records(self, actor_id: UUID):
        if not actor_id:
            raise BadRequestError("MISSING_REQUIRED_FIELDS")
        
        actor = await self.user_repo.get_by_id(user_id=actor_id)

        if not actor:
            raise NotFoundError("ACTOR_NOT_FOUND")
        
        if not actor.is_admin and not actor.is_owner:
            raise ForbiddenError("ACCESS_DENIED")
        

        now = datetime.now()

        start_of_month = now.replace(
            day=1,
            hour=0,
            minute=0,
            second=0,
            microsecond=0,
        )   

        if now.month == 12:
            start_of_next_month = start_of_month.replace(
                year=now.year + 1,
                month=1
            )
        else:
            start_of_next_month = start_of_month.replace(
                month=now.month + 1
            )
        
        
        try:
            products_total_count, products_period_count = await self.product_repo.products_total(
                start_date=start_of_month , 
                end_date=start_of_next_month
                )
            orders_count = await self.order_repo.orders_count()
            users_count = await self.user_repo.users_count()
            income =  await self.payment_repo.calculate_income(start_date=start_of_month , end_date=start_of_next_month)

            return{
                "products_total_count":products_total_count,
                "products_month_count":products_period_count,
                "today_orders": orders_count,
                "users_count":users_count,
                "month_income":income
            }

        # except Exception:
        #     raise InternalServerError("FAILED_TO_FETCH_ADMIN_DASHBOARD_RECORDS")
        except Exception as e:
            import traceback

            traceback.print_exc()

            raise InternalServerError(
            str(e)
            )
