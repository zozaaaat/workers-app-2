# نماذج قاعدة البيانات - Models Documentation

## نظرة عامة

تم تحديث وإنشاء نماذج قاعدة البيانات لتتوافق مع متطلبات النظام الجديدة. النماذج تشمل نظام شامل لإدارة المستخدمين، الصلاحيات، الموظفين، التراخيص، والوثائق.

## النماذج الأساسية

### 1. User Model (`user.py`)
```python
# المعلومات الأساسية
- username: اسم المستخدم (فريد)
- email: البريد الإلكتروني (فريد)
- full_name: الاسم الكامل
- phone: رقم الهاتف
- avatar: رابط الصورة الشخصية

# المعلومات الأمنية
- hashed_password: كلمة المرور المشفرة
- is_active: حالة النشاط
- is_superuser: مدير النظام
- status: الحالة (active, inactive, suspended)
- last_login: آخر تسجيل دخول

# العلاقات
- role_id: مرتبط بجدول الأدوار
- company_id: مرتبط بجدول الشركات
- permissions: صلاحيات إضافية للمستخدم
```

### 2. Role Model (`role.py`)
```python
# المعلومات الأساسية
- name: اسم الدور (فريد)
- display_name: الاسم المعروض
- description: وصف الدور
- is_system: دور نظام (لا يمكن حذفه)
- priority: أولوية الدور

# الأدوار الافتراضية
- super_admin: مدير النظام الرئيسي
- admin: مدير النظام
- hr_manager: مدير الموارد البشرية
- hr_specialist: اختصاصي موارد بشرية
- manager: مدير
- supervisor: مشرف
- employee: موظف
- viewer: مشاهد
```

### 3. Permission Model (`permission.py`)
```python
# المعلومات الأساسية
- key: مفتاح الصلاحية (فريد)
- name: اسم الصلاحية
- category: فئة الصلاحية
- module: الوحدة التي تنتمي إليها

# فئات الصلاحيات
- employees: إدارة الموظفين
- licenses: إدارة التراخيص
- leaves: إدارة الإجازات
- deductions: إدارة الاستقطاعات
- documents: إدارة الوثائق
- reports: إدارة التقارير
- users: إدارة المستخدمين
- system: إدارة النظام
- company: إدارة الشركة
- notifications: إدارة الإشعارات
```

### 4. Employee Model (`employee.py`)
```python
# المعلومات الشخصية
- first_name, last_name, full_name
- national_id: رقم الهوية (فريد)
- passport_number: رقم جواز السفر
- email, phone, mobile
- address: العنوان
- date_of_birth: تاريخ الميلاد
- nationality: الجنسية
- gender: الجنس
- marital_status: الحالة الاجتماعية

# المعلومات الوظيفية
- employee_number: رقم الموظف (فريد)
- position: المنصب
- department: القسم
- hire_date: تاريخ التعيين
- basic_salary: الراتب الأساسي
- allowances: البدلات المختلفة

# معلومات التأمين والإقامة
- insurance_number: رقم التأمين
- iqama_number: رقم الإقامة
- work_permit_number: رقم رخصة العمل
- expiry dates: تواريخ انتهاء الوثائق

# العلاقات
- user_id: مرتبط بجدول المستخدمين
- company_id: مرتبط بجدول الشركات
```

### 5. License Model (`license.py`)
```python
# المعلومات الأساسية
- name: اسم الرخصة
- license_number: رقم الرخصة (فريد)
- license_type: نوع الرخصة
- status: حالة الرخصة

# أنواع التراخيص
- trade: تجارية
- industrial: صناعية
- professional: مهنية
- municipal: بلدية
- health: صحية
- fire_safety: السلامة
- environmental: بيئية
- transport: نقل
- construction: إنشاءات

# معلومات التواريخ
- issue_date: تاريخ الإصدار
- expiry_date: تاريخ انتهاء الصلاحية
- renewal_date: تاريخ التجديد
- renewal_alert_days: عدد الأيام للتنبيه

# معلومات مالية
- issue_cost: تكلفة الإصدار
- renewal_cost: تكلفة التجديد
- penalty_amount: مبلغ الغرامة

# خصائص محسوبة
- is_expired: التحقق من انتهاء الصلاحية
- days_until_expiry: الأيام المتبقية
- renewal_urgency: مستوى إلحاح التجديد
```

