import requests
import os
import re
from datetime import datetime

API_URL = "http://localhost:8000"  # عدل الرابط إذا كان مختلفًا

# قراءة التوكن من ملف نصي خارجي (من نفس مسار السكريبت)
token_path = os.path.join(os.path.dirname(__file__), "token.txt")
with open(token_path, encoding="utf-8") as f:
    TOKEN = f.read().strip()

# تحقق من أن التوكن لاتيني فقط
if not re.match(r'^[A-Za-z0-9\-_.]+$', TOKEN):
    print("تحذير: التوكن يحتوي على رموز أو أحرف غير لاتينية!\nيرجى لصق التوكن من السيرفر مباشرة بدون علامات اقتباس أو رموز أو فراغات.")
    print(f"أول 20 حرف من التوكن: {TOKEN[:20]}")
    exit(1)

HEADERS = {"Authorization": f"Bearer {TOKEN}"}

# تحويل التواريخ إلى yyyy-mm-dd أو None

def fix_date(val):
    if not val or not isinstance(val, str):
        return None
    # إذا كانت الصيغة yyyy-mm-dd
    if re.match(r"^\d{4}-\d{2}-\d{2}$", val):
        return val
    # إذا كانت الصيغة yyyy/xxxxx أو أرقام فقط
    try:
        # أحيانًا يكون رقم الترخيص وليس تاريخ
        dt = datetime.strptime(val, "%Y-%m-%d")
        return dt.strftime("%Y-%m-%d")
    except:
        pass
    try:
        dt = datetime.strptime(val, "%Y/%m/%d")
        return dt.strftime("%Y-%m-%d")
    except:
        pass
    # إذا كان رقم فقط أو صيغة غير معروفة
    return None

