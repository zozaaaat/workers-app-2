# FileUpload Component - مكون رفع الملفات المحدث

## الميزات الجديدة

### 1. أنواع الملفات المحددة مسبقاً
- بطاقة الهوية
- جواز السفر
- الإقامة
- الصورة الشخصية
- رخصة العمل
- إيصال الإيجار
- شهادة راتب
- كشف حساب بنكي
- شهادة طبية
- شهادة تعليمية
- عقد
- أخرى (مع إمكانية إدخال نوع مخصص)

### 2. تقييد أنواع الملفات
- يقبل فقط: `.jpg`, `.jpeg`, `.png`, `.pdf`
- رفض جميع أنواع الملفات الأخرى

### 3. نموذج تفاصيل الملف
- اختيار نوع الملف من القائمة المنسدلة
- إدخال نوع مخصص عند اختيار "أخرى"
- عرض معلومات الملف قبل الرفع

## طريقة الاستخدام

```tsx
import FileUpload from './components/common/FileUpload'

const MyComponent = () => {
  const handleFileSubmit = (data) => {
    console.log('File data:', data)
    // data contains:
    // - file: File object
    // - fileType: selected type or custom type
    // - customType: custom type if 'other' was selected
    // - entityId: related entity ID (optional)
  }

  return (
    <FileUpload
      onFileSubmit={handleFileSubmit}
      entityId="123" // اختياري - معرف الكيان المرتبط
      maxSize={5} // الحد الأقصى بالميجابايت
      className="mb-4"
      required={true} // اختياري
    />
  )
}
```

## البيانات المرسلة عند الرفع

```javascript
{
  file: File, // كائن الملف
  fileType: string, // نوع الملف المحدد أو المخصص
  customType?: string, // النوع المخصص (إذا تم اختيار "أخرى")
  entityId?: string | number // معرف الكيان المرتبط
}
```

## مثال للإرسال إلى الخادم

```javascript
const handleFileSubmit = async (data) => {
  const formData = new FormData()
  formData.append('file', data.file)
  formData.append('file_type', data.fileType)
  
  if (data.customType) {
    formData.append('custom_type', data.customType)
  }
  
  if (data.entityId) {
    formData.append('entity_id', data.entityId.toString())
  }

  try {
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    })
    
    if (response.ok) {
      console.log('تم رفع الملف بنجاح')
    }
  } catch (error) {
    console.error('خطأ في رفع الملف:', error)
  }
}
```

## التحقق من صحة البيانات

المكون يتحقق تلقائياً من:
- حجم الملف (يجب أن يكون أقل من الحد المحدد)
- نوع الملف (صور وPDF فقط)
- اختيار نوع الملف
- إدخال النوع المخصص عند الحاجة

## التخصيص

يمكن تخصيص المكون عبر:
- `maxSize`: الحد الأقصى لحجم الملف بالميجابايت
- `className`: فئات CSS إضافية
- `disabled`: تعطيل المكون
- `required`: جعل المكون مطلوباً

## ملاحظات تقنية

- المكون يستخدم `useState` لإدارة الحالة المحلية
- يدعم السحب والإفلات (Drag & Drop)
- يعرض شريط تقدم وهمي أثناء الرفع
- يعرض أنواع الملفات مع الملفات المرفوعة
- متجاوب مع جميع أحجام الشاشات
- يدعم اللغة العربية والاتجاه من اليمين لليسار

## الواجهة البرمجية (Props)

```typescript
interface FileUploadProps {
  onFileSubmit: (data: {
    file: File
    fileType: string
    customType?: string
    entityId?: string | number
  }) => void
  entityId?: string | number
  accept?: string
  maxSize?: number
  className?: string
  disabled?: boolean
  required?: boolean
}
```
