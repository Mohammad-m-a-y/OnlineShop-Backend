from app.core.config import get_settings
from kavenegar import *
from app.exceptions.custom import (BadRequestError,InternalServerError)






class SmsService:

    def __init__(self):
        self.settings = get_settings()


    async def send_sms(self, to: str, message: str):
        if not to or not message:
            raise BadRequestError("RECIPIENT_OR_MESSAGE_IS_EMPTY")

        try:
            api_key = self.settings.SMS_API_KEY
            sender_number = self.settings.SMS_SENDER_NUMBER

            api = KavenegarAPI(api_key)
            params = {
                'sender': sender_number,
                'receptor': to,
                'message': message
            }   
            response = await api.sms_send(params)
            print(response)
            return response

        except APIException as e: 
            print(e)
            raise InternalServerError("FAILED_TO_SEND_OTP_CODE")
        except HTTPException as e: 
            print(e)
            raise InternalServerError("FAILED_TO_SEND_OTP_CODE")