# --- جميع بيانات التراخيص المستخرجة ---
licenses_raw = [
    {"civil_id": "4666291", "is_main": True, "name": "شركه ميلانو المتحده للاقمشه", "status": "فعال", "issue_authority": "وزارة التجارة والصناعة", "issue_date": "2019/39997", "expiry_date": "2025-09-30", "address": "محافظة العاصمة - القبله - القطعة 009 - القسيمة 800438 - شارع مبارك الكبير - سوق الاقمشه بلوك 4 - رقم الوحدة 00021", "license_number": "2019/39997", "parent_id": None},
    {"civil_id": "4702334", "is_main": False, "name": "شركه مرمر للاقمشه", "status": "فعال", "issue_authority": "وزارة التجارة والصناعة", "issue_date": "2020/9983", "expiry_date": "2025-09-30", "address": "محافظة العاصمة - القبله - القطعة 009 - القسيمة 800427 - شارع عبدالله المبارك - سوق الاقمشه والبطانيات بلوك 1 - رقم الوحدة 00042", "license_number": "2020/9983", "parent_id": None},
    {"civil_id": "5431451", "is_main": False, "name": "مصنع دار الشيخ للمنتجات الذهبية", "status": "فعال", "issue_authority": "الهيئة العامة للصناعة", "issue_date": "207669", "expiry_date": "2028-05-31", "address": "محافظة الفروانيه - الرى - القطعة 001 - القسيمة 000290 - شارع ابراهيم محمد الجريوي - هناء علي عبدالرحمن السعيد - رقم الوحدة 11", "license_number": "207669", "parent_id": None},
    {"civil_id": "5333614", "is_main": False, "name": "مجوهرات دار الشيخ الذهبية", "status": "فعال", "issue_authority": "وزارة التجارة والصناعة", "issue_date": "20231521", "expiry_date": "2027-01-23", "address": "محافظة العاصمة - القبله - القطعة 004 - القسيمة 900002 - شارع عبدالله السالم - مجمع الاسواق بالمباركية / شركة ريل استيت هاوس - رقم الوحدة 9", "license_number": "20231521", "parent_id": None},
    {"civil_id": "5337812", "is_main": False, "name": "معرض حنان فابريك للاقمشة", "status": "فعال", "issue_authority": "وزارة التجارة والصناعة", "issue_date": "20231808", "expiry_date": "2027-01-28", "address": "محافظة العاصمة - القبله - القطعة 009 - القسيمة 800427 - شارع عبدالله المبارك - سوق الاقمشه والبطانيات بلوك 1 - رقم الوحدة 16", "license_number": "20231808", "parent_id": None},
    {"civil_id": "5977546", "is_main": False, "name": "خياط ليزا فاشن للسيدات واقمشتها", "status": "فعال", "issue_authority": "وزارة التجارة والصناعة", "issue_date": "20252593", "expiry_date": "2029-02-11", "address": "محافظة العاصمة - القبله - القطعة 009 - القسيمة 900002 - شارع عبدالله المبارك - سوق الصفاه - رقم الوحدة 4304", "license_number": "20252593", "parent_id": None},
    {"civil_id": "5102052", "is_main": False, "name": "كهرمان جولد للمجوهرات الذهبية", "status": "فعال", "issue_authority": "وزارة التجارة والصناعة", "issue_date": "2022/5601", "expiry_date": "2026-04-18", "address": "محافظة الجهراء - الجهراء - القطعة 003 - القسيمة 004304 - شارع مرزوق المتعب - بنك وربة ( ش .م.ك.ع ) - رقم الوحدة 12", "license_number": "2022/5601", "parent_id": None},
    {"civil_id": "5097324", "is_main": False, "name": "مجوهرات دار الشيخ الذهبية", "status": "فعال", "issue_authority": "وزارة التجارة والصناعة", "issue_date": "2022/5276", "expiry_date": "2026-04-13", "address": "محافظة الجهراء - الجهراء - القطعة 003 - القسيمة 004304 - شارع مرزوق المتعب - بنك وربة ( ش .م.ك.ع ) - رقم الوحدة 13", "license_number": "2022/5276", "parent_id": None},
    {"civil_id": "5083843", "is_main": False, "name": "كنز فاشن لبيع اقمشة الستائر والمفروشات", "status": "فعال", "issue_authority": "وزارة التجارة والصناعة", "issue_date": "2022/4287", "expiry_date": "2026-03-28", "address": "محافظة العاصمة - القبله - القطعة 009 - القسيمة 800435 - الشارع - سوق الاقمشة بلوك 2 - رقم الوحدة 13", "license_number": "2022/4287", "parent_id": None},
    {"civil_id": "5056456", "is_main": False, "name": "مجوهرات دار الشيخ الذهبية", "status": "فعال", "issue_authority": "وزارة التجارة والصناعة", "issue_date": "2022/2256", "expiry_date": "2026-02-14", "address": "محافظة الأحمدي - الفحيحيل - القطعة 011 - القسيمة 006656 - شارع 58 - شركة رمال الكويت العقاريه - رقم الوحدة 00003", "license_number": "2022/2256", "parent_id": None},
    {"civil_id": "4920261", "is_main": False, "name": "شركه مترو فاشن للاقمشه", "status": "فعال", "issue_authority": "وزارة التجارة والصناعة", "issue_date": "2021/16187", "expiry_date": "2029-05-19", "address": "محافظة العاصمة - القبله - القطعة 009 - القسيمة 900002 - شارع عبدالله المبارك - سوق الصفاه - رقم الوحدة 03096", "license_number": "2021/16187", "parent_id": None},
    {"civil_id": "4727519", "is_main": False, "name": "مجوهرات دار الشيخ الذهبية", "status": "فعال", "issue_authority": "وزارة التجارة والصناعة", "issue_date": "2020/12823", "expiry_date": "2027-10-16", "address": "محافظة الأحمدي - الفحيحيل - القطعة 011 - القسيمة 006654 - شارع عبدالهادي راشد الحجيلان - خالد الدبوس ومحمد المنيف - رقم الوحدة 3", "license_number": "2020/12823", "parent_id": None},
    {"civil_id": "5097379", "is_main": False, "name": "مجوهرات دار الشيخ الذهبية", "status": "فعال", "issue_authority": "وزارة التجارة والصناعة", "issue_date": "2022/5281", "expiry_date": "2026-04-13", "address": "محافظة العاصمة - القبله - القطعة 004 - القسيمة 000021 - شارع سعود بن عبدالعزيز - أحمد أنور عبدالله العوضي - رقم الوحدة 8", "license_number": "2022/5281", "parent_id": None}
]

licenses = []
license_civilid_to_id = {}
for idx, lic in enumerate(licenses_raw, 1):
    license_type = "رئيسي" if lic.get("is_main") else "فرعي"
    # معالجة issue_date: إذا لم يكن تاريخ صحيح، ضع 1900-01-01
    issue_date = fix_date(lic.get("issue_date")) or "1900-01-01"
    licenses.append({
        "name": lic["name"],
        "license_type": license_type,
        "status": lic.get("status"),
        "issue_date": issue_date,
        "expiry_date": fix_date(lic.get("expiry_date")),
        "labor_count": 0,
        "license_number": lic.get("license_number"),
        "address": lic.get("address"),
        "company_id": 1,
        "parent_id": lic.get("parent_id"),
        "issuing_authority": lic.get("issue_authority"),
        "civil_id": lic.get("civil_id"),  # إضافة civil_id للترخيص
    })
    license_civilid_to_id[lic["civil_id"]] = idx  # ترقيم تلقائي مؤقت

