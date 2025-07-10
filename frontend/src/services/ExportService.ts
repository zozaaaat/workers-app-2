import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// دعم الخطوط العربية
import '@fontsource/noto-sans-arabic';

export interface ExportOptions {
  format: 'excel' | 'pdf';
  filename?: string;
  title?: string;
  includeDate?: boolean;
  includeStats?: boolean;
  rtl?: boolean;
}

export interface ExportColumn {
  key: string;
  label: string;
  width?: number;
  format?: (value: any) => string;
}

export class ExportService {
  /**
   * تصدير البيانات إلى Excel
   */
  static exportToExcel(
    data: any[],
    columns: ExportColumn[],
    options: ExportOptions = { format: 'excel' }
  ): void {
    const filename = options.filename || `export_${new Date().toISOString().split('T')[0]}.xlsx`;
    
    // إعداد البيانات للتصدير
    const exportData = data.map(row => {
      const exportRow: any = {};
      columns.forEach(column => {
        const value = this.getNestedValue(row, column.key);
        exportRow[column.label] = column.format ? column.format(value) : value;
      });
      return exportRow;
    });

    // إضافة عنوان إذا كان مطلوباً
    const worksheetData = [];
    if (options.title) {
      worksheetData.push([options.title]);
      worksheetData.push([]); // سطر فارغ
    }

    // إضافة التاريخ إذا كان مطلوباً
    if (options.includeDate) {
      worksheetData.push([`تاريخ التصدير: ${new Date().toLocaleDateString('ar-SA')}`]);
      worksheetData.push([]); // سطر فارغ
    }

    // إضافة الإحصائيات إذا كانت مطلوبة
    if (options.includeStats) {
      worksheetData.push([`إجمالي السجلات: ${data.length}`]);
      worksheetData.push([]); // سطر فارغ
    }

    // إضافة رؤوس الأعمدة
    worksheetData.push(columns.map(col => col.label));

    // إضافة البيانات
    exportData.forEach(row => {
      worksheetData.push(columns.map(col => row[col.label] || ''));
    });

    // إنشاء workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(worksheetData);

    // تنسيق العرض
    const colWidths = columns.map(col => ({ 
      wch: col.width || 15 
    }));
    ws['!cols'] = colWidths;

    // إضافة ورقة العمل
    XLSX.utils.book_append_sheet(wb, ws, 'البيانات');

    // تحميل الملف
    XLSX.writeFile(wb, filename);
  }

  /**
   * تصدير البيانات إلى PDF مع دعم أفضل للعربية
   */
  static exportToPDF(
    data: any[],
    columns: ExportColumn[],
    options: ExportOptions = { format: 'pdf', rtl: true }
  ): void {
    const filename = options.filename || `export_${new Date().toISOString().split('T')[0]}.pdf`;
    
    // إنشاء مستند PDF جديد
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    // إعداد النص للغة العربية
    const isRTL = options.rtl !== false;
    let yPosition = 20;

    // إضافة العنوان
    if (options.title) {
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      const titleX = isRTL ? 277 : 20; // 297 - 20 = 277 للنص من اليمين
      doc.text(options.title, titleX, yPosition, { 
        align: isRTL ? 'right' : 'left',
        lang: 'ar'
      });
      yPosition += 15;
    }

    // إضافة التاريخ
    if (options.includeDate) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      const dateText = `تاريخ التصدير: ${new Date().toLocaleDateString('ar-SA')}`;
      const dateX = isRTL ? 277 : 20;
      doc.text(dateText, dateX, yPosition, { 
        align: isRTL ? 'right' : 'left' 
      });
      yPosition += 10;
    }

    // إضافة الإحصائيات
    if (options.includeStats) {
      const statsText = `إجمالي السجلات: ${data.length}`;
      const statsX = isRTL ? 277 : 20;
      doc.text(statsText, statsX, yPosition, { 
        align: isRTL ? 'right' : 'left' 
      });
      yPosition += 15;
    }

    // إعداد البيانات للجدول
    const tableData = data.map(row => {
      return columns.map(column => {
        const value = this.getNestedValue(row, column.key);
        return column.format ? column.format(value) : (value?.toString() || '');
      });
    });

    // إضافة الجدول مع تحسين العربية
    (doc as any).autoTable({
      head: [columns.map(col => col.label)],
      body: tableData,
      startY: yPosition,
      styles: {
        fontSize: 10,
        cellPadding: 4,
        halign: isRTL ? 'right' : 'left',
        font: 'helvetica',
        lineColor: [200, 200, 200],
        lineWidth: 0.1
      },
      headStyles: {
        fillColor: [52, 152, 219],
        textColor: 255,
        fontStyle: 'bold',
        halign: isRTL ? 'right' : 'left'
      },
      alternateRowStyles: {
        fillColor: [248, 249, 250]
      },
      tableLineColor: [200, 200, 200],
      tableLineWidth: 0.1,
      margin: { top: 20, right: 20, bottom: 20, left: 20 }
    });

    // إضافة footer
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const footerText = `صفحة ${i} من ${pageCount}`;
      doc.text(footerText, 148, 200, { align: 'center' });
      
