# سكريبت لتوليد custom_id لكل عامل قديم لا يملك custom_id
from app.database import SessionLocal
from app.models import Worker

def assign_custom_ids():
    db = SessionLocal()
    companies = {}
    workers = db.query(Worker).order_by(Worker.company_id, Worker.id).all()
    for worker in workers:
        if worker.custom_id:
            continue
        company_id = worker.company_id
        if company_id not in companies:
            companies[company_id] = 1
        else:
            companies[company_id] += 1
        worker.custom_id = f"C{company_id}-{companies[company_id]}"
        print(f"Set custom_id for worker {worker.id}: {worker.custom_id}")
    db.commit()
    db.close()
    print("تم تحديث جميع العمال بنجاح.")

if __name__ == "__main__":
    assign_custom_ids()
