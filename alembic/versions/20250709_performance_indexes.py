"""
Database Performance Optimization Script
إضافة المؤشرات والتحسينات لقاعدة البيانات
"""

from alembic import op
import sqlalchemy as sa

def add_performance_indexes():
    """
    إضافة المؤشرات لتحسين أداء الاستعلامات
    """
    
    # مؤشرات للبحث السريع في جدول العمال
    op.create_index('idx_workers_custom_id', 'workers', ['custom_id'])
    op.create_index('idx_workers_name', 'workers', ['name'])
    op.create_index('idx_workers_company_id', 'workers', ['company_id'])
    op.create_index('idx_workers_license_id', 'workers', ['license_id'])
    
    # مؤشرات للبحث في جدول الشركات
    op.create_index('idx_companies_name', 'companies', ['file_name'])
    op.create_index('idx_companies_email', 'companies', ['email'])
    op.create_index('idx_companies_file_number', 'companies', ['file_number'])
    
    # مؤشرات للإشعارات
    op.create_index('idx_notifications_created_at', 'notifications', ['created_at'])
    op.create_index('idx_notifications_user_id', 'notifications', ['user_id'])
    op.create_index('idx_notifications_archived', 'notifications', ['archived'])
    
    # مؤشرات للتراخيص
    op.create_index('idx_licenses_company_id', 'licenses', ['company_id'])
    op.create_index('idx_licenses_name', 'licenses', ['name'])
    
    # مؤشرات للوثائق
    op.create_index('idx_worker_documents_worker_id', 'worker_documents', ['worker_id'])
    op.create_index('idx_worker_documents_expires_at', 'worker_documents', ['expires_at'])
    op.create_index('idx_company_documents_company_id', 'company_documents', ['company_id'])
    
    # مؤشرات مركبة للاستعلامات المعقدة
    op.create_index('idx_workers_company_status', 'workers', ['company_id', 'work_status'])
    op.create_index('idx_notifications_user_archived', 'notifications', ['user_id', 'archived'])

def upgrade():
    """Run the performance optimization migrations"""
    add_performance_indexes()

def downgrade():
    """Remove the performance optimization indexes"""
    # حذف المؤشرات المضافة
    indexes_to_drop = [
        'idx_workers_custom_id',
        'idx_workers_name', 
        'idx_workers_company_id',
        'idx_workers_license_id',
        'idx_companies_name',
        'idx_companies_email',
        'idx_companies_file_number',
        'idx_notifications_created_at',
        'idx_notifications_user_id',
        'idx_notifications_archived',
        'idx_licenses_company_id',
        'idx_licenses_name',
        'idx_worker_documents_worker_id',
        'idx_worker_documents_expires_at',
        'idx_company_documents_company_id',
        'idx_workers_company_status',
        'idx_notifications_user_archived'
    ]
    
    for index_name in indexes_to_drop:
        try:
            op.drop_index(index_name)
        except:
            pass  # Index might not exist
