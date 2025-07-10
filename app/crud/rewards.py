"""
CRUD operations لنظام المكافآت والحوافز
Rewards and Incentives CRUD
"""

from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func, extract
from typing import List, Optional, Dict
from datetime import date, datetime, timedelta

from app.models_rewards import (
    Reward, RewardCriteria, WorkerReward, Incentive, 
    IncentiveProgram, PerformanceBonus, SalesCommission
)
from app.schemas.rewards import (
    RewardCreate, RewardUpdate,
    RewardCriteriaCreate, RewardCriteriaUpdate,
    WorkerRewardCreate, WorkerRewardUpdate,
    IncentiveCreate, IncentiveUpdate,
    IncentiveProgramCreate, IncentiveProgramUpdate,
    PerformanceBonusCreate, PerformanceBonusUpdate,
    SalesCommissionCreate, SalesCommissionUpdate,
    RewardsSummary, RewardsStatistics
)

# Reward CRUD Operations
def create_reward(db: Session, reward: RewardCreate) -> Reward:
    """إنشاء مكافأة جديدة"""
    db_reward = Reward(**reward.dict())
    db.add(db_reward)
    db.commit()
    db.refresh(db_reward)
    return db_reward

def get_reward(db: Session, reward_id: int) -> Optional[Reward]:
    """الحصول على مكافأة بالمعرف"""
    return db.query(Reward).filter(Reward.id == reward_id).first()

def get_rewards(db: Session, skip: int = 0, limit: int = 100, active_only: bool = True) -> List[Reward]:
    """الحصول على جميع المكافآت"""
    query = db.query(Reward)
    if active_only:
        query = query.filter(Reward.is_active == True)
    return query.offset(skip).limit(limit).all()

def get_rewards_by_type(db: Session, reward_type: str) -> List[Reward]:
    """الحصول على المكافآت حسب النوع"""
    return db.query(Reward).filter(
        and_(
            Reward.reward_type == reward_type,
            Reward.is_active == True
        )
    ).all()

def update_reward(db: Session, reward_id: int, reward: RewardUpdate) -> Optional[Reward]:
    """تحديث مكافأة"""
    db_reward = db.query(Reward).filter(Reward.id == reward_id).first()
    if db_reward:
        update_data = reward.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_reward, field, value)
        db.commit()
        db.refresh(db_reward)
    return db_reward

def delete_reward(db: Session, reward_id: int) -> bool:
    """حذف مكافأة (إلغاء تفعيل)"""
    db_reward = db.query(Reward).filter(Reward.id == reward_id).first()
    if db_reward:
        db_reward.is_active = False
        db.commit()
        return True
    return False

def search_rewards(db: Session, query: str, reward_type: Optional[str] = None) -> List[Reward]:
    """البحث في المكافآت"""
    search_query = db.query(Reward).filter(Reward.is_active == True)
    
    if query:
        search_query = search_query.filter(
            or_(
                Reward.name.contains(query),
                Reward.description.contains(query)
            )
        )
    
    if reward_type:
        search_query = search_query.filter(Reward.reward_type == reward_type)
    
    return search_query.all()

# Reward Criteria CRUD Operations
def create_reward_criteria(db: Session, criteria: RewardCriteriaCreate) -> RewardCriteria:
    """إنشاء معايير مكافأة جديدة"""
    db_criteria = RewardCriteria(**criteria.dict())
    db.add(db_criteria)
    db.commit()
    db.refresh(db_criteria)
    return db_criteria

def get_reward_criteria(db: Session, criteria_id: int) -> Optional[RewardCriteria]:
    """الحصول على معايير مكافأة بالمعرف"""
    return db.query(RewardCriteria).filter(RewardCriteria.id == criteria_id).first()

def get_criteria_by_reward(db: Session, reward_id: int) -> List[RewardCriteria]:
    """الحصول على معايير المكافأة"""
    return db.query(RewardCriteria).filter(
        RewardCriteria.reward_id == reward_id
    ).all()

