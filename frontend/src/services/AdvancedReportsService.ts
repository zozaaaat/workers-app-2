/**
 * Advanced Reports Service
 * خدمة التقارير المتقدمة للبيانات المالية والإدارية
 */

export interface FinancialReportData {
  totalSalaries: number;
  totalBonuses: number;
  totalDeductions: number;
  netPayroll: number;
  workerCount: number;
  averageSalary: number;
  monthlyBreakdown: Array<{
    month: string;
    salaries: number;
    bonuses: number;
    deductions: number;
    net: number;
  }>;
}

export interface AttendanceReportData {
  totalWorkDays: number;
  totalAbsences: number;
  attendanceRate: number;
  frequentAbsentees: Array<{
    workerId: number;
    workerName: string;
    absenceCount: number;
    absenceRate: number;
  }>;
  absencesByReason: Array<{
    reason: string;
    count: number;
    percentage: number;
  }>;
  monthlyAttendance: Array<{
    month: string;
    workDays: number;
    absences: number;
    rate: number;
  }>;
}

export interface LicenseExpiryReportData {
  expiringIn30Days: any[];
  expiringIn15Days: any[];
  expiringIn7Days: any[];
  expired: any[];
  renewalRate: number;
  criticalLicenses: any[];
}

export interface ReportFilters {
  startDate?: string;
  endDate?: string;
  companyId?: number;
  departmentId?: number;
  workerIds?: number[];
}

export class AdvancedReportsService {
  private static baseUrl = 'http://localhost:8000';

  /**
   * تقرير الرواتب الشهري مع التفاصيل
   */
  static async generatePayrollReport(_filters: ReportFilters = {}): Promise<FinancialReportData> {
    try {
      // جلب بيانات العمال
      const workersResponse = await fetch(`${this.baseUrl}/workers/public`);
      const workers = await workersResponse.json();

      // جلب بيانات الخصومات
      const deductionsResponse = await fetch(`${this.baseUrl}/deductions`);
      const deductions = await deductionsResponse.json();

      // حساب إجمالي الرواتب
      const totalSalaries = workers.reduce((sum: number, worker: any) => 
        sum + (worker.salary || 0), 0);

      // حساب إجمالي الخصومات
      const totalDeductions = deductions.reduce((sum: number, deduction: any) => 
        sum + (deduction.amount || 0), 0);

      // حساب المكافآت (مؤقتاً نفترض 10% من الراتب)
      const totalBonuses = totalSalaries * 0.1;

      // حساب صافي الراتب
      const netPayroll = totalSalaries + totalBonuses - totalDeductions;

      const report: FinancialReportData = {
        totalSalaries,
        totalBonuses,
        totalDeductions,
        netPayroll,
        workerCount: workers.length,
        averageSalary: workers.length > 0 ? totalSalaries / workers.length : 0,
        monthlyBreakdown: this.generateMonthlyBreakdown(workers, deductions)
      };

      return report;
    } catch (error) {
      console.error('Error generating payroll report:', error);
      throw new Error('فشل في إنشاء تقرير الرواتب');
    }
  }

