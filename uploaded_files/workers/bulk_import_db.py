import sys
import os
import pandas as pd
from datetime import datetime
import datetime
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))

def normalize_name(name):
    return str(name).replace(" ", "").replace("ة", "ه").replace("ى", "ي").replace("أ", "ا").replace("إ", "ا").replace("آ", "ا").lower()

from sqlalchemy.orm import sessionmaker
from app.models import Worker, License, Company
from app.database import engine

# اسم ملف العمال (Excel)
FILENAME = r'C:/Users/hp/Desktop/اسماء عمال شركة ميلانو جميع التراخيص - جورج.xlsx'

# قراءة البيانات بدون header
# نطبع أول 20 صف كما هي
raw_df = pd.read_excel(FILENAME, header=None)
print('--- أول 20 صف من ملف العمال (بدون معالجة) ---')
print(raw_df.head(20))

# نحدد أول صف فعلي للبيانات (نتخطى الصفوف الفارغة أو رؤوس الأعمدة)
first_license = None
first_license_row = None
for i in range(40):
    for j in range(raw_df.shape[1]):
        cell = str(raw_df.iloc[i, j]).strip() if not pd.isna(raw_df.iloc[i, j]) else ''
        # تجاهل صفوف رؤوس الأعمدة
        if cell in ['الرقم المدني', 'الاسم', 'المهنة', 'بداية الإقامة', 'نهاية الإقامة', 'ملاحظات']:
            continue
        if cell and ("شركة" in cell or "مؤسسة" in cell or "مصنع" in cell or "معرض" in cell or "مجوهرات" in cell):
            first_license = cell
            first_license_row = i
            break
    if first_license:
        break
if not first_license:
    print('لم يتم العثور على اسم ترخيص في أول 40 صف!')
    sys.exit(1)

# نعتبر كل صف بعد أول ترخيص حتى ظهور ترخيص جديد هو عامل
license_names_in_excel = [first_license]
license_rows = {first_license: []}
current_license = first_license
# قائمة كلمات أو عبارات لا تعتبر ترخيص (مهن أو رؤوس أعمدة أو قيم غير صالحة)
not_license_keywords = [
    'الرقم المدني', 'الاسم', 'المهنة', 'بداية الإقامة', 'نهاية الإقامة', 'ملاحظات',
    'عامل', 'موظف', 'عام', 'ملابس', 'نسائية', 'ذكر', 'أنثى', 'الجنسية', 'الراتب', 'ملاحظات', 'تاريخ', 'رقم', 'اسم', 'مهنة', 'بداية', 'نهاية', 'ملاحظات', 'ملاحظات', 'ملاحظات'
]
for idx in range(first_license_row+1, len(raw_df)):
    row = raw_df.iloc[idx]
    found_new_license = False
    for j in range(raw_df.shape[1]):
        cell = str(row[j]).strip() if not pd.isna(row[j]) else ''
        # تجاهل صفوف رؤوس الأعمدة أو المهن أو القيم غير الصالحة كترخيص
        if any(kw in cell for kw in not_license_keywords):
            found_new_license = False
            break
        # التقط فقط التراخيص الحقيقية (يجب أن تحتوي على كلمة تدل على كيان تجاري)
        if cell and ("شركة" in cell or "مؤسسة" in cell or "مصنع" in cell or "معرض" in cell or "مجوهرات" in cell or "كهرمان" in cell or "خياط ليزا" in cell):
            current_license = cell
            found_new_license = True
            if current_license not in license_names_in_excel:
                license_names_in_excel.append(current_license)
                license_rows[current_license] = []
            break
    if found_new_license:
        continue
    # أضف العامل للترخيص الحالي إذا كان هناك رقم مدني واسم
    civil_id = str(row[2]).strip() if not pd.isna(row[2]) else ''
    name = str(row[3]).strip() if not pd.isna(row[3]) else ''
    if civil_id and name:
        license_rows[current_license].append(row)

Session = sessionmaker(bind=engine)
session = Session()

def parse_date(val):
    if pd.isna(val):
        return None
    if isinstance(val, datetime.datetime):
        return val.date()
    try:
        return datetime.datetime.strptime(str(val), "%d/%m/%Y").date()
    except:
        try:
            return datetime.datetime.strptime(str(val), "%Y-%m-%d").date()
        except:
            return None

def safe_salary(val):
    try:
        return float(val)
    except (ValueError, TypeError):
        return 0