def update_reward_criteria(db: Session, criteria_id: int, criteria: RewardCriteriaUpdate) -> Optional[RewardCriteria]:
    """تحديث معايير مكافأة"""
    db_criteria = db.query(RewardCriteria).filter(RewardCriteria.id == criteria_id).first()
    if db_criteria:
        update_data = criteria.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_criteria, field, value)
        db.commit()
        db.refresh(db_criteria)
    return db_criteria

def delete_reward_criteria(db: Session, criteria_id: int) -> bool:
    """حذف معايير مكافأة"""
    db_criteria = db.query(RewardCriteria).filter(RewardCriteria.id == criteria_id).first()
    if db_criteria:
        db.delete(db_criteria)
        db.commit()
        return True
    return False

# Worker Reward CRUD Operations
def create_worker_reward(db: Session, worker_reward: WorkerRewardCreate) -> WorkerReward:
    """منح مكافأة للعامل"""
    db_worker_reward = WorkerReward(**worker_reward.dict())
    db.add(db_worker_reward)
    db.commit()
    db.refresh(db_worker_reward)
    return db_worker_reward

def get_worker_reward(db: Session, worker_reward_id: int) -> Optional[WorkerReward]:
    """الحصول على مكافأة العامل بالمعرف"""
    return db.query(WorkerReward).filter(WorkerReward.id == worker_reward_id).first()

def get_worker_rewards(db: Session, worker_id: int) -> List[WorkerReward]:
    """الحصول على مكافآت العامل"""
    return db.query(WorkerReward).filter(
        WorkerReward.worker_id == worker_id
    ).order_by(WorkerReward.awarded_date.desc()).all()

def get_rewards_by_period(db: Session, start_date: date, end_date: date) -> List[WorkerReward]:
    """الحصول على المكافآت خلال فترة معينة"""
    return db.query(WorkerReward).filter(
        WorkerReward.awarded_date.between(start_date, end_date)
    ).all()

def get_pending_approvals(db: Session) -> List[WorkerReward]:
    """الحصول على المكافآت المعلقة الموافقة"""
    return db.query(WorkerReward).filter(
        WorkerReward.approval_status == "pending"
    ).all()

def approve_worker_reward(db: Session, worker_reward_id: int, approved_by: str) -> Optional[WorkerReward]:
    """الموافقة على مكافأة العامل"""
    db_worker_reward = db.query(WorkerReward).filter(WorkerReward.id == worker_reward_id).first()
    if db_worker_reward:
        db_worker_reward.approval_status = "approved"
        db_worker_reward.approved_by = approved_by
        db_worker_reward.approved_date = datetime.now().date()
        db.commit()
        db.refresh(db_worker_reward)
    return db_worker_reward

def reject_worker_reward(db: Session, worker_reward_id: int, rejected_by: str, rejection_reason: str) -> Optional[WorkerReward]:
    """رفض مكافأة العامل"""
    db_worker_reward = db.query(WorkerReward).filter(WorkerReward.id == worker_reward_id).first()
    if db_worker_reward:
        db_worker_reward.approval_status = "rejected"
        db_worker_reward.approved_by = rejected_by
        db_worker_reward.approved_date = datetime.now().date()
        db_worker_reward.notes = f"مرفوض: {rejection_reason}"
        db.commit()
        db.refresh(db_worker_reward)
    return db_worker_reward

def update_worker_reward(db: Session, worker_reward_id: int, worker_reward: WorkerRewardUpdate) -> Optional[WorkerReward]:
    """تحديث مكافأة العامل"""
    db_worker_reward = db.query(WorkerReward).filter(WorkerReward.id == worker_reward_id).first()
    if db_worker_reward:
        update_data = worker_reward.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_worker_reward, field, value)
        db.commit()
        db.refresh(db_worker_reward)
    return db_worker_reward