  /**
   * تقرير الحضور والغياب
   */
  static async generateAttendanceReport(_filters: ReportFilters = {}): Promise<AttendanceReportData> {
    try {
      // جلب بيانات الغيابات
      const absencesResponse = await fetch(`${this.baseUrl}/absences`);
      const absences = await absencesResponse.json();

      // جلب بيانات العمال
      const workersResponse = await fetch(`${this.baseUrl}/workers/public`);
      const workers = await workersResponse.json();

      // حساب إجمالي أيام العمل (30 يوم × عدد العمال)
      const totalWorkDays = workers.length * 30;
      const totalAbsences = absences.length;
      const attendanceRate = totalWorkDays > 0 ? 
        ((totalWorkDays - totalAbsences) / totalWorkDays) * 100 : 100;

      // العمال المتكررون في الغياب
      const absencesByWorker = this.groupAbsencesByWorker(absences, workers);
      const frequentAbsentees = absencesByWorker
        .filter(worker => worker.absenceCount >= 3)
        .sort((a, b) => b.absenceCount - a.absenceCount)
        .slice(0, 10);

      // تجميع الغيابات حسب السبب
      const absencesByReason = this.groupAbsencesByReason(absences);

      const report: AttendanceReportData = {
        totalWorkDays,
        totalAbsences,
        attendanceRate,
        frequentAbsentees,
        absencesByReason,
        monthlyAttendance: this.generateMonthlyAttendance(absences, workers)
      };

      return report;
    } catch (error) {
      console.error('Error generating attendance report:', error);
      throw new Error('فشل في إنشاء تقرير الحضور والغياب');
    }
  }