# --- جميع بيانات العمال المستخرجة ---
workers_raw = [
    {"civil_id": "284032102084", "name": "محمد ابراهيم محمد شريف ملائي", "nationality": "إيران", "type": "عماله وافدة", "job_title": "مندوب مشتريات", "hire_date": "2020-11-12", "work_permit_end": "2026-01-16", "salary": 789, "license_civil_id": "4702334"},
    {"civil_id": "285111909489", "name": "ام دي فيصل احمد اليس مياه", "nationality": "بنغلاديش", "type": "عماله وافدة", "job_title": "بائع أقمشة", "hire_date": "2021-03-03", "work_permit_end": "2026-03-24", "salary": 12256, "license_civil_id": "4702334"},
    {"civil_id": "259102600667", "name": "حاكم مدلول الخلف الهراطه", "nationality": "سوريا", "type": "عماله وافدة", "job_title": "محصل كمبيالات", "hire_date": "2023-08-06", "work_permit_end": "2025-10-01", "salary": 11985, "license_civil_id": "4702334"},
    {"civil_id": "281062002822", "name": "وائل نصرى ارميس ناشد", "nationality": "مصر", "type": "عماله وافدة", "job_title": "منسق واجهات عرض البضائع / ملابس", "hire_date": "2020-11-12", "work_permit_end": "2025-01-16", "salary": 450, "license_civil_id": "4702334"},
    {"civil_id": "295010108286", "name": "على محمد النايف", "nationality": "سوريا", "type": "عماله وافدة", "job_title": "سائق / سيارة خصوصي", "hire_date": "2023-04-20", "work_permit_end": "2026-03-06", "salary": 13907, "license_civil_id": "4702334"},
    {"civil_id": "297100500344", "name": "عبدالله سليمان توانا", "nationality": "إيران", "type": "عماله وافدة", "job_title": "بائع أقمشة", "hire_date": "2023-02-12", "work_permit_end": "2026-02-12", "salary": 12256, "license_civil_id": "4702334"},
    {"civil_id": "295070102396", "name": "عبدالرحمن احمد الزعبي", "nationality": "سوريا", "type": "عماله وافدة", "job_title": "سائق / سيارة خصوصي", "hire_date": "2022-12-25", "work_permit_end": "2025-11-27", "salary": 13907, "license_civil_id": "4702334"},
    {"civil_id": "300010110806", "name": "محمد فؤاد العلي", "nationality": "سوريا", "type": "عماله وافدة", "job_title": "سائق / سيارة خصوصي", "hire_date": "2024-11-04", "work_permit_end": "2025-11-10", "salary": 13907, "license_civil_id": "4702334"},
    {"civil_id": "288112901845", "name": "هشام عبدالعزيز عبدالله الهى", "nationality": "إيران", "type": "عماله وافدة", "job_title": "سائق / سيارة خصوصي", "hire_date": "2024-12-29", "work_permit_end": "2025-12-30", "salary": 13907, "license_civil_id": "4702334"},
    {"civil_id": "272101601429", "name": "انيس باندوك والا سجاد حسين", "nationality": "الهند", "type": "عماله وافدة", "job_title": "مندوب مشتريات", "hire_date": "2021-11-18", "work_permit_end": "2026-11-22", "salary": 11598, "license_civil_id": "4702334"},
    {"civil_id": "278121104427", "name": "عقيل الدين شيخ", "nationality": "الهند", "type": "عماله وافدة", "job_title": "بائع أقمشة", "hire_date": "2025-04-28", "work_permit_end": "2026-04-30", "salary": 12256, "license_civil_id": "4702334"},
    {"civil_id": "280060405236", "name": "عماد موريس شاكر شنودة", "nationality": "مصر", "type": "عماله وافدة", "job_title": "بائع أقمشة", "hire_date": "2025-06-15", "work_permit_end": "2026-06-18", "salary": 12256, "license_civil_id": "4702334"},
    {"civil_id": "288061401292", "name": "على عبدالحليم قاسم نجعه", "nationality": "سوريا", "type": "عماله وافدة", "job_title": "بائع أقمشة", "hire_date": "2025-03-08", "work_permit_end": "2026-03-11", "salary": 12256, "license_civil_id": "4702334"},
    {"civil_id": "299030201435", "name": "محمد هاشم زمانى", "nationality": "إيران", "type": "عماله وافدة", "job_title": "بائع أقمشة", "hire_date": "2021-09-15", "work_permit_end": "2025-10-07", "salary": 12256, "license_civil_id": "4702334"},
    {"civil_id": "282122302072", "name": "عبدالعزيز احمد قادري", "nationality": "إيران", "type": "عماله وافدة", "job_title": "بائع أقمشة", "hire_date": "2022-12-19", "work_permit_end": "2025-12-26", "salary": 12256, "license_civil_id": "4702334"},
    {"civil_id": "282010507823", "name": "ابراهيم نوروز اسماعيلي", "nationality": "إيران", "type": "عماله وافدة", "job_title": "بائع أقمشة", "hire_date": "2022-05-24", "work_permit_end": "2026-06-08", "salary": 12256, "license_civil_id": "4702334"},
    {"civil_id": "292051015795", "name": "بيبلاب بول نريبان بول", "nationality": "الهند", "type": "عماله وافدة", "job_title": "بائع أقمشة", "hire_date": "2023-08-18", "work_permit_end": "2025-09-03", "salary": 12256, "license_civil_id": "4702334"},
    {"civil_id": "269011005212", "name": "توحيد الكريم غلام مصطفى", "nationality": "بنغلاديش", "type": "عماله وافدة", "job_title": "بائع أقمشة", "hire_date": "2022-12-08", "work_permit_end": "2026-12-19", "salary": 12256, "license_civil_id": "4702334"},
    {"civil_id": "274072301214", "name": "فضل عباس عبدالحميد", "nationality": "باكستان", "type": "عماله وافدة", "job_title": "بائع أقمشة", "hire_date": "2020-07-11", "work_permit_end": "2025-08-22", "salary": 12256, "license_civil_id": "4702334"},
    {"civil_id": "272111702661", "name": "سعد سيد احمد علي", "nationality": "مصر", "type": "عماله وافدة", "job_title": "بائع أقمشة", "hire_date": "2023-06-28", "work_permit_end": "2026-07-15", "salary": 12256, "license_civil_id": "4702334"},
    {"civil_id": "266081601438", "name": "علي محمد رسول بناهي", "nationality": "إيران", "type": "عماله وافدة", "job_title": "بائع أقمشة", "hire_date": "2024-10-13", "work_permit_end": "2025-10-15", "salary": 12256, "license_civil_id": "4702334"},
    {"civil_id": "291101201453", "name": "ناصر سليمان توانا", "nationality": "إيران", "type": "عماله وافدة", "job_title": "صائغ حلي ذهبية", "hire_date": "2024-08-25", "work_permit_end": "2025-08-27", "salary": 12901, "license_civil_id": "5097379"},
    {"civil_id": "299042501216", "name": "علي محمدي", "nationality": "غرينادا", "type": "عماله وافدة", "job_title": "مندوب تجاري خدمات", "hire_date": "2023-05-04", "work_permit_end": "2026-05-15", "salary": 11596, "license_civil_id": "5097379"},
    {"civil_id": "293010304384", "name": "محمد جوهيرول اسلام ابوالخير", "nationality": "بنغلاديش", "type": "عماله وافدة", "job_title": "صائغ حلي ذهبية", "hire_date": "2024-09-23", "work_permit_end": "2025-09-24", "salary": 12901, "license_civil_id": "5097379"},
    {"civil_id": "300010504418", "name": "جوبال كلال بهيرو لال كلال", "nationality": "الهند", "type": "عماله وافدة", "job_title": "صائغ حلي ذهبية", "hire_date": "2024-12-03", "work_permit_end": "2025-12-05", "salary": 12901, "license_civil_id": "5097379"},
]
workers = []
for w in workers_raw:
    workers.append({
        "civil_id": w["civil_id"],
        "name": w["name"],
        "nationality": w["nationality"],
        "worker_type": w.get("type", "عمالة وافدة"),
        "job_title": w.get("job_title"),
        "hire_date": fix_date(w.get("hire_date")),
        "work_permit_start": fix_date(w.get("hire_date")),  # نفترض بداية التصريح = التعيين
        "work_permit_end": fix_date(w.get("work_permit_end")),
        "salary": w.get("salary", 0),
        "company_id": 1,
        "license_id": license_civilid_to_id.get(w.get("license_civil_id")),
    })

# إرسال التراخيص
for lic in licenses:
    data = lic.copy()
    # إذا لم يوجد issue_date صالح، احذف الحقل نهائيًا
    if not data.get("issue_date"):
        data.pop("issue_date", None)
    resp = requests.post(f"{API_URL}/licenses/", json=data, headers=HEADERS)
    if resp.status_code != 200 and resp.status_code != 201:
        print(f"[LICENSE ERROR] {lic['name']} => {resp.status_code} {resp.text}")
    else:
        print(f"[LICENSE OK] {lic['name']}")

# إرسال العمال
for w in workers:
    resp = requests.post(f"{API_URL}/workers/", json=w, headers=HEADERS)
    if resp.status_code != 200 and resp.status_code != 201:
        print(f"[WORKER ERROR] {w['civil_id']} => {resp.status_code} {resp.text}")
    else:
        print(f"[WORKER OK] {w['civil_id']}")
