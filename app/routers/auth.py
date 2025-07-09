from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app import schemas, crud, models
from app.database import get_db
from jose import jwt, JWTError
from datetime import timedelta, datetime

SECRET_KEY = "your_secret_key_here"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=schemas.UserOut)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    if crud.users.get_user_by_username(db, user.username):
        raise HTTPException(status_code=400, detail="Username already registered")
    if crud.users.get_user_by_email(db, user.email):
        raise HTTPException(status_code=400, detail="Email already registered")
    db_user = crud.users.create_user(db, user.username, user.email, user.password, user.role)
    return db_user

@router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = crud.users.get_user_by_username(db, form_data.username)
    if not user or not crud.users.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect username or password")
    
    # التحقق من أن المستخدم نشط
    if not user.is_active:
        raise HTTPException(status_code=401, detail="User account is disabled")
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username, "user_id": user.id, "role": user.role}, 
        expires_delta=access_token_expires
    )
    
    # تسجيل عملية الدخول
    from app.crud import permissions as crud_permissions
    from app.schemas_permissions import ActivityLogCreate
    
    crud_permissions.create_activity_log(db, ActivityLogCreate(
        user_id=user.id,
        action="login",
        description=f"تسجيل دخول المستخدم {user.username}"
    ))
    
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "role": user.role,
            "full_name": user.full_name
        }
    }

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """الحصول على المستخدم الحالي من التوكن"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = crud.users.get_user_by_username(db, username)
    if user is None or not user.is_active:
        raise credentials_exception
    
    return user

@router.post("/logout")
def logout(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    """تسجيل خروج المستخدم"""
    # تسجيل عملية الخروج
    from app.crud import permissions as crud_permissions
    from app.schemas_permissions import ActivityLogCreate
    
    crud_permissions.create_activity_log(db, ActivityLogCreate(
        user_id=current_user.id,
        action="logout",
        description=f"تسجيل خروج المستخدم {current_user.username}"
    ))
    
    return {"message": "تم تسجيل الخروج بنجاح"}
