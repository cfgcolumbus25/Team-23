"""
Email template system for CLEPBridge
Handles reminder emails for institutions to update their CLEP policies
"""
from typing import Optional


def create_reminder_email(
    institution_name: str,
    portal_url: str,
    contact_name: Optional[str] = None
) -> tuple[str, str, str]:
    """
    Create a reminder email for institution updates
    
    Args:
        institution_name: Name of the institution
        portal_url: URL to the institutional portal
        contact_name: Optional name of contact person
    
    Returns:
        Tuple of (subject, text_body, html_body)
    """
    greeting = f"Dear {contact_name}" if contact_name else f"Dear {institution_name} Administrator"
    
    subject = f"Update Your CLEP Policy for {institution_name}"
    
    text_body = f"""{greeting},

We're updating our database of CLEP acceptance policies to help students find institutions that accept their exam scores.

Please take 3-5 minutes to log in to your account and review your institution's CLEP acceptance information.

Log in here: {portal_url}

If you don't have an account yet, you can create one using this same link.

If you have any questions, please reply to this email.

Thank you for helping students discover their educational opportunities!

Best regards,
The CLEPBridge Team
"""
    
    html_body = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h2 style="color: #66b10e; margin-top: 0;">Update Your CLEP Policy</h2>
        <p>{greeting},</p>
    </div>
    
    <div style="padding: 20px 0;">
        <p>We're updating our database of CLEP acceptance policies to help students find institutions that accept their exam scores.</p>
        
        <p><strong>Please take 3-5 minutes to log in to your account and review your institution's CLEP acceptance information.</strong></p>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="{portal_url}" 
               style="background-color: #66b10e; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                Log In to Update
            </a>
        </div>
        
        <p style="color: #666; font-size: 14px;">If you don't have an account yet, you can create one using the same link.</p>
        
        <p>If you have any questions, please reply to this email.</p>
        
        <p>Thank you for helping students discover their educational opportunities!</p>
    </div>
    
    <div style="border-top: 1px solid #ddd; margin-top: 30px; padding-top: 20px; color: #666; font-size: 12px;">
        <p>Best regards,<br>The CLEPBridge Team</p>
        <p style="margin-top: 20px;">
            If the button doesn't work, copy and paste this link into your browser:<br>
            <a href="{portal_url}" style="color: #66b10e; word-break: break-all;">{portal_url}</a>
        </p>
    </div>
</body>
</html>
"""
    
    return subject, text_body, html_body

