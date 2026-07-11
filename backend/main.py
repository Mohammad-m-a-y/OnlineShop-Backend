from fastapi import FastAPI 
from fastapi.exceptions import  RequestValidationError
from app.exceptions.custom import AppException
from app.exceptions.handler import app_exception_handler ,unhandled_exception_handler , validation_exception_handler
from app.api.auth_routes import router as auth_router
from app.api.user_routes import router as user_router
from app.api.admin_routes import router as admin_router
from app.api.product_routes import router as product_router
from app.api.address_routes import router as address_router
from app.api.brand_routes import router as brand_router
from app.api.category_routes import router as category_router
from app.api.cart_routes import router as cart_router
from app.api.order_routes import router as order_router
from app.api.review_routes import router as review_router
from app.core.redis_file import redis_client
from contextlib import asynccontextmanager
from fastapi_limiter import FastAPILimiter
from app.api.payment_routes import router as payment_router
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from app.tasks.cleanup_tasks import cleanup_unverified_users
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from fastapi.staticfiles import StaticFiles
from app.api.sliders_routes import router as slider_routes
from pathlib import Path








@asynccontextmanager
async def lifespan(app: FastAPI):

    await FastAPILimiter.init(redis_client)
    print("FastAPI-Limiter initialized.")

    scheduler = AsyncIOScheduler()
    scheduler.add_job(
        cleanup_unverified_users,
        trigger="interval",
        hours=24
    )
    scheduler.start()
    print("Scheduler started.")


    yield 

   # shutdown
    scheduler.shutdown()
    print("Scheduler stopped.")
    await redis_client.close()
    print("Application shutdown.")





app = FastAPI(lifespan=lifespan)



app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)




Path("uploads").mkdir(exist_ok=True)

app.mount(
    "/uploads",
    StaticFiles(directory="uploads"),
    name="uploads"
)




@app.get("/")
async def root():
    return {"message": "app is running"}







app.include_router(auth_router)
app.include_router(user_router)
app.include_router(admin_router)
app.include_router(product_router)
app.include_router(address_router)
app.include_router(brand_router)
app.include_router(category_router)
app.include_router(cart_router)
app.include_router(order_router)
app.include_router(review_router)
app.include_router(payment_router)
app.include_router(slider_routes)



app.add_exception_handler(AppException, app_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(Exception, unhandled_exception_handler)