# Incentive CRUD Operations
def create_incentive(db: Session, incentive: IncentiveCreate) -> Incentive:
    """إنشاء حافز جديد"""
    db_incentive = Incentive(**incentive.dict())
    db.add(db_incentive)
    db.commit()
    db.refresh(db_incentive)
    return db_incentive

def get_incentive(db: Session, incentive_id: int) -> Optional[Incentive]:
    """الحصول على حافز بالمعرف"""
    return db.query(Incentive).filter(Incentive.id == incentive_id).first()

def get_incentives(db: Session, active_only: bool = True) -> List[Incentive]:
    """الحصول على جميع الحوافز"""
    query = db.query(Incentive)
    if active_only:
        query = query.filter(Incentive.is_active == True)
    return query.all()

def get_active_incentives_for_worker(db: Session, worker_id: int) -> List[Incentive]:
    """الحصول على الحوافز النشطة للعامل"""
    today = date.today()
    return db.query(Incentive).filter(
        and_(
            Incentive.is_active == True,
            or_(
                Incentive.target_workers.is_(None),
                Incentive.target_workers.contains(str(worker_id))
            ),
            or_(
                Incentive.start_date.is_(None),
                Incentive.start_date <= today
            ),
            or_(
                Incentive.end_date.is_(None),
                Incentive.end_date >= today
            )
        )
    ).all()

def update_incentive(db: Session, incentive_id: int, incentive: IncentiveUpdate) -> Optional[Incentive]:
    """تحديث حافز"""
    db_incentive = db.query(Incentive).filter(Incentive.id == incentive_id).first()
    if db_incentive:
        update_data = incentive.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_incentive, field, value)
        db.commit()
        db.refresh(db_incentive)
    return db_incentive

def delete_incentive(db: Session, incentive_id: int) -> bool:
    """حذف حافز (إلغاء تفعيل)"""
    db_incentive = db.query(Incentive).filter(Incentive.id == incentive_id).first()
    if db_incentive:
        db_incentive.is_active = False
        db.commit()
        return True
    return False

# Incentive Program CRUD Operations
def create_incentive_program(db: Session, program: IncentiveProgramCreate) -> IncentiveProgram:
    """إنشاء برنامج حوافز جديد"""
    db_program = IncentiveProgram(**program.dict())
    db.add(db_program)
    db.commit()
    db.refresh(db_program)
    return db_program

def get_incentive_program(db: Session, program_id: int) -> Optional[IncentiveProgram]:
    """الحصول على برنامج حوافز بالمعرف"""
    return db.query(IncentiveProgram).filter(IncentiveProgram.id == program_id).first()

def get_incentive_programs(db: Session, active_only: bool = True) -> List[IncentiveProgram]:
    """الحصول على جميع برامج الحوافز"""
    query = db.query(IncentiveProgram)
    if active_only:
        query = query.filter(IncentiveProgram.is_active == True)
    return query.all()

def update_incentive_program(db: Session, program_id: int, program: IncentiveProgramUpdate) -> Optional[IncentiveProgram]:
    """تحديث برنامج حوافز"""
    db_program = db.query(IncentiveProgram).filter(IncentiveProgram.id == program_id).first()
    if db_program:
        update_data = program.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_program, field, value)
        db.commit()
        db.refresh(db_program)
    return db_program

# Performance Bonus CRUD Operations
def create_performance_bonus(db: Session, bonus: PerformanceBonusCreate) -> PerformanceBonus:
    """إنشاء مكافأة أداء جديدة"""
    db_bonus = PerformanceBonus(**bonus.dict())
    db.add(db_bonus)
    db.commit()
    db.refresh(db_bonus)
    return db_bonus

def get_performance_bonus(db: Session, bonus_id: int) -> Optional[PerformanceBonus]:
    """الحصول على مكافأة أداء بالمعرف"""
    return db.query(PerformanceBonus).filter(PerformanceBonus.id == bonus_id).first()

