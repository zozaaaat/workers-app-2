"""
إنشاء بيانات تجريبية مبسطة
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import Worker, Leave, Violation, Deduction
from datetime import date

def create_minimal_test_data():
    db = SessionLocal()
    
    try:
        # التحقق من وجود عامل واحد على الأقل
        worker = db.query(Worker).first()
        if not worker:
            print("❌ لا يوجد عمال في قاعدة البيانات")
            return
        
        print(f"✅ تم العثور على عامل: {worker.name}")
        
        # إضافة إجازة تجريبية
        if db.query(Leave).count() == 0:
            leave = Leave(
                worker_id=worker.id,
                leave_type="إجازة اختبار",
                start_date=date.today(),
                end_date=date.today(),
                notes="إجازة للاختبار"
            )
            db.add(leave)
            print("✅ تم إضافة إجازة اختبار")
        
        # إضافة مخالفة تجريبية
        if db.query(Violation).count() == 0:
            violation = Violation(
                worker_id=worker.id,
                description="مخالفة اختبار",
                penalty_amount=100.0,
                date=date.today()
            )
            db.add(violation)
            print("✅ تم إضافة مخالفة اختبار")
        
        # إضافة خصم تجريبي
        if db.query(Deduction).count() == 0:
            deduction = Deduction(
                worker_id=worker.id,
                amount=50.0,
                reason="خصم اختبار",
                date=date.today()
            )
            db.add(deduction)
            print("✅ تم إضافة خصم اختبار")
        
        db.commit()
        
        # طباعة الإحصائيات
        print(f"\n📊 إحصائيات البيانات:")
        print(f"العمال: {db.query(Worker).count()}")
        print(f"الإجازات: {db.query(Leave).count()}")
        print(f"المخالفات: {db.query(Violation).count()}")
        print(f"الخصومات: {db.query(Deduction).count()}")
        
    except Exception as e:
        print(f"خطأ: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_minimal_test_data()
