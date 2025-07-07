import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))
from app.models import Worker, License, Company
from app.database import engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy import or_

Session = sessionmaker(bind=engine)
session = Session()

# حذف العمال الذين لديهم company_id أو license_id = None أو فارغ أو ليس رقمًا صحيحًا
def is_invalid(val):
    try:
        return val is None or val == '' or int(val) <= 0
    except Exception:
        return True

invalid_workers = session.query(Worker).filter(
    or_(Worker.company_id == None, Worker.company_id == '', Worker.license_id == None, Worker.license_id == '')
).all()

for w in invalid_workers:
    print(f"[حذف عامل غير متوافق] {w.name} | {w.civil_id} | company_id={w.company_id} | license_id={w.license_id}")
    session.delete(w)
session.commit()
print(f"تم حذف {len(invalid_workers)} عامل غير متوافق.")

# حذف التراخيص التي لديها company_id = None أو فارغ أو ليس رقمًا صحيحًا
invalid_licenses = session.query(License).filter(
    or_(License.company_id == None, License.company_id == '')
).all()

for lic in invalid_licenses:
    print(f"[حذف ترخيص غير متوافق] {lic.name} | id={lic.id} | company_id={lic.company_id}")
    session.delete(lic)
session.commit()
print(f"تم حذف {len(invalid_licenses)} ترخيص غير متوافق.")

session.close()
print("--- انتهى التنظيف ---")