def get_performance_bonuses_by_worker(db: Session, worker_id: int) -> List[PerformanceBonus]:
    """الحصول على مكافآت الأداء للعامل"""
    return db.query(PerformanceBonus).filter(
        PerformanceBonus.worker_id == worker_id
    ).order_by(PerformanceBonus.evaluation_date.desc()).all()

def get_performance_bonuses_by_period(db: Session, start_date: date, end_date: date) -> List[PerformanceBonus]:
    """الحصول على مكافآت الأداء خلال فترة معينة"""
    return db.query(PerformanceBonus).filter(
        PerformanceBonus.evaluation_date.between(start_date, end_date)
    ).all()

def update_performance_bonus(db: Session, bonus_id: int, bonus: PerformanceBonusUpdate) -> Optional[PerformanceBonus]:
    """تحديث مكافأة أداء"""
    db_bonus = db.query(PerformanceBonus).filter(PerformanceBonus.id == bonus_id).first()
    if db_bonus:
        update_data = bonus.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_bonus, field, value)
        db.commit()
        db.refresh(db_bonus)
    return db_bonus

# Sales Commission CRUD Operations
def create_sales_commission(db: Session, commission: SalesCommissionCreate) -> SalesCommission:
    """إنشاء عمولة مبيعات جديدة"""
    db_commission = SalesCommission(**commission.dict())
    db.add(db_commission)
    db.commit()
    db.refresh(db_commission)
    return db_commission

def get_sales_commission(db: Session, commission_id: int) -> Optional[SalesCommission]:
    """الحصول على عمولة مبيعات بالمعرف"""
    return db.query(SalesCommission).filter(SalesCommission.id == commission_id).first()

def get_sales_commissions_by_worker(db: Session, worker_id: int) -> List[SalesCommission]:
    """الحصول على عمولات المبيعات للعامل"""
    return db.query(SalesCommission).filter(
        SalesCommission.worker_id == worker_id
    ).order_by(SalesCommission.sale_date.desc()).all()

def get_sales_commissions_by_period(db: Session, start_date: date, end_date: date) -> List[SalesCommission]:
    """الحصول على عمولات المبيعات خلال فترة معينة"""
    return db.query(SalesCommission).filter(
        SalesCommission.sale_date.between(start_date, end_date)
    ).all()

def update_sales_commission(db: Session, commission_id: int, commission: SalesCommissionUpdate) -> Optional[SalesCommission]:
    """تحديث عمولة مبيعات"""
    db_commission = db.query(SalesCommission).filter(SalesCommission.id == commission_id).first()
    if db_commission:
        update_data = commission.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_commission, field, value)
        db.commit()
        db.refresh(db_commission)
    return db_commission