  /**
   * تقرير انتهاء التراخيص
   */
  static async generateLicenseExpiryReport(): Promise<LicenseExpiryReportData> {
    try {
      const response = await fetch(`${this.baseUrl}/licenses`);
      const licenses = await response.json();

      const now = new Date();
      const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      const in15Days = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000);
      const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

      const expiringIn30Days = licenses.filter((license: any) => {
        const expiryDate = new Date(license.expiry_date);
        return expiryDate >= now && expiryDate <= in30Days;
      });

      const expiringIn15Days = licenses.filter((license: any) => {
        const expiryDate = new Date(license.expiry_date);
        return expiryDate >= now && expiryDate <= in15Days;
      });

      const expiringIn7Days = licenses.filter((license: any) => {
        const expiryDate = new Date(license.expiry_date);
        return expiryDate >= now && expiryDate <= in7Days;
      });

      const expired = licenses.filter((license: any) => {
        const expiryDate = new Date(license.expiry_date);
        return expiryDate < now;
      });

      // حساب معدل التجديد (افتراضي)
      const renewalRate = licenses.length > 0 ? 
        ((licenses.length - expired.length) / licenses.length) * 100 : 100;

      const report: LicenseExpiryReportData = {
        expiringIn30Days,
        expiringIn15Days,
        expiringIn7Days,
        expired,
        renewalRate,
        criticalLicenses: expiringIn7Days.concat(expired)
      };

      return report;
    } catch (error) {
      console.error('Error generating license expiry report:', error);
      throw new Error('فشل في إنشاء تقرير انتهاء التراخيص');
    }
  }

  /**
   * إنشاء التفاصيل الشهرية للرواتب
   */
  private static generateMonthlyBreakdown(workers: any[], deductions: any[]) {
    const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو'];
    
    return months.map(month => {
      const salaries = workers.reduce((sum, worker) => sum + (worker.salary || 0), 0);
      const bonuses = salaries * 0.1; // 10% مكافآت
      const monthlyDeductions = deductions.reduce((sum, d) => sum + (d.amount || 0), 0) / 6;
      
      return {
        month,
        salaries,
        bonuses,
        deductions: monthlyDeductions,
        net: salaries + bonuses - monthlyDeductions
      };
    });
  }

  /**
   * تجميع الغيابات حسب العامل
   */
  private static groupAbsencesByWorker(absences: any[], workers: any[]) {
    const absenceMap = new Map();
    
    absences.forEach(absence => {
      const workerId = absence.worker_id || 1; // افتراضي
      const current = absenceMap.get(workerId) || { absenceCount: 0, workerName: absence.worker_name || 'غير محدد' };
      absenceMap.set(workerId, {
        ...current,
        absenceCount: current.absenceCount + 1,
        workerId
      });
    });

    return Array.from(absenceMap.values()).map(worker => ({
      ...worker,
      absenceRate: workers.length > 0 ? (worker.absenceCount / 30) * 100 : 0
    }));
  }

  /**
   * تجميع الغيابات حسب السبب
   */
  private static groupAbsencesByReason(absences: any[]) {
    const reasonMap = new Map();
    
    absences.forEach(absence => {
      const reason = absence.reason || 'غير محدد';
      const current = reasonMap.get(reason) || 0;
      reasonMap.set(reason, current + 1);
    });

    const total = absences.length;
    return Array.from(reasonMap.entries()).map(([reason, count]) => ({
      reason,
      count,
      percentage: total > 0 ? (count / total) * 100 : 0
    }));
  }

  /**
   * إنشاء البيانات الشهرية للحضور
   */
  private static generateMonthlyAttendance(absences: any[], workers: any[]) {
    const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو'];
    const workersCount = workers.length;
    
    return months.map(month => {
      const workDays = workersCount * 30;
      const monthlyAbsences = Math.floor(absences.length / 6); // توزيع الغيابات
      const rate = workDays > 0 ? ((workDays - monthlyAbsences) / workDays) * 100 : 100;
      
      return {
        month,
        workDays,
        absences: monthlyAbsences,
        rate
      };
    });
  }

  /**
   * تصدير التقرير إلى Excel
   */
  static async exportReportToExcel(reportType: string, data: any, filename?: string) {
    const { ExportService } = await import('./ExportService');
    
    const columns = this.getReportColumns(reportType);
    const exportData = this.formatDataForExport(reportType, data);
    
    ExportService.exportToExcel(exportData, columns, {
      format: 'excel',
      filename: filename || `${reportType}_report_${new Date().toISOString().split('T')[0]}.xlsx`,
      title: this.getReportTitle(reportType),
      includeDate: true,
      includeStats: true
    });
  }

  /**
   * تصدير التقرير إلى PDF
   */
  static async exportReportToPDF(reportType: string, data: any, filename?: string) {
    const { ExportService } = await import('./ExportService');
    
    const columns = this.getReportColumns(reportType);
    const exportData = this.formatDataForExport(reportType, data);
    
    ExportService.exportToPDF(exportData, columns, {
      format: 'pdf',
      filename: filename || `${reportType}_report_${new Date().toISOString().split('T')[0]}.pdf`,
      title: this.getReportTitle(reportType),
      includeDate: true,
      includeStats: true,
      rtl: true
    });
  }

  /**
   * الحصول على أعمدة التقرير
   */
  private static getReportColumns(reportType: string) {
    switch (reportType) {
      case 'payroll':
        return [
          { key: 'workerName', label: 'اسم العامل' },
          { key: 'salary', label: 'الراتب الأساسي' },
          { key: 'bonus', label: 'المكافآت' },
          { key: 'deductions', label: 'الخصومات' },
          { key: 'netSalary', label: 'صافي الراتب' }
        ];
      case 'attendance':
        return [
          { key: 'workerName', label: 'اسم العامل' },
          { key: 'workDays', label: 'أيام العمل' },
          { key: 'absences', label: 'أيام الغياب' },
          { key: 'attendanceRate', label: 'معدل الحضور' }
        ];
      case 'licenses':
        return [
          { key: 'name', label: 'اسم الترخيص' },
          { key: 'licenseNumber', label: 'رقم الترخيص' },
          { key: 'expiryDate', label: 'تاريخ الانتهاء' },
          { key: 'status', label: 'الحالة' }
        ];
      default:
        return [];
    }
  }

  /**
   * تنسيق البيانات للتصدير
   */
  private static formatDataForExport(_reportType: string, data: any) {
    // سيتم تطبيق تنسيق مخصص لكل نوع تقرير
    return data;
  }

  /**
   * الحصول على عنوان التقرير
   */
  private static getReportTitle(reportType: string) {
    switch (reportType) {
      case 'payroll': return 'تقرير الرواتب الشهري';
      case 'attendance': return 'تقرير الحضور والغياب';
      case 'licenses': return 'تقرير انتهاء التراخيص';
      default: return 'تقرير عام';
    }
  }
}