# حذف جميع العمال والتراخيص (ما عدا الشركة الرئيسية)
session.query(Worker).delete()
session.query(License).delete()
session.commit()
print('تم حذف جميع العمال والتراخيص.')

# التأكد من وجود الشركة الرئيسية
main_company = session.query(Company).first()
main_license_name = None
if main_company:
    for lic_name in license_names_in_excel:
        if normalize_name(lic_name) == normalize_name(main_company.file_name):
            main_license_name = lic_name
            break
if not main_license_name:
    main_license_name = license_names_in_excel[0]
main_license_obj = None

# توليد اختصار لكل شركة رئيسية (مثلاً: ميلانو -> M)
def get_company_shortcut(name):
    if "ميلانو" in name:
        return "M"
    if "مرمر" in name:
        return "R"
    if "مترو" in name:
        return "T"
    if "دار الشيخ" in name:
        return "D"
    if "كهرمان" in name:
        return "K"
    # أضف اختصارات أخرى حسب الحاجة
    return name[0].upper()

# إضافة التراخيص من ملف الإكسل إذا لم تكن موجودة
license_name_to_obj = {}
license_name_to_id = {}
for idx, lic_name in enumerate(license_names_in_excel):
    # تجاهل إضافة ترخيص فرعي إذا كان اسمه يطابق اسم الشركة الرئيسية
    if idx != 0 and normalize_name(lic_name) == normalize_name(main_license_name):
        continue
    # استخدم الرقم المدني كـ ID للترخيص إذا توفر
    lic_id = None
    lic_civil_id = None
    lic_expiry = None
    lic_issue = None
    lic_issuing_authority = None
    lic_status = "فعال"
    lic_address = None
    lic_license_number = None
    lic_labor_count = None
    lic_company_id = 1
    # ابحث عن أول صف يحمل بيانات هذا الترخيص
    for rows in license_rows.values():
        for row in rows:
            if lic_name in str(row.values):
                lic_civil_id = str(row[2]).strip() if not pd.isna(row[2]) else None
                lic_expiry = str(row[4]).strip() if not pd.isna(row[4]) else None
                lic_issue = str(row[3]).strip() if not pd.isna(row[3]) else None
                lic_issuing_authority = str(row[5]).strip() if len(row) > 5 and not pd.isna(row[5]) else None
                lic_address = str(row[6]).strip() if len(row) > 6 and not pd.isna(row[6]) else None
                lic_license_number = str(row[7]).strip() if len(row) > 7 and not pd.isna(row[7]) else None
                lic_labor_count = int(row[8]) if len(row) > 8 and not pd.isna(row[8]) else None
                break
        if lic_civil_id:
            break
    if not lic_civil_id:
        lic_civil_id = str(abs(hash(lic_name)))[:8]  # fallback: hash of name
    # تأكد أن المعرفات أرقام صحيحة
    lic_civil_id_int = int(lic_civil_id)
    # حدد نوع الترخيص
    if idx == 0 or normalize_name(lic_name) == normalize_name(main_license_name):
        lic_type = "رئيسي"
        parent_id = None
        lic_company_id = main_company.id if main_company else 1
    else:
        lic_type = "فرعي"
        lic_company_id = main_company.id if main_company else 1
    lic = session.query(License).filter(License.civil_id == lic_civil_id).first()
    if not lic:
        lic = License(
            id=lic_civil_id_int,
            name=lic_name,
            civil_id=lic_civil_id,
            company_id=lic_company_id,
            license_type=None,  # مؤقت
            status=lic_status,
            issue_date=lic_issue,
            expiry_date=lic_expiry,
            issuing_authority=lic_issuing_authority,
            address=lic_address,
            license_number=lic_license_number,
            labor_count=lic_labor_count,
            parent_id=None  # مؤقت
        )
        session.add(lic)
        session.commit()
        print(f"[جديد] تم إضافة ترخيص: {lic_name} (id={lic.id})")
    license_name_to_obj[lic_name] = lic
    license_name_to_id[lic_name] = lic_civil_id_int
    if idx == 0 or normalize_name(lic_name) == normalize_name(main_license_name):
        main_license_obj = lic

# بعد إضافة جميع التراخيص، احسب main_license_id بشكل آمن
main_license_id = None
for k in license_name_to_id:
    if normalize_name(k) == normalize_name(main_license_name):
        main_license_id = license_name_to_id[k]
        break
