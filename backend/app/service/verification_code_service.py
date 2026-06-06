from sqlalchemy.ext.asyncio import AsyncSession
from app.repository.verification_code_repository import VerificationCodeRepository
from app.exceptions.custom import (BadRequestError, NotFoundError,ForbiddenError,InternalServerError)
from app.service.base_service import BaseService
import string
import bcrypt
from datetime import datetime, timezone, timedelta
from app.core.config import get_settings
from app.service.sms_service import SmsService
from app.core.status_enum import OTPCodePurpose
from app.core.logging_handler import logger
import secrets


settings = get_settings()


class VerificationCodeService(BaseService):
    def __init__(self, db:AsyncSession):
        super().__init__(db)
        self.repo = VerificationCodeRepository(db)
        self.sms_service = SmsService()


    def _generate_otp(self, length: int = 6) -> str:
        """
        تولید کد OTP عددی
        """

        return ''.join(secrets.choice(string.digits) for _ in range(length))
    

    def _hash_otp(self, otp: str) -> str:
        """
        هش کردن کد OTP با bcrypt
        """
        salt = bcrypt.gensalt()
        hashed_otp = bcrypt.hashpw(otp.encode('utf-8'), salt)
        return hashed_otp.decode('utf-8')
    

    def _verify_otp_hash(self, stored_hash: str, provided_otp: str) -> bool:
        """
        مقایسه کد ارائه شده با هش ذخیره شده
        """
        return bcrypt.checkpw(provided_otp.encode('utf-8'), stored_hash.encode('utf-8'))
    


    async def send_code(self, mobile: str, purpose: str = OTPCodePurpose.REGISTER) -> bool:
        """ 
            1. invalidate all past otp codes for mobile.
            2. create new otp code and add to database.
            3. send otp code to mobile number

        """
        if not mobile or len(mobile) < 10:
            raise BadRequestError("INVALID_MOBILE_NUMBER")
        

        try:
 
            await self.repo.invalidate_all(mobile, purpose)

            otp = self._generate_otp()
            hashed_otp = self._hash_otp(otp)
            expires_at = datetime.now(timezone.utc) + timedelta(minutes=settings.OTP_EXPIRATION_MINUTES)

            await self.repo.create(
                mobile=mobile,
                code_hash=hashed_otp,
                purpose=purpose,
                expires_at=expires_at,
                max_attempts=settings.OTP_MAX_ATTEMPTS
            )

            await self.sms_service.send_sms(to=mobile, message=f"کد تایید شما: {otp}")   
            await self.db.commit()
              

            return True
        
        
        except ConnectionError as e: 
            await self.db.rollback() 
            print(f"Rolled back transaction due to SMS sending failure: {e}")
            raise BadRequestError("FAILED_TO_SEND_OTP") from e 

        except Exception as e:
            await self.db.rollback()
            raise InternalServerError(f"FAILED_TO_SEND_SMS:{e}")


    async def verify_code(self, mobile: str, otp_code: str, purpose: OTPCodePurpose):

        code_record = await self.repo.get_for_verify(mobile, purpose)

        if not code_record:
            raise BadRequestError("INVALID_OR_EXPIRED_OTP")

        # چک کردن انقضا
        if code_record.expires_at <= datetime.now(timezone.utc):          
            raise BadRequestError("OTP_HAS_EXPIRED")

        # چک کردن تعداد تلاش‌ها
        if code_record.attempt_count >= code_record.max_attempts:
            raise BadRequestError("MAXIMUM_OTP_ATTEMPTS_EXCEEDED")

        # بررسی صحت کد
        if not self._verify_otp_hash(code_record.code_hash, otp_code):
            await self.repo.increase_attempt(code_record)
            await self.db.flush() 
            
            try:
                await self.db.commit() 
            except Exception as commit_error:
                logger.error(f"Failed to commit OTP attempt for mobile {mobile}: {commit_error}")

            raise BadRequestError("INVALID_OTP_CODE")

        try:
            

 
            await self.repo.mark_as_used(code_record)
            await self.db.flush() 

            # will commit at higher leyers

            return code_record
        
        except BadRequestError as e: 
            raise e
        
        except Exception as e: 
            logger.error(f"FAILED_TO_VERIFY_OTP_CODE: {e}")
            raise InternalServerError("FAILED_TO_VERIFY_OTP_CODE")
    
    