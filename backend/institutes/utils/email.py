import os
import logging
import resend
from typing import Optional, Union, List
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

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
    mock_email = os.getenv("MOCK_EMAIL")  # Email to use for testing
    
    logger.info(f"send_email called: to={to_email}, subject='{subject}'")
    logger.info(f"Environment: FROM_EMAIL={from_email}, MOCK_EMAIL={mock_email}, RESEND_API_KEY={'set' if resend.api_key else 'not set'}")
    
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
    
    # If MOCK_EMAIL is set, redirect all emails to mock address
    original_recipients = recipients.copy()
    if mock_email:
        logger.info(f"MOCK_EMAIL mode: Redirecting email from {recipients} to {mock_email}")
        recipients = [mock_email]
    
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
        

def send_clep_policy_reminder(to_email: Union[str, List[str]], update_link: Optional[str] = None) -> bool:
    """
    Send a reminder email to institutions about updating their CLEP transfer policy.
    
    Args:
        to_email: Recipient email address(es) - can be a single string or list of strings
        update_link: Optional URL for the "Update CLEP Policy" button/link.
                    If not provided, uses FRONTEND_BASE_URL from environment variables.
    
    Returns:
        bool: True if email sent successfully, False otherwise
    """
    from_email = os.getenv("FROM_EMAIL")
    mock_email = os.getenv("MOCK_EMAIL")  # Email to use for testing
    
    if not resend.api_key:
        logger.error("RESEND_API_KEY not configured")
        return False
    
    if not from_email:
        logger.error("FROM_EMAIL not configured")
        return False
    
    # Get update link from parameter or environment variable
    if not update_link:
        frontend_base_url = os.getenv("FRONTEND_BASE_URL")
        if not frontend_base_url:
            logger.error("FRONTEND_BASE_URL not configured and update_link not provided")
            return False
        update_link = f"{frontend_base_url}/institute/update"
    
    logger.info(f"send_clep_policy_reminder: update_link='{update_link}'")
    
    # Normalize to_email to list format
    recipients = [to_email] if isinstance(to_email, str) else to_email
    
    if not recipients:
        logger.error("No recipient email addresses provided")
        return False
    
    # If MOCK_EMAIL is set, redirect all emails to mock address
    original_recipients = recipients.copy()
    if mock_email:
        logger.info(f"MOCK_EMAIL mode: Redirecting CLEP reminder from {recipients} to {mock_email}")
        recipients = [mock_email]
    
    subject = "Update Your CLEP Transfer Policy"
    
    html_body = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px;">
            <h2 style="color: #2563eb; margin-top: 0;">Update Your CLEP Transfer Policy</h2>
            
            <p>Hi there,</p>
            
            <p>Your institution's CLEP transfer policy isn't listed or may be out of date — and that means your school could be invisible to thousands of students actively looking for CLEP-friendly colleges.</p>
            
            <p>Every year, more than 170,000 students earn college credit through CLEP, saving an average of $1,500 per exam and often finishing their degree a full semester sooner. These are motivated, cost-conscious learners who choose where to apply based on clear transfer policies.</p>
            
            <p>Schools with updated CLEP data see higher visibility across Modern States and related platforms — connecting directly with students ready to enroll.</p>
            
            <p>Don't miss out on that reach. Update your CLEP transfer eligibility today to make sure your institution is featured where students are searching.</p>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="{update_link}" 
                   style="background-color: #2563eb; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                    Update CLEP Policy
                </a>
            </div>
            
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            
            <p style="font-size: 12px; color: #888;">
                This is an automated message from CLEP Bridge.
            </p>
        </div>
    </body>
    </html>
    """
    
    text_body = f"""Hi there,

Your institution's CLEP transfer policy isn't listed or may be out of date — and that means your school could be invisible to thousands of students actively looking for CLEP-friendly colleges.

Every year, more than 170,000 students earn college credit through CLEP, saving an average of $1,500 per exam and often finishing their degree a full semester sooner. These are motivated, cost-conscious learners who choose where to apply based on clear transfer policies.

Schools with updated CLEP data see higher visibility across Modern States and related platforms — connecting directly with students ready to enroll.

Don't miss out on that reach. Update your CLEP transfer eligibility today to make sure your institution is featured where students are searching.

Update your policy here: {update_link}

This is an automated message from CLEP Bridge.
    """.strip()
    
    try:
        params = {
            "from": from_email,
            "to": recipients,
            "subject": subject,
            "html": html_body,
            "text": text_body,
            "click_tracking": False,
        }
        
        response = resend.Emails.send(params)
        logger.info(f"CLEP policy reminder sent to {recipients}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send CLEP policy reminder to {recipients}: {str(e)}")
        return False