# Statistics and Reports
def get_rewards_statistics(db: Session) -> RewardsStatistics:
    """الحصول على إحصائيات المكافآت والحوافز"""
    # إجمالي المكافآت النشطة
    total_active_rewards = db.query(Reward).filter(Reward.is_active == True).count()
    
    # إجمالي الحوافز النشطة
    total_active_incentives = db.query(Incentive).filter(Incentive.is_active == True).count()
    
    # المكافآت المعلقة الموافقة
    pending_approvals = db.query(WorkerReward).filter(
        WorkerReward.approval_status == "pending"
    ).count()
    
    # إجمالي المكافآت المدفوعة هذا الشهر
    current_month_start = date.today().replace(day=1)
    total_paid_this_month = db.query(func.sum(WorkerReward.amount)).filter(
        and_(
            WorkerReward.awarded_date >= current_month_start,
            WorkerReward.approval_status == "approved"
        )
    ).scalar() or 0.0
    
    # أفضل العمال من ناحية المكافآت (آخر 30 يوم)
    thirty_days_ago = date.today() - timedelta(days=30)
    top_performers = db.query(
        WorkerReward.worker_id,
        func.count(WorkerReward.id).label('reward_count'),
        func.sum(WorkerReward.amount).label('total_amount')
    ).filter(
        and_(
            WorkerReward.awarded_date >= thirty_days_ago,
            WorkerReward.approval_status == "approved"
        )
    ).group_by(WorkerReward.worker_id).order_by(
        func.sum(WorkerReward.amount).desc()
    ).limit(5).all()
    
    # تصنيف المكافآت حسب النوع
    reward_types_stats = db.query(
        Reward.reward_type,
        func.count(WorkerReward.id).label('count'),
        func.sum(WorkerReward.amount).label('total_amount')
    ).join(WorkerReward).filter(
        and_(
            WorkerReward.awarded_date >= thirty_days_ago,
            WorkerReward.approval_status == "approved"
        )
    ).group_by(Reward.reward_type).all()
    
    reward_types_breakdown = {
        reward_type: {'count': count, 'total_amount': float(total_amount or 0)}
        for reward_type, count, total_amount in reward_types_stats
    }
    
    # متوسط قيمة المكافأة
    avg_reward_amount = db.query(func.avg(WorkerReward.amount)).filter(
        and_(
            WorkerReward.awarded_date >= thirty_days_ago,
            WorkerReward.approval_status == "approved"
        )
    ).scalar() or 0.0
    
    return RewardsStatistics(
        total_active_rewards=total_active_rewards,
        total_active_incentives=total_active_incentives,
        pending_approvals=pending_approvals,
        total_paid_this_month=float(total_paid_this_month),
        top_performers=[
            {
                'worker_id': worker_id,
                'reward_count': reward_count,
                'total_amount': float(total_amount or 0)
            }
            for worker_id, reward_count, total_amount in top_performers
        ],
        reward_types_breakdown=reward_types_breakdown,
        average_reward_amount=float(avg_reward_amount)
    )

def get_worker_rewards_summary(db: Session, worker_id: int) -> Optional[RewardsSummary]:
    """الحصول على ملخص مكافآت العامل"""
    from app.models import Worker
    
    worker = db.query(Worker).filter(Worker.id == worker_id).first()
    if not worker:
        return None
    
    # إجمالي المكافآت
    total_rewards = db.query(WorkerReward).filter(
        and_(
            WorkerReward.worker_id == worker_id,
            WorkerReward.approval_status == "approved"
        )
    ).count()
    
    # إجمالي المبلغ
    total_amount = db.query(func.sum(WorkerReward.amount)).filter(
        and_(
            WorkerReward.worker_id == worker_id,
            WorkerReward.approval_status == "approved"
        )
    ).scalar() or 0.0
    
    # المكافآت هذا الشهر
    current_month_start = date.today().replace(day=1)
    rewards_this_month = db.query(WorkerReward).filter(
        and_(
            WorkerReward.worker_id == worker_id,
            WorkerReward.awarded_date >= current_month_start,
            WorkerReward.approval_status == "approved"
        )
    ).count()
    
    # المبلغ هذا الشهر
    amount_this_month = db.query(func.sum(WorkerReward.amount)).filter(
        and_(
            WorkerReward.worker_id == worker_id,
            WorkerReward.awarded_date >= current_month_start,
            WorkerReward.approval_status == "approved"
        )
    ).scalar() or 0.0
    
    # آخر مكافأة
    last_reward = db.query(WorkerReward).filter(
        WorkerReward.worker_id == worker_id
    ).order_by(WorkerReward.awarded_date.desc()).first()
    
    return RewardsSummary(
        worker_id=worker_id,
        worker_name=f"{worker.first_name} {worker.last_name}",
        total_rewards=total_rewards,
        total_amount=float(total_amount),
        rewards_this_month=rewards_this_month,
        amount_this_month=float(amount_this_month),
        last_reward_date=last_reward.awarded_date if last_reward else None,
        last_reward_amount=float(last_reward.amount) if last_reward else 0.0
    )
