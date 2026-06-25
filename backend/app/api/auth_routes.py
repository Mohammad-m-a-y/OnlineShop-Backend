from fastapi import APIRouter, Depends, Response, Request
from app.schemas.user_schemas import RegisterRequest, CurrentUserResponse , LoginWithUsernameAndPassword,Verify
from app.dependencies.user_dependency import get_user_service
from app.schemas.token_schemas import TokenResponse, TokenRequest, SendOtpRequest
from app.dependencies.auth_dependency import get_auth_service
from fastapi_limiter.depends import RateLimiter
from fastapi.security import OAuth2PasswordRequestForm
from app.dependencies.verification_code_dependency import get_verification_code_service
 



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



# @router.post("/verify", 
#              response_model=TokenResponse,
#              dependencies=[Depends(RateLimiter(times=3, seconds=60))],
#              status_code=200
#              )
# async def verify_user(
#     data:Verify,
#     service = Depends(get_auth_service)
# ):
#     return await service.verify_user(
#         mobile=data.mobile,
#         otp_code= data.otp_code,
#         purpose= data.purpose
#     )



@router.post("/verify", 
             dependencies=[Depends(RateLimiter(times=3, seconds=60))],
             status_code=200
             )
async def verify_user(
    data:Verify,
    response: Response,
    service = Depends(get_auth_service)
):
    tokens = await service.verify_user(
    mobile=data.mobile,
    otp_code=data.otp_code,
    purpose=data.purpose
)

    response.set_cookie(
        key="access_token",
        value=tokens["access_token"],
        httponly=True,
        secure=False,     
        samesite="lax",
        max_age=3600
    )

    response.set_cookie(
        key="refresh_token",
        value=tokens['refresh_token'],
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=2592000
    )

    return {"success": True}





@router.post('/send-otp',
             dependencies=[Depends(RateLimiter(times=3, seconds=60))],
             status_code=201
             )
async def send_otp_code(
    data:SendOtpRequest,
    service = Depends(get_verification_code_service)
):
    """
    send verification code for login or resend verification for registeration
    """
    return await service.send_code(
        mobile = data.mobile,
        purpose = data.purpose
    )




# @router.post("/login-username", 
#              response_model=TokenResponse,  
#              dependencies=[Depends(RateLimiter(times=5, seconds=60))], 
#              status_code=200)
# async def login_with_username(data:LoginWithUsernameAndPassword, service = Depends(get_auth_service)):
#     return await service.login_whit_username_and_password(
#         username = data.username,
#         password = data.password
#     )


@router.post("/login-username")
async def login_with_username(
    data: LoginWithUsernameAndPassword,
    response: Response,
    service=Depends(get_auth_service)
):
    tokens = await service.login_whit_username_and_password(
        username = data.username,
        password = data.password
    )

    response.set_cookie(
        key="access_token",
        value=tokens["access_token"],
        httponly=True,
        secure=False,     
        samesite="lax",
        max_age=3600
    )

    response.set_cookie(
        key="refresh_token",
        value=tokens['refresh_token'],
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=2592000
    )

    return {"success": True}



# @router.post('/login-mobile',
#             response_model=TokenResponse,
#             dependencies=[Depends(RateLimiter(times=5, seconds=60))], 
#             status_code=200
# )
# async def login_with_mobile(
#     data:Verify,
#     service = Depends(get_auth_service),
# ):
#     return await service.login_with_mobile(
#         mobile= data.mobile,
#         otp_code=data.otp_code,
#         purpose=data.purpose
#     )



@router.post('/login-mobile',
            dependencies=[Depends(RateLimiter(times=5, seconds=60))], 
            status_code=200
)
async def login_with_mobile(
    data:Verify,
    response: Response,
    service = Depends(get_auth_service),
):
    tokens = await service.login_with_mobile(
    mobile=data.mobile,
    otp_code=data.otp_code,
    purpose=data.purpose
)

    response.set_cookie(
        key="access_token",
        value=tokens["access_token"],
        httponly=True,
        secure=False,     
        samesite="lax",
        max_age=3600
    )

    response.set_cookie(
        key="refresh_token",
        value=tokens['refresh_token'],
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=2592000
    )

    return {"success": True}





#=========== test for swagger ============
@router.post("/login", dependencies=[Depends(RateLimiter(times=5, seconds=60))], status_code=200)
async def login_swagger(
    form_data: OAuth2PasswordRequestForm = Depends(),
    service=Depends(get_auth_service)
):
    return await service.login_whit_username_and_password(
        username=form_data.username,
        password=form_data.password
    )





@router.post("/refresh", 
             dependencies=[Depends(RateLimiter(times=10, seconds=60))], 
             status_code=200)
async def refresh(
    request: Request,
    response: Response,
    service = Depends(get_auth_service)
):
    refresh_token = request.cookies.get("refresh_token")

    tokens = await service.validate_and_rotate( refresh_token )


    response.set_cookie(
        key="access_token",
        value=tokens["access_token"],
        httponly=True,
        secure=False,     
        samesite="lax",
        max_age=3600
    )

    response.set_cookie(
        key="refresh_token",
        value=tokens['refresh_token'],
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=2592000
    )

    return {"success": True}





# @router.post("/logout",
#             dependencies=[Depends(RateLimiter(times=10, seconds=60))], 
#             status_code=200)
# async def logout(data:TokenRequest, service = Depends(get_auth_service)):
#     return await service.logout(refresh_token =  data.refresh_token)



@router.post("/logout",
            dependencies=[Depends(RateLimiter(times=10, seconds=60))], 
            status_code=200)
async def logout(
    request: Request,
    response: Response,
    service = Depends(get_auth_service)
):
    refresh_token = request.cookies.get("refresh_token")

    await service.logout(refresh_token)

    response.delete_cookie("access_token")
    response.delete_cookie("refresh_token")
