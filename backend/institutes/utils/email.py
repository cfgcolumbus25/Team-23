import os
import logging
import resend
from typing import Optional, Union, List

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

resend.api_key = os.getenv("RESEND_API_KEY")


def send_email(
    to_email: Union[str, List[str]], 
    subject: str, 
    body: str, 
    html_body: Optional[str] = None
) -> bool:
    """
    Send a generic transactional email via Resend API.
    
    Args:
        to_email: Recipient email address(es) - can be a single string or list of strings
        subject: Email subject line
        body: Plain text email body
        html_body: Optional HTML email body (if not provided, plain text is used)
    
    Returns:
        bool: True if email sent successfully, False otherwise
    
    Example:
        send_email("user@example.com", "Welcome!", "Your account has been created.")
        send_email(["user1@example.com", "user2@example.com"], "Update", "Message", "<p>HTML</p>")
    """
    from_email = os.getenv("FROM_EMAIL")
    
    if not resend.api_key:
        logger.error("RESEND_API_KEY not configured")
        return False
    
    if not from_email:
        logger.error("FROM_EMAIL not configured")
        return False
    
    # Normalize to_email to list format
    recipients = [to_email] if isinstance(to_email, str) else to_email
    
    if not recipients:
        logger.error("No recipient email addresses provided")
        return False
    
    try:
        params = {
            "from": from_email,
            "to": recipients,
            "subject": subject,
            "text": body,
        }
        
        # Add HTML body if provided
        if html_body:
            params["html"] = html_body
        
        response = resend.Emails.send(params)
        logger.info(f"Email sent to {recipients}. Subject: {subject}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send email to {recipients}: {str(e)}")
        return False
