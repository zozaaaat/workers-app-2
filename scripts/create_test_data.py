"""
Script لإضافة بيانات تجريبية للاختبار
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from app.database import SessionLocal, engine
from app.models import Worker, Company, Leave, Violation, Deduction
from app.models_absence import Absence
from datetime import date, timedelta
import random

def create_test_data():
    db = SessionLocal()
    
    try:
        # التحقق من وجود عمال
        workers = db.query(Worker).all()
        if not workers:
            print("لا توجد عمال في قاعدة البيانات. سأضيف بعض البيانات التجريبية...")
            
            # إضافة شركة تجريبية
            company = Company(
                name="شركة النور للمقاولات",
                address="الرياض، السعودية",
                email="info@alnoor.com",
                phone="+966123456789"
            )
            db.add(company)
            db.commit()
            
            # إضافة عمال تجريبيين
            test_workers = [
                {"name": "أحمد محمد علي", "job_title": "مهندس", "salary": 8000},
                {"name": "محمد أحمد حسن", "job_title": "عامل", "salary": 3000},
                {"name": "سعد عبدالله الحربي", "job_title": "فني", "salary": 4500},
                {"name": "عبدالرحمن سالم", "job_title": "سائق", "salary": 3500},
                {"name": "يوسف إبراهيم", "job_title": "حارس", "salary": 2800}
            ]
            
            for worker_data in test_workers:
                worker = Worker(
                    name=worker_data["name"],
                    job_title=worker_data["job_title"],
                    salary=worker_data["salary"],
                    hire_date=date.today() - timedelta(days=random.randint(30, 365)),
                    company_id=company.id,
                    phone=f"+96650{random.randint(1000000, 9999999)}"
                )
                db.add(worker)
            
            db.commit()
            workers = db.query(Worker).all()
            print(f"تم إضافة {len(workers)} عامل")
        
        # إضافة بيانات تجريبية للإجازات
        existing_leaves = db.query(Leave).count()
        if existing_leaves < 5:
            leave_types = ["سنوية", "مرضية", "بدون راتب", "طارئة", "أمومة"]
            
            for i in range(10):
                worker = random.choice(workers)
                start_date = date.today() - timedelta(days=random.randint(1, 180))
                end_date = start_date + timedelta(days=random.randint(1, 14))
                
                leave = Leave(
                    worker_id=worker.id,
                    leave_type=random.choice(leave_types),
                    start_date=start_date,
                    end_date=end_date,
                    notes=f"إجازة {random.choice(leave_types)} للعامل {worker.name}"
                )
                db.add(leave)
            
            db.commit()
            print(f"تم إضافة إجازات تجريبية")
        
        # إضافة بيانات تجريبية للغيابات
        existing_absences = db.query(Absence).count()
        if existing_absences < 5:
            absence_reasons = ["مرض", "ظروف طارئة", "غياب بدون عذر", "مشكلة شخصية", "عذر عائلي"]
            
            for i in range(15):
                worker = random.choice(workers)
                absence_date = date.today() - timedelta(days=random.randint(1, 90))
                
                absence = Absence(
                    worker_id=worker.id,
                    date=absence_date,
                    reason=random.choice(absence_reasons),
                    is_excused=random.choice([True, False])
                )
                db.add(absence)
            
            db.commit()
            print(f"تم إضافة غيابات تجريبية")
        
        # إضافة بيانات تجريبية للمخالفات
        existing_violations = db.query(Violation).count()
        if existing_violations < 5:
            violation_descriptions = [
                "التأخير عن العمل",
                "عدم ارتداء معدات السلامة",
                "مخالفة تعليمات العمل",
                "السلوك غير اللائق",
                "إهمال الواجبات"
            ]
            
            for i in range(8):
                worker = random.choice(workers)
                violation_date = date.today() - timedelta(days=random.randint(1, 120))
                
                violation = Violation(
                    worker_id=worker.id,
                    description=random.choice(violation_descriptions),
                    penalty_amount=random.choice([100, 200, 300, 500, 1000]),
                    date=violation_date
                )
                db.add(violation)
            
            db.commit()
            print(f"تم إضافة مخالفات تجريبية")
        
        # إضافة بيانات تجريبية للخصومات
        existing_deductions = db.query(Deduction).count()
        if existing_deductions < 5:
            deduction_reasons = [
                "خصم غياب",
                "خصم مخالفة",
                "قرض شخصي",
                "تأمين اجتماعي",
                "خصم تأخير"
            ]
            
            for i in range(6):
                worker = random.choice(workers)
                deduction_date = date.today() - timedelta(days=random.randint(1, 60))
                
                deduction = Deduction(
                    worker_id=worker.id,
                    amount=random.choice([50, 100, 150, 200, 250, 300]),
                    reason=random.choice(deduction_reasons),
                    date=deduction_date
                )
                db.add(deduction)
            
            db.commit()
            print(f"تم إضافة خصومات تجريبية")
        
        # طباعة ملخص البيانات
        print("\n📊 ملخص البيانات الحالية:")
        print(f"العمال: {db.query(Worker).count()}")
        print(f"الإجازات: {db.query(Leave).count()}")
        print(f"الغيابات: {db.query(Absence).count()}")
        print(f"المخالفات: {db.query(Violation).count()}")
        print(f"الخصومات: {db.query(Deduction).count()}")
        
    except Exception as e:
        print(f"خطأ: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_test_data()
