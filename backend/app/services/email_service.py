import logging

logger = logging.getLogger(__name__)

class EmailService:
    def send_appointment_confirmation(self, email: str, name: str, time_str: str) -> bool:
        """
        Simulate sending an appointment confirmation email.
        """
        logger.info(f"Sending confirmation email to {email} ({name}) for appointment at {time_str}")
        # In a real app, you would integrate a service like SendGrid, Mailgun, or SMTP.
        return True

email_service = EmailService()
