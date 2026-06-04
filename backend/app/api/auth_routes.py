from fastapi import APIRouter, Depends
from app.schemas.user_schemas import RegisterRequest, CurrentUserResponse , LoginWithUsernameAndPassword,Verify
from app.dependencies.user_dependency import get_user_service
from app.schemas.token_schemas import TokenResponse, TokenRequest
from app.dependencies.auth_dependency import get_auth_service
from fastapi_limiter.depends import RateLimiter
from fastapi.security import OAuth2PasswordRequestForm






router = APIRouter(prefix="/auth", tags=["Auth"])




@router.post('/register', 
             dependencies=[Depends(RateLimiter(times=3, seconds=60))], 
             response_model=CurrentUserResponse,
             status_code=201
             )
async def register(data:RegisterRequest, service = Depends(get_user_service)):
    return await service.create_user(
        username = data.username,
        full_name= data.full_name,
        mobile= data.mobile,
        password= data.password,
        email= data.email
    )



@router.post("/verify", 
             response_model=TokenResponse,
             dependencies=[Depends(RateLimiter(times=3, seconds=60))],
             status_code=200
             )
async def verify_user(
    data:Verify,
    service = Depends(get_auth_service)
):
    return await service.verify_user(
        mobile=data.mobile,
        otp_code= data.otp_code,
        purpose= data.purpose
    )




@router.post("/login-username", 
             response_model=TokenResponse,  
             dependencies=[Depends(RateLimiter(times=5, seconds=60))], 
             status_code=200)
async def login_with_username(data:LoginWithUsernameAndPassword, service = Depends(get_auth_service)):
    return await service.login_whit_username_and_password(
        username = data.username,
        password = data.password
    )




#=========== test for swagger ============
@router.post("/login")
async def login_swagger(
    form_data: OAuth2PasswordRequestForm = Depends(),
    service=Depends(get_auth_service)
):
    return await service.login_whit_username_and_password(
        username=form_data.username,
        password=form_data.password
    )





@router.post("/refresh", 
             response_model=TokenResponse, 
             dependencies=[Depends(RateLimiter(times=10, seconds=60))], 
             status_code=200)
async def refresh(data:TokenRequest, service = Depends(get_auth_service)):
    return await service.validate_and_rotate(token_str= data.refresh_token)





@router.post("/logout",
            dependencies=[Depends(RateLimiter(times=10, seconds=60))], 
            status_code=200)
async def logout(data:TokenRequest, service = Depends(get_auth_service)):
    return await service.logout(refresh_token =  data.refresh_token)