if not main_license_id:
    # fallback: استخدم أول ترخيص فعلي
    main_license_id = list(license_name_to_id.values())[0]

# تحديث نوع الترخيص وparent_id لكل ترخيص بعد معرفة main_license_id
for lic_name, lic in license_name_to_obj.items():
    if normalize_name(lic_name) == normalize_name(main_license_name):
        lic.license_type = "رئيسي"
        lic.parent_id = None
    else:
        lic.license_type = "فرعي"
        lic.parent_id = main_license_id
    session.commit()

# إضافة العمال وربطهم بالتراخيص مع توليد ID ذكي
added = 0
skipped = 0
skipped_rows = []
company_shortcut = get_company_shortcut(main_license_name)
license_index_map = {lic_name: idx+1 for idx, lic_name in enumerate(license_names_in_excel) if lic_name != main_license_name or idx == 0}
worker_counter = 1  # <-- يجب أن يكون هنا خارج حلقة التراخيص
for lic_name, rows in license_rows.items():
    # تجاهل الفرع إذا كان اسمه يطابق اسم الشركة الرئيسية
    if lic_name == main_license_name and lic_name not in license_name_to_obj:
        continue
    lic = license_name_to_obj[lic_name]
    lic_id = license_name_to_id[lic_name]
    license_number = license_index_map[lic_name]
    # worker_counter = 1  # <-- احذف هذا السطر من هنا
    for row in rows:
        # تحقق وتحويل آمن لجميع الحقول الرقمية والتواريخ
        civil_id = str(row[2]).strip() if not pd.isna(row[2]) else ''
        name = str(row[3]).strip() if not pd.isna(row[3]) else ''
        # المسمى الوظيفي
        job_title = str(row[5]).strip() if len(row) > 5 and not pd.isna(row[5]) else 'عامل'
        # إذا كان job_title رقم أو يمكن تحويله لأي تاريخ، اجعله افتراضيًا "عامل"
        try:
            float(job_title)
            job_title = 'عامل'
        except Exception:
            pass
        if parse_date(job_title) is not None:
            job_title = 'عامل'
        # حماية نهائية: تأكد أن job_title نص فقط وليس تاريخ أو رقم
        def is_date_string(val):
            try:
                _ = parse_date(val)
                return True
            except Exception:
                return False
        if job_title is None or job_title == '' or is_date_string(job_title):
            job_title = 'عامل'
        # الراتب
        try:
            salary = float(row[7]) if len(row) > 7 and not pd.isna(row[7]) else 0.0
        except Exception:
            salary = 0.0
        # تاريخ بداية الإقامة
        try:
            work_permit_start = parse_date(row[6]) if len(row) > 6 and not pd.isna(row[6]) else None
        except Exception:
            work_permit_start = None
        # تاريخ نهاية الإقامة
        try:
            work_permit_end = parse_date(row[4]) if len(row) > 4 and not pd.isna(row[4]) else None
        except Exception:
            work_permit_end = None
        # hire_date: اجعلها None دائماً أو استخرجها من عمود صحيح إذا توفر لاحقاً
        hire_date = None
        # company_id
        try:
            company_id = int(lic.company_id) if lic and lic.company_id else 1
        except Exception:
            company_id = 1
        # license_id
        try:
            license_id = int(lic_id)
        except Exception:
            license_id = None
        # تخطي الصفوف غير الصالحة (رؤوس أعمدة أو صفوف فارغة)
        if not name or not civil_id or not civil_id.isdigit() or name in ['الاسم', 'بداية الإقامة', 'نهاية الإقامة', 'ملاحظات', 'الرقم المدني']:
            skipped += 1
            skipped_rows.append((name, civil_id, lic_name))
            continue
        # تخطي إذا كان الاسم رقمًا فقط
        try:
            float(name)
            skipped += 1
            skipped_rows.append((name, civil_id, lic_name))
            continue
        except Exception:
            pass
        # تخطي إذا كان job_title تاريخًا أو رقمًا
        try:
            float(job_title)
            skipped += 1
            skipped_rows.append((name, civil_id, lic_name))
            continue
        except Exception:
            pass
        try:
            _ = parse_date(job_title, fuzzy=False)
            skipped += 1
            skipped_rows.append((name, civil_id, lic_name))
            continue
        except Exception:
            pass
        # تأكد أن work_permit_start وwork_permit_end من نوع date أو None فقط
        if work_permit_start is not None and not isinstance(work_permit_start, datetime.date):
            work_permit_start = parse_date(work_permit_start)
            if work_permit_start is not None and not isinstance(work_permit_start, datetime.date):
                work_permit_start = None
        if work_permit_end is not None and not isinstance(work_permit_end, datetime.date):
            work_permit_end = parse_date(work_permit_end)
            if work_permit_end is not None and not isinstance(work_permit_end, datetime.date):
                work_permit_end = None
        # حماية إضافية: تأكد أن جميع تواريخ ORM هي date أو None فقط
        def ensure_date(val):
            if isinstance(val, datetime.date):
                return val
            if isinstance(val, datetime.datetime):
                return val.date()
            return None
        work_permit_start = ensure_date(work_permit_start)
        work_permit_end = ensure_date(work_permit_end)
        hire_date = ensure_date(hire_date)
        # تحقق أن جميع الحقول النهائية من النوع الصحيح
        if not (isinstance(work_permit_start, type(None)) or isinstance(work_permit_start, datetime.date)):
            work_permit_start = None
        if not (isinstance(work_permit_end, type(None)) or isinstance(work_permit_end, datetime.date)):
            work_permit_end = None
        if not (isinstance(salary, float) or isinstance(salary, int)):
            salary = 0.0
        try:
            # استخدم id كـ int فقط وليس نص
            worker_id = worker_counter
            worker = Worker(
                id=worker_id,
                civil_id=civil_id,
                name=name,
                nationality='غير محدد',
                worker_type='عمالة وافدة',
                job_title=job_title,
                hire_date=hire_date,
                work_permit_start=work_permit_start,
                work_permit_end=work_permit_end,
                salary=salary,
                custom_id=f"M{worker_counter}",
                license_id=license_id,
                company_id=company_id
            )
            session.add(worker)
            session.commit()
            added += 1
            print(f"[إضافة] {name} | {civil_id} -> {lic_name} | worker_id=M{worker_counter}")
            worker_counter += 1
        except Exception as e:
            session.rollback()
            print(f"[خطأ إضافة عامل] {name} | {civil_id} | {lic_name} | job_title={job_title} | salary={salary} | work_permit_start={work_permit_start}({type(work_permit_start)}) | work_permit_end={work_permit_end}({type(work_permit_end)}) | Exception: {e}")
            skipped += 1
            skipped_rows.append((name, civil_id, lic_name))
            continue