      // إضافة تاريخ ووقت الإنشاء
      const timestamp = new Date().toLocaleString('ar-SA');
      doc.text(`تم الإنشاء في: ${timestamp}`, 277, 200, { align: 'right' });
    }

    // حفظ الملف
    doc.save(filename);
  }

  /**
   * تصدير متقدم مع خيارات مخصصة
   */
  static exportAdvanced(
    data: any[],
    columns: ExportColumn[],
    options: ExportOptions & {
      groupBy?: string;
      summary?: { [key: string]: 'sum' | 'avg' | 'count' };
      filters?: { [key: string]: any };
    }
  ): void {
    let processedData = [...data];

    // تطبيق الفلاتر
    if (options.filters) {
      processedData = processedData.filter(row => {
        return Object.entries(options.filters!).every(([key, value]) => {
          const rowValue = this.getNestedValue(row, key);
          return rowValue === value;
        });
      });
    }

    // تجميع البيانات
    if (options.groupBy) {
      const grouped = this.groupData(processedData, options.groupBy);
      processedData = Object.entries(grouped).flatMap(([group, items]) => [
        { [options.groupBy!]: `--- ${group} ---`, isGroupHeader: true },
        ...(items as any[])
      ]);
    }

    // إضافة ملخص
    if (options.summary) {
      const summaryRow = this.calculateSummary(processedData, options.summary);
      processedData.push(summaryRow);
    }

    // تصدير البيانات
    if (options.format === 'excel') {
      this.exportToExcel(processedData, columns, options);
    } else {
      this.exportToPDF(processedData, columns, options);
    }
  }

  /**
   * تصدير متعدد الأوراق (Excel فقط)
   */
  static exportMultiSheet(
    sheets: {
      name: string;
      data: any[];
      columns: ExportColumn[];
    }[],
    filename?: string
  ): void {
    const wb = XLSX.utils.book_new();
    
    sheets.forEach(sheet => {
      const ws = XLSX.utils.json_to_sheet(
        sheet.data.map(row => {
          const exportRow: any = {};
          sheet.columns.forEach(column => {
            const value = this.getNestedValue(row, column.key);
            exportRow[column.label] = column.format ? column.format(value) : value;
          });
          return exportRow;
        })
      );

      // تنسيق العرض
      const colWidths = sheet.columns.map(col => ({ 
        wch: col.width || 15 
      }));
      ws['!cols'] = colWidths;

      XLSX.utils.book_append_sheet(wb, ws, sheet.name);
    });

    const exportFilename = filename || `multi_export_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, exportFilename);
  }

  // مساعدات
  private static getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  private static groupData(data: any[], groupKey: string): { [key: string]: any[] } {
    return data.reduce((groups, item) => {
      const group = this.getNestedValue(item, groupKey) || 'غير محدد';
      if (!groups[group]) {
        groups[group] = [];
      }
      groups[group].push(item);
      return groups;
    }, {});
  }

  private static calculateSummary(
    data: any[], 
    summary: { [key: string]: 'sum' | 'avg' | 'count' }
  ): any {
    const summaryRow: any = { isTotal: true };
    
    Object.entries(summary).forEach(([key, operation]) => {
      const values = data
        .filter(row => !row.isGroupHeader && !row.isTotal)
        .map(row => this.getNestedValue(row, key))
        .filter(val => typeof val === 'number');

      switch (operation) {
        case 'sum':
          summaryRow[key] = values.reduce((sum, val) => sum + val, 0);
          break;
        case 'avg':
          summaryRow[key] = values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0;
          break;
        case 'count':
          summaryRow[key] = values.length;
          break;
      }
    });

    return summaryRow;
  }
}

// أمثلة للاستخدام
export const ExportTemplates = {
  // قالب تصدير العمال
  workers: {
    columns: [
      { key: 'custom_id', label: 'رقم العامل' },
      { key: 'name', label: 'الاسم' },
      { key: 'civil_id', label: 'الرقم المدني' },
      { key: 'nationality', label: 'الجنسية' },
      { key: 'job_title', label: 'المسمى الوظيفي' },
      { key: 'salary', label: 'الراتب', format: (val: number) => `${val} د.ك` },
      { key: 'hire_date', label: 'تاريخ التعيين', format: (val: string) => new Date(val).toLocaleDateString('ar-SA') },
      { key: 'company.file_name', label: 'الشركة' }
    ] as ExportColumn[]
  },

  // قالب تصدير الشركات
  companies: {
    columns: [
      { key: 'file_number', label: 'رقم الملف' },
      { key: 'file_name', label: 'اسم الشركة' },
      { key: 'commercial_registration_number', label: 'السجل التجاري' },
      { key: 'file_classification', label: 'التصنيف' },
      { key: 'legal_entity', label: 'الكيان القانوني' },
      { key: 'total_workers', label: 'عدد العمال' },
      { key: 'total_licenses', label: 'عدد التراخيص' },
      { key: 'email', label: 'البريد الإلكتروني' },
      { key: 'phone', label: 'رقم الهاتف' }
    ] as ExportColumn[]
  },

  // قالب تصدير التراخيص
  licenses: {
    columns: [
      { key: 'license_number', label: 'رقم الترخيص' },
      { key: 'name', label: 'اسم صاحب الترخيص' },
      { key: 'civil_id', label: 'الرقم المدني' },
      { key: 'license_type', label: 'نوع الترخيص' },
      { key: 'issuing_authority', label: 'جهة الإصدار' },
      { key: 'issue_date', label: 'تاريخ الإصدار', format: (val: string) => new Date(val).toLocaleDateString('ar-SA') },
      { key: 'expiry_date', label: 'تاريخ الانتهاء', format: (val: string) => new Date(val).toLocaleDateString('ar-SA') },
      { key: 'labor_count', label: 'عدد العمال المسموح' },
      { key: 'status', label: 'الحالة' },
      { key: 'company.file_name', label: 'الشركة' }
    ] as ExportColumn[]
  }
};
