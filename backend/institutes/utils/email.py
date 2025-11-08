import os
import logging
import resend
from typing import Optional, Union, List

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

resend.api_key = os.getenv("RESEND_API_KEY")


def send_magic_link(to_email: str, link: str, institution_name: Optional[str] = None) -> bool:
    """
    Send a magic link verification email to an institution contact.
    
    Args:
        to_email: Recipient email address
        link: Full magic link URL for verification
        institution_name: Optional institution name for personalization
    
    Returns:
        bool: True if email sent successfully, False otherwise
    """
    from_email = os.getenv("FROM_EMAIL")
    
    if not resend.api_key:
        logger.error("RESEND_API_KEY not configured")
        return False
    
    if not from_email:
        logger.error("FROM_EMAIL not configured")
        return False
    
    greeting = f"Hello from {institution_name}," if institution_name else "Hello,"
    
    html_body = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px;">
            <h2 style="color: #2563eb; margin-top: 0;">CLEP Voucher Acceptance Verification</h2>
            
            <p>{greeting}</p>
            
            <p>We need to verify your institution's CLEP exam acceptance policies. Please click the button below to confirm or update your information:</p>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="{link}" 
                   style="background-color: #2563eb; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                    Verify CLEP Acceptance
                </a>
            </div>
            
            <p style="font-size: 14px; color: #666;">
                <strong>⏱️ This link expires in 48 hours.</strong>
            </p>
            
            <p style="font-size: 14px; color: #666;">
                If the button doesn't work, copy and paste this link into your browser:
            </p>
            <p style="word-break: break-all; font-size: 12px; color: #888; background-color: #f0f0f0; padding: 10px; border-radius: 4px;">
                {link}
            </p>
            
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            
            <p style="font-size: 12px; color: #888;">
                If you did not expect this email, please ignore it. This verification link can only be used once.
            </p>
        </div>
    </body>
    </html>
    """
    
    text_body = f"""
CLEP Voucher Acceptance Verification

{greeting}

We need to verify your institution's CLEP exam acceptance policies.

Please click the link below to confirm or update your information:
{link}

⏱️ This link expires in 48 hours.

If you did not expect this email, please ignore it.
    """.strip()
    
    try:
        params = {
            "from": from_email,
            "to": [to_email],
            "subject": "Confirm your CLEP voucher acceptance",
            "html": html_body,
            "text": text_body,
        }
        
        response = resend.Emails.send(params)
        logger.info(f"Magic link email sent to {to_email}. Response: {response}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send magic link email to {to_email}: {str(e)}")
        return False


def send_confirmation_email(to_email: str, institution_name: str) -> bool:
    """
    Send a confirmation email after successful verification.
    
    Args:
        to_email: Recipient email address
        institution_name: Institution name
    
    Returns:
        bool: True if email sent successfully, False otherwise
    """
    from_email = os.getenv("FROM_EMAIL")
    
    if not resend.api_key or not from_email:
        logger.error("Email configuration missing")
        return False
    
    html_body = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px;">
            <h2 style="color: #16a34a; margin-top: 0;">✓ Verification Complete</h2>
            
            <p>Thank you for verifying {institution_name}'s CLEP acceptance information.</p>
            
            <p>Your updated policies have been saved and will be visible to students searching for CLEP-accepting institutions.</p>
            
            <p style="margin-top: 30px;">If you need to make any changes, please contact our support team.</p>
            
            <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
            
            <p style="font-size: 12px; color: #888;">
                This is an automated confirmation email.
            </p>
        </div>
    </body>
    </html>
    """
    
    try:
        params = {
            "from": from_email,
            "to": [to_email],
            "subject": "CLEP verification confirmed",
            "html": html_body,
        }
        
        response = resend.Emails.send(params)
        logger.info(f"Confirmation email sent to {to_email}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send confirmation email to {to_email}: {str(e)}")
        return False


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
