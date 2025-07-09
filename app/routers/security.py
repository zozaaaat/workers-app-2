# Advanced Security System with 2FA
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from pydantic import BaseModel
import pyotp
import qrcode
import io
import base64
import secrets
import hashlib
from datetime import datetime, timedelta

from ..database import get_db
from ..models import User
from ..utils.permissions import get_current_user

router = APIRouter(prefix="/security", tags=["security"])
security = HTTPBearer()

# Pydantic Models
class TwoFactorSetupRequest(BaseModel):
    password: str

class TwoFactorEnableRequest(BaseModel):
    token: str
    backup_codes: bool = True

class TwoFactorVerifyRequest(BaseModel):
    token: str

class SecurityAuditLog(BaseModel):
    action: str
    ip_address: str
    user_agent: str
    timestamp: datetime
    success: bool
    details: Optional[str] = None

class PasswordChangeRequest(BaseModel):
    current_password: str
    new_password: str
    confirm_password: str

class SecuritySettingsResponse(BaseModel):
    two_factor_enabled: bool
    last_password_change: Optional[datetime]
    login_attempts: int
    account_locked: bool
    backup_codes_count: int
    security_questions_set: bool

# Security Service Class
class SecurityService:
    def __init__(self, db: Session):
        self.db = db
    
    def generate_2fa_secret(self, user: User) -> str:
        """Generate a new 2FA secret for user"""
        secret = pyotp.random_base32()
        # Store secret in user model (you'll need to add this field)
        user.two_factor_secret = secret
        self.db.commit()
        return secret
    
    def generate_qr_code(self, user: User, secret: str) -> str:
        """Generate QR code for 2FA setup"""
        totp_uri = pyotp.totp.TOTP(secret).provisioning_uri(
            name=user.email,
            issuer_name="Workers Management System"
        )
        
        qr = qrcode.QRCode(version=1, box_size=10, border=5)
        qr.add_data(totp_uri)
        qr.make(fit=True)
        
        img = qr.make_image(fill_color="black", back_color="white")
        buffer = io.BytesIO()
        img.save(buffer, format='PNG')
        buffer.seek(0)
        
        return base64.b64encode(buffer.getvalue()).decode()
    
    def verify_2fa_token(self, user: User, token: str) -> bool:
        """Verify 2FA token"""
        if not user.two_factor_secret:
            return False
        
        totp = pyotp.TOTP(user.two_factor_secret)
        return totp.verify(token, valid_window=1)
    
    def generate_backup_codes(self, user: User, count: int = 10) -> list:
        """Generate backup codes for 2FA"""
        codes = []
        for _ in range(count):
            code = secrets.token_hex(4).upper()
            codes.append(code)
        
        # Store hashed backup codes in database
        hashed_codes = [hashlib.sha256(code.encode()).hexdigest() for code in codes]
        user.backup_codes = ",".join(hashed_codes)
        self.db.commit()
        
        return codes
    
    def verify_backup_code(self, user: User, code: str) -> bool:
        """Verify and consume backup code"""
        if not user.backup_codes:
            return False
        
        hashed_code = hashlib.sha256(code.encode()).hexdigest()
        backup_codes = user.backup_codes.split(",")
        
        if hashed_code in backup_codes:
            # Remove used code
            backup_codes.remove(hashed_code)
            user.backup_codes = ",".join(backup_codes)
            self.db.commit()
            return True
        
        return False
    
    def log_security_event(self, user_id: int, action: str, ip_address: str, 
                          user_agent: str, success: bool, details: str = None):
        """Log security events"""
        # You'll need to create a SecurityLog model
        pass
    
    def check_password_strength(self, password: str) -> dict:
        """Check password strength"""
        score = 0
        feedback = []
        
        if len(password) >= 8:
            score += 1
        else:
            feedback.append("كلمة المرور يجب أن تكون 8 أحرف على الأقل")
        
        if any(c.isupper() for c in password):
            score += 1
        else:
            feedback.append("يجب أن تحتوي على حرف كبير واحد على الأقل")
        
        if any(c.islower() for c in password):
            score += 1
        else:
            feedback.append("يجب أن تحتوي على حرف صغير واحد على الأقل")
        
        if any(c.isdigit() for c in password):
            score += 1
        else:
            feedback.append("يجب أن تحتوي على رقم واحد على الأقل")
        
        if any(c in "!@#$%^&*()_+-=[]{}|;:,.<>?" for c in password):
            score += 1
        else:
            feedback.append("يجب أن تحتوي على رمز خاص واحد على الأقل")
        
        strength_levels = ["ضعيف جداً", "ضعيف", "متوسط", "قوي", "قوي جداً"]
        strength = strength_levels[min(score, 4)]
        
        return {
            "score": score,
            "strength": strength,
            "feedback": feedback,
            "is_strong": score >= 4
        }

