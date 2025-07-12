from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database.session import get_db
from app.models.task import Task
from app.schemas.task import TaskCreate, TaskUpdate, TaskResponse
from app.core.security import get_current_user
from app.models.user import User

router = APIRouter()

@router.get("/", response_model=List[TaskResponse])
def get_tasks(
    page: int = 1,
    page_size: int = 20,
    status: Optional[str] = None,
    priority: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """جلب جميع المهام مع التصفية"""
    query = db.query(Task)
    
    if status:
        query = query.filter(Task.status == status)
    if priority:
        query = query.filter(Task.priority == priority)
    
    # إضافة pagination
    offset = (page - 1) * page_size
    tasks = query.offset(offset).limit(page_size).all()
    
    return tasks

@router.get("/my-tasks", response_model=List[TaskResponse])
def get_my_tasks(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """جلب مهام المستخدم الحالي"""
    tasks = db.query(Task).filter(Task.assigned_to_id == current_user.id).all()
    return tasks

@router.get("/{task_id}", response_model=TaskResponse)
def get_task(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """جلب مهمة محددة"""
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="المهمة غير موجودة")
    
    return task

@router.post("/", response_model=TaskResponse)
def create_task(
    task_data: TaskCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """إنشاء مهمة جديدة"""
    task = Task(
        **task_data.dict(),
        created_by_id=current_user.id
    )
    
    db.add(task)
    db.commit()
    db.refresh(task)
    
    return task

@router.put("/{task_id}", response_model=TaskResponse)
def update_task(
    task_id: int,
    task_data: TaskUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """تحديث مهمة"""
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="المهمة غير موجودة")
    
    # تحديث الحقول المُرسلة فقط
    for field, value in task_data.dict(exclude_unset=True).items():
        setattr(task, field, value)
    
    db.commit()
    db.refresh(task)
    
    return task

@router.put("/{task_id}/status", response_model=TaskResponse)
def update_task_status(
    task_id: int,
    status: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """تحديث حالة المهمة"""
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="المهمة غير موجودة")
    
    task.status = status
    db.commit()
    db.refresh(task)
    
    return task

@router.delete("/{task_id}")
def delete_task(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """حذف مهمة"""
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="المهمة غير موجودة")
    
    db.delete(task)
    db.commit()
    
    return {"message": "تم حذف المهمة بنجاح"}
