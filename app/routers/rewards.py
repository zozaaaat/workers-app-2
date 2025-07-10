"""
API Router لنظام المكافآت والحوافز
Rewards and Incentives Router
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date

from app.database import get_db
from app.schemas.rewards import (
    Reward, RewardCreate, RewardUpdate,
    RewardCriteria, RewardCriteriaCreate, RewardCriteriaUpdate,
    WorkerReward, WorkerRewardCreate, WorkerRewardUpdate,
    Incentive, IncentiveCreate, IncentiveUpdate,
    IncentiveProgram, IncentiveProgramCreate, IncentiveProgramUpdate,
    PerformanceBonus, PerformanceBonusCreate, PerformanceBonusUpdate,
    SalesCommission, SalesCommissionCreate, SalesCommissionUpdate,
    RewardsSummary, RewardsStatistics
)
from app.crud import rewards as crud_rewards

router = APIRouter(prefix="/api/rewards", tags=["rewards"])

# Rewards Endpoints
@router.post("/", response_model=Reward)
def create_reward(
    reward: RewardCreate,
    db: Session = Depends(get_db)
):
    """إنشاء مكافأة جديدة"""
    return crud_rewards.create_reward(db, reward)

@router.get("/", response_model=List[Reward])
def get_rewards(
    skip: int = 0,
    limit: int = 100,
    active_only: bool = True,
    reward_type: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """الحصول على جميع المكافآت مع إمكانية البحث والتصفية"""
    if search or reward_type:
        return crud_rewards.search_rewards(db, search or "", reward_type)
    return crud_rewards.get_rewards(db, skip=skip, limit=limit, active_only=active_only)

@router.get("/{reward_id}", response_model=Reward)
def get_reward(reward_id: int, db: Session = Depends(get_db)):
    """الحصول على مكافأة بالمعرف"""
    reward = crud_rewards.get_reward(db, reward_id)
    if not reward:
        raise HTTPException(status_code=404, detail="المكافأة غير موجودة")
    return reward

@router.put("/{reward_id}", response_model=Reward)
def update_reward(
    reward_id: int,
    reward: RewardUpdate,
    db: Session = Depends(get_db)
):
    """تحديث مكافأة"""
    updated_reward = crud_rewards.update_reward(db, reward_id, reward)
    if not updated_reward:
        raise HTTPException(status_code=404, detail="المكافأة غير موجودة")
    return updated_reward

@router.delete("/{reward_id}")
def delete_reward(reward_id: int, db: Session = Depends(get_db)):
    """حذف مكافأة (إلغاء تفعيل)"""
    success = crud_rewards.delete_reward(db, reward_id)
    if not success:
        raise HTTPException(status_code=404, detail="المكافأة غير موجودة")
    return {"message": "تم حذف المكافأة بنجاح"}

@router.get("/type/{reward_type}", response_model=List[Reward])
def get_rewards_by_type(reward_type: str, db: Session = Depends(get_db)):
    """الحصول على المكافآت حسب النوع"""
    return crud_rewards.get_rewards_by_type(db, reward_type)

# Reward Criteria Endpoints
@router.post("/criteria/", response_model=RewardCriteria)
def create_reward_criteria(
    criteria: RewardCriteriaCreate,
    db: Session = Depends(get_db)
):
    """إنشاء معايير مكافأة جديدة"""
    # التحقق من وجود المكافأة
    reward = crud_rewards.get_reward(db, criteria.reward_id)
    if not reward:
        raise HTTPException(status_code=404, detail="المكافأة غير موجودة")
    
    return crud_rewards.create_reward_criteria(db, criteria)

@router.get("/criteria/{criteria_id}", response_model=RewardCriteria)
def get_reward_criteria(criteria_id: int, db: Session = Depends(get_db)):
    """الحصول على معايير مكافأة بالمعرف"""
    criteria = crud_rewards.get_reward_criteria(db, criteria_id)
    if not criteria:
        raise HTTPException(status_code=404, detail="معايير المكافأة غير موجودة")
    return criteria

@router.get("/{reward_id}/criteria/", response_model=List[RewardCriteria])
def get_criteria_by_reward(reward_id: int, db: Session = Depends(get_db)):
    """الحصول على معايير المكافأة"""
    return crud_rewards.get_criteria_by_reward(db, reward_id)

@router.put("/criteria/{criteria_id}", response_model=RewardCriteria)
def update_reward_criteria(
    criteria_id: int,
    criteria: RewardCriteriaUpdate,
    db: Session = Depends(get_db)
):
    """تحديث معايير مكافأة"""
    updated_criteria = crud_rewards.update_reward_criteria(db, criteria_id, criteria)
    if not updated_criteria:
        raise HTTPException(status_code=404, detail="معايير المكافأة غير موجودة")
    return updated_criteria

@router.delete("/criteria/{criteria_id}")
def delete_reward_criteria(criteria_id: int, db: Session = Depends(get_db)):
    """حذف معايير مكافأة"""
    success = crud_rewards.delete_reward_criteria(db, criteria_id)
    if not success:
        raise HTTPException(status_code=404, detail="معايير المكافأة غير موجودة")
    return {"message": "تم حذف معايير المكافأة بنجاح"}

# Worker Rewards Endpoints
@router.post("/worker-rewards/", response_model=WorkerReward)
def create_worker_reward(
    worker_reward: WorkerRewardCreate,
    db: Session = Depends(get_db)
):
    """منح مكافأة للعامل"""
    # التحقق من وجود المكافأة
    reward = crud_rewards.get_reward(db, worker_reward.reward_id)
    if not reward:
        raise HTTPException(status_code=404, detail="المكافأة غير موجودة")
    
    return crud_rewards.create_worker_reward(db, worker_reward)

@router.get("/worker-rewards/", response_model=List[WorkerReward])
def get_worker_rewards_by_period(
    start_date: date = Query(...),
    end_date: date = Query(...),
    db: Session = Depends(get_db)
):
    """الحصول على المكافآت خلال فترة معينة"""
    return crud_rewards.get_rewards_by_period(db, start_date, end_date)

@router.get("/worker-rewards/{worker_reward_id}", response_model=WorkerReward)
def get_worker_reward(worker_reward_id: int, db: Session = Depends(get_db)):
    """الحصول على مكافأة العامل بالمعرف"""
    worker_reward = crud_rewards.get_worker_reward(db, worker_reward_id)
    if not worker_reward:
        raise HTTPException(status_code=404, detail="مكافأة العامل غير موجودة")
    return worker_reward

@router.get("/worker-rewards/worker/{worker_id}", response_model=List[WorkerReward])
def get_worker_rewards(worker_id: int, db: Session = Depends(get_db)):
    """الحصول على مكافآت العامل"""
    return crud_rewards.get_worker_rewards(db, worker_id)

@router.get("/worker-rewards/pending/approvals/", response_model=List[WorkerReward])
def get_pending_approvals(db: Session = Depends(get_db)):
    """الحصول على المكافآت المعلقة الموافقة"""
    return crud_rewards.get_pending_approvals(db)

@router.put("/worker-rewards/{worker_reward_id}", response_model=WorkerReward)
def update_worker_reward(
    worker_reward_id: int,
    worker_reward: WorkerRewardUpdate,
    db: Session = Depends(get_db)
):
    """تحديث مكافأة العامل"""
    updated_reward = crud_rewards.update_worker_reward(db, worker_reward_id, worker_reward)
    if not updated_reward:
        raise HTTPException(status_code=404, detail="مكافأة العامل غير موجودة")
    return updated_reward

@router.post("/worker-rewards/{worker_reward_id}/approve", response_model=WorkerReward)
def approve_worker_reward(
    worker_reward_id: int,
    approved_by: str,
    db: Session = Depends(get_db)
):
    """الموافقة على مكافأة العامل"""
    approved_reward = crud_rewards.approve_worker_reward(db, worker_reward_id, approved_by)
    if not approved_reward:
        raise HTTPException(status_code=404, detail="مكافأة العامل غير موجودة")
    return approved_reward

@router.post("/worker-rewards/{worker_reward_id}/reject", response_model=WorkerReward)
def reject_worker_reward(
    worker_reward_id: int,
    rejected_by: str,
    rejection_reason: str,
    db: Session = Depends(get_db)
):
    """رفض مكافأة العامل"""
    rejected_reward = crud_rewards.reject_worker_reward(db, worker_reward_id, rejected_by, rejection_reason)
    if not rejected_reward:
        raise HTTPException(status_code=404, detail="مكافأة العامل غير موجودة")
    return rejected_reward

# Incentives Endpoints
@router.post("/incentives/", response_model=Incentive)
def create_incentive(
    incentive: IncentiveCreate,
    db: Session = Depends(get_db)
):
    """إنشاء حافز جديد"""
    return crud_rewards.create_incentive(db, incentive)

@router.get("/incentives/", response_model=List[Incentive])
def get_incentives(
    active_only: bool = True,
    db: Session = Depends(get_db)
):
    """الحصول على جميع الحوافز"""
    return crud_rewards.get_incentives(db, active_only=active_only)

@router.get("/incentives/{incentive_id}", response_model=Incentive)
def get_incentive(incentive_id: int, db: Session = Depends(get_db)):
    """الحصول على حافز بالمعرف"""
    incentive = crud_rewards.get_incentive(db, incentive_id)
    if not incentive:
        raise HTTPException(status_code=404, detail="الحافز غير موجود")
    return incentive

@router.get("/incentives/worker/{worker_id}", response_model=List[Incentive])
def get_active_incentives_for_worker(worker_id: int, db: Session = Depends(get_db)):
    """الحصول على الحوافز النشطة للعامل"""
    return crud_rewards.get_active_incentives_for_worker(db, worker_id)

@router.put("/incentives/{incentive_id}", response_model=Incentive)
def update_incentive(
    incentive_id: int,
    incentive: IncentiveUpdate,
    db: Session = Depends(get_db)
):
    """تحديث حافز"""
    updated_incentive = crud_rewards.update_incentive(db, incentive_id, incentive)
    if not updated_incentive:
        raise HTTPException(status_code=404, detail="الحافز غير موجود")
    return updated_incentive

@router.delete("/incentives/{incentive_id}")
def delete_incentive(incentive_id: int, db: Session = Depends(get_db)):
    """حذف حافز (إلغاء تفعيل)"""
    success = crud_rewards.delete_incentive(db, incentive_id)
    if not success:
        raise HTTPException(status_code=404, detail="الحافز غير موجود")
    return {"message": "تم حذف الحافز بنجاح"}

# Incentive Programs Endpoints
@router.post("/programs/", response_model=IncentiveProgram)
def create_incentive_program(
    program: IncentiveProgramCreate,
    db: Session = Depends(get_db)
):
    """إنشاء برنامج حوافز جديد"""
    return crud_rewards.create_incentive_program(db, program)

@router.get("/programs/", response_model=List[IncentiveProgram])
def get_incentive_programs(
    active_only: bool = True,
    db: Session = Depends(get_db)
):
    """الحصول على جميع برامج الحوافز"""
    return crud_rewards.get_incentive_programs(db, active_only=active_only)

@router.get("/programs/{program_id}", response_model=IncentiveProgram)
def get_incentive_program(program_id: int, db: Session = Depends(get_db)):
    """الحصول على برنامج حوافز بالمعرف"""
    program = crud_rewards.get_incentive_program(db, program_id)
    if not program:
        raise HTTPException(status_code=404, detail="برنامج الحوافز غير موجود")
    return program

@router.put("/programs/{program_id}", response_model=IncentiveProgram)
def update_incentive_program(
    program_id: int,
    program: IncentiveProgramUpdate,
    db: Session = Depends(get_db)
):
    """تحديث برنامج حوافز"""
    updated_program = crud_rewards.update_incentive_program(db, program_id, program)
    if not updated_program:
        raise HTTPException(status_code=404, detail="برنامج الحوافز غير موجود")
    return updated_program

# Performance Bonuses Endpoints
@router.post("/performance-bonuses/", response_model=PerformanceBonus)
def create_performance_bonus(
    bonus: PerformanceBonusCreate,
    db: Session = Depends(get_db)
):
    """إنشاء مكافأة أداء جديدة"""
    return crud_rewards.create_performance_bonus(db, bonus)

@router.get("/performance-bonuses/", response_model=List[PerformanceBonus])
def get_performance_bonuses_by_period(
    start_date: date = Query(...),
    end_date: date = Query(...),
    db: Session = Depends(get_db)
):
    """الحصول على مكافآت الأداء خلال فترة معينة"""
    return crud_rewards.get_performance_bonuses_by_period(db, start_date, end_date)

@router.get("/performance-bonuses/{bonus_id}", response_model=PerformanceBonus)
def get_performance_bonus(bonus_id: int, db: Session = Depends(get_db)):
    """الحصول على مكافأة أداء بالمعرف"""
    bonus = crud_rewards.get_performance_bonus(db, bonus_id)
    if not bonus:
        raise HTTPException(status_code=404, detail="مكافأة الأداء غير موجودة")
    return bonus

@router.get("/performance-bonuses/worker/{worker_id}", response_model=List[PerformanceBonus])
def get_performance_bonuses_by_worker(worker_id: int, db: Session = Depends(get_db)):
    """الحصول على مكافآت الأداء للعامل"""
    return crud_rewards.get_performance_bonuses_by_worker(db, worker_id)

@router.put("/performance-bonuses/{bonus_id}", response_model=PerformanceBonus)
def update_performance_bonus(
    bonus_id: int,
    bonus: PerformanceBonusUpdate,
    db: Session = Depends(get_db)
):
    """تحديث مكافأة أداء"""
    updated_bonus = crud_rewards.update_performance_bonus(db, bonus_id, bonus)
    if not updated_bonus:
        raise HTTPException(status_code=404, detail="مكافأة الأداء غير موجودة")
    return updated_bonus

# Sales Commissions Endpoints
@router.post("/sales-commissions/", response_model=SalesCommission)
def create_sales_commission(
    commission: SalesCommissionCreate,
    db: Session = Depends(get_db)
):
    """إنشاء عمولة مبيعات جديدة"""
    return crud_rewards.create_sales_commission(db, commission)

@router.get("/sales-commissions/", response_model=List[SalesCommission])
def get_sales_commissions_by_period(
    start_date: date = Query(...),
    end_date: date = Query(...),
    db: Session = Depends(get_db)
):
    """الحصول على عمولات المبيعات خلال فترة معينة"""
    return crud_rewards.get_sales_commissions_by_period(db, start_date, end_date)

@router.get("/sales-commissions/{commission_id}", response_model=SalesCommission)
def get_sales_commission(commission_id: int, db: Session = Depends(get_db)):
    """الحصول على عمولة مبيعات بالمعرف"""
    commission = crud_rewards.get_sales_commission(db, commission_id)
    if not commission:
        raise HTTPException(status_code=404, detail="عمولة المبيعات غير موجودة")
    return commission

@router.get("/sales-commissions/worker/{worker_id}", response_model=List[SalesCommission])
def get_sales_commissions_by_worker(worker_id: int, db: Session = Depends(get_db)):
    """الحصول على عمولات المبيعات للعامل"""
    return crud_rewards.get_sales_commissions_by_worker(db, worker_id)

@router.put("/sales-commissions/{commission_id}", response_model=SalesCommission)
def update_sales_commission(
    commission_id: int,
    commission: SalesCommissionUpdate,
    db: Session = Depends(get_db)
):
    """تحديث عمولة مبيعات"""
    updated_commission = crud_rewards.update_sales_commission(db, commission_id, commission)
    if not updated_commission:
        raise HTTPException(status_code=404, detail="عمولة المبيعات غير موجودة")
    return updated_commission

# Statistics and Reports
@router.get("/statistics/", response_model=RewardsStatistics)
def get_rewards_statistics(db: Session = Depends(get_db)):
    """الحصول على إحصائيات المكافآت والحوافز"""
    return crud_rewards.get_rewards_statistics(db)

@router.get("/summary/worker/{worker_id}", response_model=RewardsSummary)
def get_worker_rewards_summary(worker_id: int, db: Session = Depends(get_db)):
    """الحصول على ملخص مكافآت العامل"""
    summary = crud_rewards.get_worker_rewards_summary(db, worker_id)
    if not summary:
        raise HTTPException(status_code=404, detail="لا توجد بيانات للعامل")
    return summary
