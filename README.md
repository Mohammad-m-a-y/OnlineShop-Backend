<div align="center">
 
<h1>🛒 OnlineShop Backend</h1>
 
<p>
  <strong>A robust e-commerce backend built with FastAPI</strong><br/>
  <em>بک‌اند فروشگاه آنلاین با FastAPI</em>
</p>
 
<p>
  <img src="https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white"/>
  <img src="https://img.shields.io/badge/FastAPI-0.100+-009688?style=for-the-badge&logo=fastapi&logoColor=white"/>
  <img src="https://img.shields.io/badge/SQLAlchemy-2.0+-D71F00?style=for-the-badge&logo=sqlalchemy&logoColor=white"/>
  <img src="https://img.shields.io/badge/Alembic-Migrations-6BA539?style=for-the-badge"/>
  <img src="https://img.shields.io/badge/Status-In_Development-orange?style=for-the-badge"/>
</p>
 
</div>
 
---
 
## 📖 Description | توضیحات
 
**EN:** A full-featured e-commerce backend built with **FastAPI**, **SQLAlchemy**, and **Alembic**. Supports OTP-based authentication via mobile number (powered by [Kavenegar](https://kavenegar.com/)), product management, shopping cart, order processing, admin panel, and payment gateway integration.
 
**FA:** بک‌اند کامل یک سایت فروشگاهی توسعه‌یافته با **FastAPI**، **SQLAlchemy** و **Alembic**. احراز هویت از طریق شماره موبایل با OTP (سرویس [کاوه‌نگار](https://kavenegar.com/))، مدیریت محصولات، سبد خرید، سفارش‌گذاری، پنل ادمین و درگاه پرداخت.
 
> ⚠️ **Note | توجه:** This project is currently under active development and has not yet reached production stage. Sections such as payment gateway integration and product image storage are still being tested and refined.
> این پروژه در حال توسعه است و به مرحله عملیاتی نرسیده. بخش‌هایی مانند درگاه پرداخت و ذخیره‌سازی تصاویر محصولات نیاز به تست و اصلاح دارند.
 
---
 
## ✨ Features | امکانات
 
| Feature | امکان | Status |
|---|---|---|
| OTP & username/password Auth | احراز هویت OTP و نام کاربری | ✅ Done |
| JWT Access + Refresh Tokens | مدیریت توکن JWT | ✅ Done |
| Role-based Access (user/admin/owner) | کنترل دسترسی بر اساس نقش | ✅ Done |
| Product + Variants + Attributes | محصول، variant و attribute | ✅ Done |
| Product Images | آپلود و مدیریت تصاویر محصول | ✅ Done |
| Category & Brand Management | مدیریت دسته‌بندی و برند | ✅ Done |
| Shopping Cart (Auth + Guest) | سبد خرید (کاربر + مهمان) | ✅ Done |
| Order Processing | ثبت و مدیریت سفارش | ✅ Done |
| Address Management | مدیریت آدرس | ✅ Done |
| Product Reviews & Ratings | نظرات و امتیاز محصولات | ✅ Done |
| Rate Limiting | محدودسازی نرخ درخواست | ✅ Done |
| Payment Gateway | درگاه پرداخت | 🔧 In Progress |
 
---
 
## 🛠 Tech Stack | تکنولوژی‌ها
 
- **[FastAPI](https://fastapi.tiangolo.com/)** — High-performance async web framework
- **[SQLAlchemy](https://www.sqlalchemy.org/)** — ORM for database interactions
- **[Alembic](https://alembic.sqlalchemy.org/)** — Database migration tool
- **[Kavenegar](https://kavenegar.com/)** — SMS OTP service (کاوه‌نگار)
- **PostgreSQL / SQLite** — Database
- **JWT** — Stateless authentication
 
---
 

 
## 🚀 Getting Started | راه‌اندازی
 
### Prerequisites | پیش‌نیازها
 
- Python 3.11+
- pip
- PostgreSQL (or SQLite for development)
- A [Kavenegar](https://kavenegar.com/) account and API key
 
### Installation | نصب
 
```bash
# 1. Clone the repository | کلون کردن ریپازیتوری
git clone https://github.com/Mohammad-m-a-y/OnlineShop-Backend.git
cd OnlineShop-Backend/backend
 
# 2. Create and activate virtual environment | محیط مجازی
python -m venv venv
source venv/bin/activate        # Linux/Mac
venv\Scripts\activate           # Windows
 
# 3. Install dependencies | نصب وابستگی‌ها
pip install -r requirements.txt
 
# 4. Set up environment variables | تنظیم متغیرهای محیطی
 .env
# Edit .env with your values
```
 
### Environment Variables | متغیرهای محیطی
 
Create a `.env` file in the `backend/` directory:
 
```env
DATABASE_URL=postgresql://user:password@localhost/onlineshop
SECRET_KEY=your_jwt_secret_key
KAVENEGAR_API_KEY=your_kavenegar_api_key
```
### you can see necessary Environment Variables in /OnlineShop-Backend/backend/app/core/config.py
 
### Database Migration | مایگریشن دیتابیس
 
```bash
# Apply migrations | اعمال مایگریشن‌ها
alembic upgrade head
 
# Create a new migration | ساخت مایگریشن جدید
alembic revision --autogenerate -m "your message"
```
 
### Run the Server | اجرای سرور
 
```bash
uvicorn main:app --reload
```
 
The API will be available at `http://localhost:8000`
مستندات Swagger: `http://localhost:8000/docs`
 
---
 
## 📡 API Overview | مستندات API
 
Once the server is running, interactive API documentation is available at:
 
- **Swagger UI:** `http://localhost:8000/docs`
- **ReDoc:** `http://localhost:8000/redoc`
 
### 🔐 Auth | احراز هویت
 
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `POST` | `/auth/register` | Public | Register new user — ثبت‌نام کاربر |
| `POST` | `/auth/send-otp` | Public | Send OTP to mobile — ارسال کد OTP |
| `POST` | `/auth/verify` | Public | Verify OTP — تأیید OTP |
| `POST` | `/auth/login-mobile` | Public | Login via OTP — ورود با موبایل |
| `POST` | `/auth/login-username` | Public | Login via username & password — ورود با نام کاربری |
| `POST` | `/auth/refresh` | Public | Refresh JWT token — تجدید توکن |
| `POST` | `/auth/logout` | Public | Logout — خروج |
 
### 👤 Users | کاربران
 
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/users/` | Admin/Owner | List all users (paginated) — لیست کاربران |
| `GET` | `/users/me` | Auth | Get current user — اطلاعات کاربر جاری |
| `PUT` | `/users/me` | Auth | Update profile & avatar — ویرایش پروفایل |
| `GET` | `/users/me/addresses` | Auth | Get my addresses — آدرس‌های من |
| `GET` | `/users/me/carts` | Auth | Get my carts — سبدهای خرید من |
| `PATCH` | `/users/{user_id}/toggle-admin` | Owner | Grant/revoke admin role — تغییر نقش ادمین |
| `PATCH` | `/users/{user_id}/toggle-owner` | Owner | Grant/revoke owner role — تغییر نقش مالک |
| `PATCH` | `/users/{user_id}/toggle-status` | Admin/Owner | Activate/deactivate user — فعال/غیرفعال کردن کاربر |
| `DELETE` | `/users/{user_id}` | Auth | Delete user — حذف کاربر |
 
### 📦 Products | محصولات
 
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/products/` | Public | List products with filters — لیست محصولات با فیلتر |
| `POST` | `/products/` | Admin/Owner | Create product — ایجاد محصول |
| `GET` | `/products/{product_id}` | Public | Get product detail — جزئیات محصول |
| `PUT` | `/products/{product_id}` | Admin/Owner | Update product — ویرایش محصول |
| `DELETE` | `/products/{product_id}` | Admin/Owner | Delete product — حذف محصول |
| `POST` | `/products/variants` | Admin/Owner | Create product variant — ایجاد variant |
| `PATCH` | `/products/variants/{variant_id}` | Admin/Owner | Update variant — ویرایش variant |
| `DELETE` | `/products/variants/{variant_id}` | Admin/Owner | Delete variant — حذف variant |
| `POST` | `/products/variants/{variant_id}/attributes` | Admin/Owner | Add attribute — افزودن attribute |
| `PATCH` | `/products/variants/{variant_id}/attributes/{attribute_id}` | Admin/Owner | Update attribute — ویرایش attribute |
| `DELETE` | `/products/variants/attributes/{attribute_id}` | Admin/Owner | Delete attribute — حذف attribute |
| `POST` | `/products/images` | Admin/Owner | Upload product image — آپلود تصویر |
| `PATCH` | `/products/images/{image_id}` | Admin/Owner | Update image order — تغییر ترتیب تصویر |
| `DELETE` | `/products/images/{image_id}` | Admin/Owner | Delete image — حذف تصویر |
| `POST` | `/products/{product_id}/reviews` | Auth | Submit review — ثبت نظر |
| `GET` | `/products/{product_id}/reviews` | Public | Get product reviews — نظرات محصول |
 
### 🏷 Categories | دسته‌بندی‌ها
 
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/categories/` | Public | List all categories — لیست دسته‌بندی‌ها |
| `POST` | `/categories/` | Admin/Owner | Create category — ایجاد دسته‌بندی |
| `PATCH` | `/categories/{category_id}` | Admin/Owner | Update category — ویرایش دسته‌بندی |
| `DELETE` | `/categories/{category_id}` | Admin/Owner | Delete category — حذف دسته‌بندی |
 
### 🏢 Brands | برندها
 
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/brands/` | Public | List all brands — لیست برندها |
| `POST` | `/brands/` | Admin/Owner | Create brand — ایجاد برند |
| `PUT` | `/brands/{brand_id}` | Admin/Owner | Update brand — ویرایش برند |
| `DELETE` | `/brands/{brand_id}` | Admin/Owner | Delete brand — حذف برند |
 
### 🛒 Carts | سبد خرید
 
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/carts/` | Admin/Owner | List all carts (paginated) — لیست سبدها |
| `POST` | `/carts/` | Auth/Guest | Create cart — ایجاد سبد خرید |
| `PATCH` | `/carts/{cart_id}` | Auth/Guest | Abandon cart — رها کردن سبد |
| `POST` | `/carts/{cart_id}/cart-item` | Auth/Guest | Add item to cart — افزودن آیتم |
| `PATCH` | `/carts/{cart_id}/cart-item/{item_id}` | Auth/Guest | Update item quantity — تغییر تعداد |
 
### 📋 Orders | سفارشات
 
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `POST` | `/orders/` | Auth | Place order — ثبت سفارش |
| `GET` | `/orders/` | Auth | Get orders (filtered) — لیست سفارشات |
| `DELETE` | `/orders/{order_id}` | Auth | Cancel order — لغو سفارش |
 
### 📍 Addresses | آدرس‌ها
 
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `POST` | `/addresses/` | Auth | Create address — افزودن آدرس |
| `GET` | `/addresses/{address_id}` | Auth | Get address — دریافت آدرس |
| `PUT` | `/addresses/{address_id}` | Auth | Update address — ویرایش آدرس |
| `DELETE` | `/addresses/{address_id}` | Auth | Delete address — حذف آدرس |
 
### ⭐ Reviews | نظرات
 
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `PATCH` | `/reviews/{review_id}` | Auth | Update review — ویرایش نظر |
| `PATCH` | `/reviews/approve/{review_id}` | Admin/Owner | Approve/reject review — تأیید/رد نظر |
| `DELETE` | `/reviews/{review_id}` | Auth | Delete review — حذف نظر |
 
---
 
## 🗺 Roadmap | نقشه راه
 
- [x] OTP & Username/Password Authentication
- [x] JWT Access & Refresh Token rotation
- [x] Role-based Access Control (user / admin / owner)
- [x] Product, Variant & Attribute Management
- [x] Product Images
- [x] Category & Brand Management
- [x] Shopping Cart (authenticated + guest)
- [x] Order Processing
- [x] Address Management
- [x] Product Reviews & Ratings
- [x] Rate Limiting
- [ ] Payment Gateway Integration (درگاه پرداخت)
- [ ] Docker support

 
 
---
 

 
<div align="center">
  <p>Built with ❤️ using FastAPI | ساخته‌شده با FastAPI</p>
</div>
 