print(f"تمت إضافة {added} عامل جديد. تم تخطي {skipped} عامل.")
if skipped > 0:
    print("--- العمال الذين تم تخطيهم (أول 10 فقط) ---")
    for s in skipped_rows[:10]:
        print(f"اسم: {s[0]} | الرقم المدني: {s[1]} | ترخيص: {s[2]}")

# بعد إضافة جميع العمال، إذا وُجد عمال على ترخيص غير حقيقي (ليس في قائمة التراخيص الحقيقية)، اطبع تحذيرًا
for lic_name in list(license_rows.keys()):
    if not ("شركة" in lic_name or "مؤسسة" in lic_name or "مصنع" in lic_name or "معرض" in lic_name or "مجوهرات" in lic_name or "كهرمان" in lic_name or "خياط ليزا" in lic_name):
        print(f"[تحذير] تم تجاهل ترخيص غير حقيقي: {lic_name} وعدد العمال عليه: {len(license_rows[lic_name])}")
        del license_rows[lic_name]
        if lic_name in license_names_in_excel:
            license_names_in_excel.remove(lic_name)

# تقرير نهائي
print("\n--- تقرير نهائي ---")
licenses = session.query(License).all()
for lic in licenses:
    count = session.query(Worker).filter(Worker.license_id == lic.id).count()
    print(f"{lic.name} (id={lic.id}): {count} عامل")

no_license_workers = session.query(Worker).filter((Worker.license_id == None) | (Worker.license_id == '')).all()
if not no_license_workers:
    print("لا يوجد عمال بدون ترخيص.")
else:
    for w in no_license_workers:
        print(f"{w.name} | {w.civil_id}")

# تقرير تحقق: كل عامل في مكانه الصحيح
print("\n--- تقرير تحقق: كل عامل في مكانه الصحيح ---")
for lic_name, rows in license_rows.items():
    for row in rows:
        civil_id = str(row[2]).strip()
        name = str(row[3]).strip()
        print(f"عامل: {name} | الرقم المدني: {civil_id} | ترخيص: {lic_name}")

session.close()