# Security Routes
@router.post("/2fa/setup")
async def setup_2fa(
    request: TwoFactorSetupRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Setup 2FA for user"""
    # Verify current password
    if not verify_password(request.password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="كلمة المرور غير صحيحة"
        )
    
    security_service = SecurityService(db)
    secret = security_service.generate_2fa_secret(current_user)
    qr_code = security_service.generate_qr_code(current_user, secret)
    
    return {
        "secret": secret,
        "qr_code": qr_code,
        "manual_entry_key": secret,
        "message": "امسح رمز QR باستخدام تطبيق Google Authenticator أو أدخل المفتاح يدوياً"
    }

@router.post("/2fa/enable")
async def enable_2fa(
    request: TwoFactorEnableRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Enable 2FA after verifying token"""
    security_service = SecurityService(db)
    
    if not security_service.verify_2fa_token(current_user, request.token):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="رمز التحقق غير صحيح"
        )
    
    current_user.two_factor_enabled = True
    backup_codes = []
    
    if request.backup_codes:
        backup_codes = security_service.generate_backup_codes(current_user)
    
    db.commit()
    
    return {
        "message": "تم تفعيل المصادقة الثنائية بنجاح",
        "backup_codes": backup_codes
    }

@router.post("/2fa/verify")
async def verify_2fa(
    request: TwoFactorVerifyRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Verify 2FA token during login"""
    security_service = SecurityService(db)
    
    # Try regular token first
    if security_service.verify_2fa_token(current_user, request.token):
        return {"verified": True, "message": "تم التحقق بنجاح"}
    
    # Try backup code
    if security_service.verify_backup_code(current_user, request.token):
        return {
            "verified": True, 
            "message": "تم التحقق باستخدام كود الاستعادة",
            "warning": "تم استخدام كود استعادة. يرجى إنشاء أكواد جديدة"
        }
    
    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="رمز التحقق غير صحيح"
    )

@router.post("/2fa/disable")
async def disable_2fa(
    password: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Disable 2FA"""
    if not verify_password(password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="كلمة المرور غير صحيحة"
        )
    
    current_user.two_factor_enabled = False
    current_user.two_factor_secret = None
    current_user.backup_codes = None
    db.commit()
    
    return {"message": "تم إلغاء تفعيل المصادقة الثنائية"}

@router.post("/password/change")
async def change_password(
    request: PasswordChangeRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Change user password"""
    # Verify current password
    if not verify_password(request.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="كلمة المرور الحالية غير صحيحة"
        )
    
    # Check new password confirmation
    if request.new_password != request.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="كلمة المرور الجديدة غير متطابقة"
        )
    
    # Check password strength
    security_service = SecurityService(db)
    strength_check = security_service.check_password_strength(request.new_password)
    
    if not strength_check["is_strong"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "message": "كلمة المرور ضعيفة",
                "feedback": strength_check["feedback"]
            }
        )
    
    # Update password
    current_user.hashed_password = hash_password(request.new_password)
    current_user.password_changed_at = datetime.utcnow()
    db.commit()
    
    return {"message": "تم تغيير كلمة المرور بنجاح"}

@router.get("/settings", response_model=SecuritySettingsResponse)
async def get_security_settings(
    current_user: User = Depends(get_current_user)
):
    """Get user security settings"""
    backup_codes_count = 0
    if current_user.backup_codes:
        backup_codes_count = len(current_user.backup_codes.split(","))
    
    return SecuritySettingsResponse(
        two_factor_enabled=current_user.two_factor_enabled or False,
        last_password_change=current_user.password_changed_at,
        login_attempts=0,  # You'll need to implement this
        account_locked=False,  # You'll need to implement this
        backup_codes_count=backup_codes_count,
        security_questions_set=False  # You'll need to implement this
    )

@router.post("/audit/log")
async def log_security_event(
    event: SecurityAuditLog,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Log security event"""
    # Implementation for logging security events
    return {"message": "تم تسجيل الحدث الأمني"}

@router.get("/audit/logs")
async def get_security_logs(
    limit: int = 50,
    offset: int = 0,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get security audit logs"""
    # Implementation for retrieving security logs
    return {"logs": [], "total": 0}

# Helper functions (you'll need to implement these)
def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against hash"""
    # Implement password verification
    pass

def hash_password(password: str) -> str:
    """Hash password"""
    # Implement password hashing
    pass