### 6. Document Model (`document.py`)
```python
# معلومات أساسية
- name: اسم المستند
- original_filename: اسم الملف الأصلي
- file_path: مسار الملف
- url: رابط الوصول للملف

# معلومات الملف
- file_size: حجم الملف
- mime_type: نوع MIME
- file_extension: امتداد الملف

# نوع المستند
- file_type: النوع المحدد من القائمة
- custom_type: النوع المخصص
- document_type: النوع من enum

# معلومات الكيان المرتبط
- entity_type: نوع الكيان (employee, company, license, user)
- entity_id: معرف الكيان

# أنواع المستندات
- id_card: بطاقة الهوية
- passport: جواز السفر
- residency: الإقامة
- personal_photo: الصورة الشخصية
- work_permit: رخصة العمل
- rent_receipt: إيصال الإيجار
- salary_certificate: شهادة راتب
- bank_statement: كشف حساب بنكي
- medical_certificate: شهادة طبية
- educational_certificate: شهادة تعليمية
- contract: عقد

# معلومات الحالة
- status: حالة المستند
- is_verified: تم التحقق منه
- expiry_date: تاريخ انتهاء الصلاحية
- uploaded_by: الشخص الذي رفع الملف

# خصائص محسوبة
- formatted_file_size: حجم الملف منسق
- is_image: التحقق من كونه صورة
- is_pdf: التحقق من كونه PDF
- is_expired: التحقق من انتهاء الصلاحية
```

## العلاقات بين النماذج

### علاقة المستخدمين والأدوار
- علاقة Many-to-One: كل مستخدم له دور واحد
- علاقة Many-to-Many: المستخدمين والصلاحيات الإضافية

### علاقة الأدوار والصلاحيات
- علاقة Many-to-Many: كل دور يمكن أن يحتوي على عدة صلاحيات

### علاقة الموظفين والمستخدمين
- علاقة One-to-One: كل موظف يمكن أن يكون له حساب مستخدم

### علاقة الوثائق والكيانات
- علاقة Many-to-One: كل وثيقة مرتبطة بكيان واحد (موظف، شركة، ترخيص، مستخدم)

## الميزات المتقدمة

### 1. نظام الصلاحيات المرن
- صلاحيات على مستوى الدور
- صلاحيات إضافية على مستوى المستخدم
- دعم التحقق من الصلاحيات بالكود

### 2. نظام إدارة الوثائق المتقدم
- دعم أنواع متعددة من الملفات
- نظام تصنيف مرن
- إدارة انتهاء صلاحية الوثائق
- نظام تحقق وموافقة

### 3. نظام التنبيهات التلقائي
- تنبيهات انتهاء صلاحية التراخيص
- تنبيهات انتهاء صلاحية الوثائق
- تنبيهات انتهاء الإقامة ورخص العمل

### 4. البيانات الافتراضية
- أدوار نظام محددة مسبقاً
- صلاحيات شاملة لجميع وحدات النظام
- ربط تلقائي للصلاحيات بالأدوار

## تهيئة النظام

لتهيئة البيانات الافتراضية:

```python
from app.scripts.init_default_data import initialize_default_data
initialize_default_data()
```

هذا سينشئ:
- جميع الجداول
- الأدوار الافتراضية
- الصلاحيات الافتراضية
- ربط الصلاحيات بالأدوار

## التوافق مع Frontend

النماذج محسنة للعمل مع:
- مكون FileUpload المحدث
- نظام الصلاحيات في React Context
- واجهات TypeScript المطابقة

## الأمان

- تشفير كلمات المرور
- نظام صلاحيات محكم
- تتبع المستخدم الذي رفع كل وثيقة
- نظام حالات للمستندات والمستخدمين
