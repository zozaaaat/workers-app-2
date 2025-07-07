import sys
import os
import pandas as pd
from datetime import datetime
import difflib
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))

from sqlalchemy import create_engine, select, func
from sqlalchemy.orm import sessionmaker
from app.models import Worker, License, Company
from app.database import engine

# اسم ملف عمال ميلانو
FILENAME = r'C:/Users/hp/Desktop/اسماء عمال شركة ميلانو جميع التراخيص - جورج.xlsx'
COMPANY_NAME = "شركة ميلانو المتحدة للاقمشة"

if FILENAME.endswith('.csv'):
    df = pd.read_csv(FILENAME, header=3)
else:
    df = pd.read_excel(FILENAME, header=3)

print('أعمدة ملف العمال:', list(df.columns))
print('أول 5 صفوف من ملف العمال:')
print(df.head())

Session = sessionmaker(bind=engine)
session = Session()

def parse_date(val):
    if pd.isna(val):
        return None
    if isinstance(val, datetime):
        return val.date()
    try:
        return datetime.strptime(str(val), "%d/%m/%Y").date()
    except:
        try:
            return datetime.strptime(str(val), "%Y-%m-%d").date()
        except:
            return None

def safe_salary(val):
    try:
        return float(val)
    except (ValueError, TypeError):
        return 0

# احصل أو أنشئ الشركة إذا لم تكن موجودة
company = session.query(Company).filter(Company.file_name == COMPANY_NAME).first()
if not company:
    company = Company(file_name=COMPANY_NAME, file_number="MILANO")
    session.add(company)
    session.commit()
    company = session.query(Company).filter(Company.file_name == COMPANY_NAME).first()
    print(f"[جديد] تم إضافة الشركة: {COMPANY_NAME} (id={company.id})")

# احذف فقط عمال وتراخيص ميلانو
milano_licenses = session.query(License).filter(License.company_id == company.id).all()
for lic in milano_licenses:
    session.query(Worker).filter(Worker.license_id == lic.id).delete()
session.commit()
for lic in milano_licenses:
    session.delete(lic)
session.commit()

# إضافة التراخيص والعمال من ملف ميلانو فقط
added = 0
skipped = 0
current_license_name = None
current_license_id = None
for _, row in df.iterrows():
    license_cell = str(row.iloc[5]).strip() if not pd.isna(row.iloc[5]) else ''
    if license_cell and all(pd.isna(row.iloc[i]) for i in [0,1,2,3,4,6,7]):
        current_license_name = license_cell
        lic = session.query(License).filter(License.name == current_license_name, License.company_id == company.id).first()
        if not lic:
            new_lic = License(name=current_license_name, company_id=company.id, license_type="فرعي", status="فعال")
            session.add(new_lic)
            session.commit()
            lic = session.query(License).filter(License.name == current_license_name, License.company_id == company.id).order_by(License.id.desc()).first()
            print(f"[جديد] تم إضافة ترخيص: {current_license_name} (id={lic.id})")
        current_license_id = lic.id
        print(f"[ترخيص] {current_license_name} => id={current_license_id}")
        continue
    civil_id = str(row.iloc[2]).strip()
    if not civil_id or civil_id == 'nan':
        continue
    exists = session.query(Worker).filter_by(civil_id=civil_id, company_id=company.id).first()
    if exists:
        skipped += 1
        print(f"[SKIP] موجود بالفعل: {civil_id}")
        continue
    license_id_to_use = current_license_id
    license_name_to_use = current_license_name
    print(f"[إضافة عامل] {str(row.iloc[3]).strip()} | {civil_id} => ترخيص: {license_name_to_use} (id={license_id_to_use})")
    worker = Worker(
        civil_id=civil_id,
        name=str(row.iloc[3]).strip() if not pd.isna(row.iloc[3]) else '',
        nationality='غير محدد',
        worker_type='عمالة وافدة',
        job_title=str(row.iloc[4]).strip() if not pd.isna(row.iloc[4]) else None,
        hire_date=None,
        work_permit_start=parse_date(row.iloc[5]),
        work_permit_end=parse_date(row.iloc[6]),
        salary=safe_salary(row.iloc[7]) if len(row) > 7 else 0,
        company_id=company.id,
        license_id=license_id_to_use,
    )
    session.add(worker)
    added += 1

session.commit()
print(f"تمت إضافة {added} عامل جديد. تم تخطي {skipped} عامل مكرر.")
session.close()
print("[انتهى استيراد عمال وتراخيص ميلانو فقط]")
