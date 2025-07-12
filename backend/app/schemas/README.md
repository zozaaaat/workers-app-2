# Backend API Schemas Documentation
# توثيق مخططات واجهة برمجة التطبيقات

## نظرة عامة | Overview

يحتوي هذا المجلد على جميع مخططات Pydantic المستخدمة في النظام لتحقق من البيانات وتسلسلها.

This folder contains all Pydantic schemas used in the system for data validation and serialization.

## هيكل الملفات | File Structure

```
schemas/
├── __init__.py          # تصدير جميع المخططات
├── user.py             # مخططات إدارة المستخدمين
├── role.py             # مخططات الأدوار والصلاحيات
├── permission.py       # مخططات الصلاحيات
├── employee.py         # مخططات إدارة الموظفين
├── license.py          # مخططات إدارة الرخص
├── document.py         # مخططات إدارة الوثائق
└── README.md           # هذا الملف
```

## الميزات الرئيسية | Key Features

### 1. التحقق من البيانات | Data Validation
- تحقق من أنواع البيانات والقيم
- رسائل خطأ مخصصة باللغة العربية
- قواعد تحقق معقدة للحقول المترابطة

### 2. تسلسل البيانات | Data Serialization
- تحويل البيانات من/إلى JSON
- دعم المراجع المتقدمة والعلاقات
- تنسيق موحد للاستجابات

### 3. البحث والتصفية | Search and Filtering
- مرشحات بحث شاملة لكل نموذج
- دعم التصفح والترتيب
- مرشحات متقدمة بالتواريخ والمدى

### 4. الإحصائيات والتقارير | Statistics and Reports
- مخططات إحصائيات مفصلة
- تقارير انتهاء الصلاحية
- تجميع البيانات بطرق مختلفة

## المخططات المتاحة | Available Schemas

### 1. User Schemas (user.py)
```python
from app.schemas import UserCreate, UserRead, UserUpdate
```

**المخططات الأساسية:**
- `UserBase`: الحقول الأساسية للمستخدم
- `UserCreate`: إنشاء مستخدم جديد
- `UserRead`: قراءة بيانات المستخدم
- `UserUpdate`: تحديث بيانات المستخدم
- `UserLogin`: تسجيل الدخول

**مخططات متقدمة:**
- `UserSearchFilters`: مرشحات البحث
- `UserListResponse`: استجابة قائمة المستخدمين مع التصفح
- `UserStats`: إحصائيات المستخدمين

### 2. Role Schemas (role.py)
```python
from app.schemas import RoleCreate, RoleRead, RolePermissionUpdate
```

**المخططات الأساسية:**
- `RoleBase`: الحقول الأساسية للدور
- `RoleCreate`: إنشاء دور جديد
- `RoleRead`: قراءة بيانات الدور
- `RolePermissionUpdate`: تحديث صلاحيات الدور

### 3. Permission Schemas (permission.py)
```python
from app.schemas import PermissionCreate, PermissionGrouped, PermissionCheck
```

**المخططات الأساسية:**
- `PermissionBase`: الحقول الأساسية للصلاحية
- `PermissionCreate`: إنشاء صلاحية جديدة
- `PermissionRead`: قراءة بيانات الصلاحية

**مخططات التجميع:**
- `PermissionGrouped`: صلاحيات مجمعة حسب الفئة
- `PermissionsByModule`: صلاحيات مجمعة حسب الوحدة

**مخططات التحقق:**
- `PermissionCheck`: التحقق من صلاحية معينة
- `PermissionCheckResponse`: استجابة التحقق

### 4. Employee Schemas (employee.py)
```python
from app.schemas import EmployeeCreate, EmployeeRead, EmployeeExpiryReport
```

**المخططات الأساسية:**
- `EmployeeBase`: المعلومات الشخصية والوظيفية
- `EmployeeCreate`: إنشاء موظف جديد
- `EmployeeRead`: قراءة بيانات الموظف مع العلاقات

**مخططات التقارير:**
- `EmployeeExpiryAlert`: تنبيه انتهاء وثائق الموظف
- `EmployeeExpiryReport`: تقرير شامل لانتهاء الوثائق

**التعدادات:**
- `EmployeeStatus`: حالة الموظف (active, inactive, terminated, etc.)
- `Gender`: الجنس
- `MaritalStatus`: الحالة الاجتماعية

### 5. License Schemas (license.py)
```python
from app.schemas import LicenseCreate, LicenseRenewal, LicenseExpiryReport
```

**المخططات الأساسية:**
- `LicenseBase`: معلومات الرخصة الأساسية
- `LicenseCreate`: إنشاء رخصة جديدة
- `LicenseRead`: قراءة بيانات الرخصة مع التواريخ المحسوبة

**مخططات التجديد:**
- `LicenseRenewal`: تجديد الرخصة
- `LicenseExpiryAlert`: تنبيه انتهاء الرخصة

**التعدادات:**
- `LicenseType`: 12 نوع رخصة مختلف
- `LicenseStatus`: حالة الرخصة

### 6. Document Schemas (document.py)
```python
from app.schemas import DocumentUpload, DocumentCreate, DocumentPreview
```

