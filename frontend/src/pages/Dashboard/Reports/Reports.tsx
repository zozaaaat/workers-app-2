import React from 'react'

const Reports: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">التقارير</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* تقرير العمال */}
        <div className="card hover:shadow-lg transition-shadow cursor-pointer">
          <h3 className="text-lg font-semibold mb-2">تقرير العمال</h3>
          <p className="text-gray-600 mb-4">عرض إحصائيات شاملة عن العمال والموظفين</p>
          <button className="btn-primary w-full">عرض التقرير</button>
        </div>

        {/* تقرير التراخيص */}
        <div className="card hover:shadow-lg transition-shadow cursor-pointer">
          <h3 className="text-lg font-semibold mb-2">تقرير التراخيص</h3>
          <p className="text-gray-600 mb-4">معلومات عن حالة التراخيص وتواريخ انتهاء الصلاحية</p>
          <button className="btn-primary w-full">عرض التقرير</button>
        </div>

        {/* تقرير الإجازات */}
        <div className="card hover:shadow-lg transition-shadow cursor-pointer">
          <h3 className="text-lg font-semibold mb-2">تقرير الإجازات</h3>
          <p className="text-gray-600 mb-4">إحصائيات الإجازات والغيابات للعمال</p>
          <button className="btn-primary w-full">عرض التقرير</button>
        </div>

        {/* تقرير الخصومات */}
        <div className="card hover:shadow-lg transition-shadow cursor-pointer">
          <h3 className="text-lg font-semibold mb-2">تقرير الخصومات</h3>
          <p className="text-gray-600 mb-4">تفاصيل الخصومات المالية والجزاءات</p>
          <button className="btn-primary w-full">عرض التقرير</button>
        </div>

        {/* تقرير الوثائق */}
        <div className="card hover:shadow-lg transition-shadow cursor-pointer">
          <h3 className="text-lg font-semibold mb-2">تقرير الوثائق</h3>
          <p className="text-gray-600 mb-4">حالة وثائق الشركة والملفات المرفوعة</p>
          <button className="btn-primary w-full">عرض التقرير</button>
        </div>

        {/* تقرير شامل */}
        <div className="card hover:shadow-lg transition-shadow cursor-pointer">
          <h3 className="text-lg font-semibold mb-2">تقرير شامل</h3>
          <p className="text-gray-600 mb-4">تقرير عام يشمل جميع البيانات والإحصائيات</p>
          <button className="btn-primary w-full">عرض التقرير</button>
        </div>

      </div>
    </div>
  )
}

export default Reports