**المخططات الأساسية:**
- `DocumentBase`: معلومات الوثيقة الأساسية
- `DocumentUpload`: رفع وثيقة (متوافق مع FileUpload component)
- `DocumentCreate`: إنشاء وثيقة جديدة
- `DocumentRead`: قراءة بيانات الوثيقة

**مخططات متقدمة:**
- `DocumentPreview`: معاينة الوثيقة
- `DocumentEntityGroup`: وثائق مجمعة حسب الكيان
- `DocumentUploadProgress`: تقدم رفع الملف

**التعدادات:**
- `DocumentType`: 30+ نوع وثيقة
- `EntityType`: أنواع الكيانات المرتبطة
- `DocumentStatus`: حالة الوثيقة

## أمثلة الاستخدام | Usage Examples

### إنشاء مستخدم جديد
```python
from app.schemas import UserCreate

user_data = UserCreate(
    username="ahmed.mohammed",
    email="ahmed@company.com",
    password="SecurePassword123",
    full_name="أحمد محمد",
    role_id=2,
    company_id=1
)
```

### البحث في الموظفين
```python
from app.schemas import EmployeeSearchFilters

filters = EmployeeSearchFilters(
    search="أحمد",
    department="الموارد البشرية",
    status=EmployeeStatus.ACTIVE,
    page=1,
    page_size=20
)
```

### رفع وثيقة جديدة
```python
from app.schemas import DocumentUpload, DocumentType, EntityType

document = DocumentUpload(
    filename="contract.pdf",
    file_type=DocumentType.EMPLOYMENT_CONTRACT,
    entity_type=EntityType.EMPLOYEE,
    entity_id=123,
    title="عقد عمل أحمد محمد"
)
```

### تجديد رخصة
```python
from app.schemas import LicenseRenewal
from datetime import date

renewal = LicenseRenewal(
    renewal_date=date.today(),
    new_expiry_date=date(2025, 12, 31),
    renewal_cost=500.0,
    renewal_notes="تجديد سنوي"
)
```

## قواعد التحقق | Validation Rules

### قواعد عامة
- جميع النصوص تدعم UTF-8 (العربية والإنجليزية)
- أطوال الحقول محددة بحدود منطقية
- التحقق من صحة البريد الإلكتروني
- التحقق من التواريخ والمدى الزمنية

### قواعد خاصة
- **كلمات المرور**: 8 أحرف على الأقل، تحتوي على أرقام وأحرف
- **أرقام الهوية**: 8 أرقام على الأقل
- **أرقام الهاتف**: تنسيق دولي صحيح
- **تواريخ الانتهاء**: يجب أن تكون في المستقبل
- **أحجام الملفات**: حد أقصى 100 ميجابايت

## التكامل مع Frontend | Frontend Integration

### FileUpload Component
```typescript
// متوافق مع DocumentUpload schema
interface FileUploadProps {
  entityType: 'employee' | 'company' | 'license';
  entityId: number;
  fileType: DocumentType;
  customTypeName?: string;
}
```

### Search Components
```typescript
// مرشحات البحث موحدة عبر جميع النماذج
interface SearchFilters {
  search?: string;
  page: number;
  pageSize: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}
```

## إرشادات التطوير | Development Guidelines

### إضافة مخططات جديدة
1. إنشاء ملف جديد في مجلد schemas
2. تعريف BaseModel مع الحقول الأساسية
3. إنشاء مخططات Create/Update/Read
4. إضافة المخططات لملف __init__.py
5. كتابة اختبارات للتحقق من صحة المخططات

### قواعد التسمية
- استخدم أسماء واضحة وصفية
- Base للمخططات الأساسية
- Create للإنشاء
- Update للتحديث
- Read للقراءة
- Summary للملخصات
- Filters للمرشحات
- Response لاستجابات القوائم

### التوثيق
- أضف تعليقات عربية للحقول المهمة
- استخدم Field() مع description
- أضف أمثلة في docstrings
- وثق قواعد التحقق المعقدة

## اختبار المخططات | Testing Schemas

```python
import pytest
from app.schemas import UserCreate

def test_user_create_validation():
    # اختبار بيانات صحيحة
    valid_data = {
        "username": "test_user",
        "email": "test@example.com",
        "password": "ValidPass123",
        "full_name": "مستخدم تجريبي"
    }
    user = UserCreate(**valid_data)
    assert user.username == "test_user"
    
    # اختبار بيانات غير صحيحة
    with pytest.raises(ValueError):
        UserCreate(username="ab")  # قصير جداً
```

## الأداء والتحسين | Performance and Optimization

### نصائح للأداء
- استخدم Summary models للمراجع المتداخلة
- استخدم lazy loading للعلاقات الكبيرة
- حدد page_size معقول للقوائم
- استخدم indexes للحقول المستخدمة في البحث

### ذاكرة التخزين المؤقت
- Schema validation results مؤقتة
- استخدم Redis للبيانات المتكررة
- Cache permission checks
- Cache user sessions

## الأمان | Security

### حماية البيانات
- تشفير كلمات المرور
- تخفي البيانات الحساسة في المخرجات
- التحقق من الصلاحيات في كل عملية
- تسجيل العمليات الحساسة

### منع الهجمات
- SQL Injection prevention عبر ORM
- XSS prevention في المخرجات
- CSRF protection في الطلبات
- Rate limiting للعمليات الحساسة
