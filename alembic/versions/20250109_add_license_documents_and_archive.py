"""Add license documents and archive system

Revision ID: 20250109_add_license_documents_and_archive
Revises: 20250109_add_company_documents
Create Date: 2025-01-09 15:30:00.000000

"""
from alembic import op
import sqlalchemy as sa
from datetime import datetime

# revision identifiers, used by Alembic.
revision = '20250109_add_license_documents_and_archive'
down_revision = 'add_company_documents_system'
branch_labels = None
depends_on = None

def upgrade():
    # إنشاء جدول أنواع الرخص
    op.create_table('license_types',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('name_ar', sa.String(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('is_main_license', sa.Boolean(), nullable=True),
        sa.Column('parent_license_type_id', sa.Integer(), nullable=True),
        sa.Column('required_fields', sa.Text(), nullable=True),
        sa.Column('notification_periods', sa.Text(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=True),
        sa.ForeignKeyConstraint(['parent_license_type_id'], ['license_types.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('name')
    )
    op.create_index(op.f('ix_license_types_id'), 'license_types', ['id'], unique=False)
    
    # إنشاء جدول مستندات الرخص
    op.create_table('license_documents',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('license_id', sa.Integer(), nullable=False),
        sa.Column('filename', sa.String(), nullable=False),
        sa.Column('original_filename', sa.String(), nullable=False),
        sa.Column('filepath', sa.String(), nullable=False),
        sa.Column('filetype', sa.String(), nullable=False),
        sa.Column('document_type', sa.String(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('upload_date', sa.DateTime(), nullable=True),
        sa.Column('extracted_text', sa.Text(), nullable=True),
        sa.Column('license_number', sa.String(), nullable=True),
        sa.Column('issue_date', sa.Date(), nullable=True),
        sa.Column('expiry_date', sa.Date(), nullable=True),
        sa.Column('issuing_authority', sa.String(), nullable=True),
        sa.Column('license_status', sa.String(), nullable=True),
        sa.Column('notification_sent', sa.Boolean(), nullable=True),
        sa.Column('notification_6_months', sa.Boolean(), nullable=True),
        sa.Column('notification_3_months', sa.Boolean(), nullable=True),
        sa.Column('notification_1_month', sa.Boolean(), nullable=True),
        sa.Column('notification_1_week', sa.Boolean(), nullable=True),
        sa.ForeignKeyConstraint(['license_id'], ['licenses.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_license_documents_id'), 'license_documents', ['id'], unique=False)
    
    # إنشاء جدول فئات الأرشيف
    op.create_table('archive_categories',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('name_ar', sa.String(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('color', sa.String(), nullable=True),
        sa.Column('icon', sa.String(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('name')
    )
    op.create_index(op.f('ix_archive_categories_id'), 'archive_categories', ['id'], unique=False)
    
    # إنشاء جدول أنواع الأرشيف
    op.create_table('archive_types',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('name_ar', sa.String(), nullable=False),
        sa.Column('category_id', sa.Integer(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('required_fields', sa.Text(), nullable=True),
        sa.Column('is_recurring', sa.Boolean(), nullable=True),
        sa.Column('reminder_periods', sa.Text(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=True),
        sa.ForeignKeyConstraint(['category_id'], ['archive_categories.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('name')
    )
    op.create_index(op.f('ix_archive_types_id'), 'archive_types', ['id'], unique=False)
    
    # إنشاء جدول الأرشيف
    op.create_table('document_archive',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('filename', sa.String(), nullable=False),
        sa.Column('original_filename', sa.String(), nullable=False),
        sa.Column('filepath', sa.String(), nullable=False),
        sa.Column('filetype', sa.String(), nullable=False),
        sa.Column('archive_type', sa.String(), nullable=False),
        sa.Column('category', sa.String(), nullable=False),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('upload_date', sa.DateTime(), nullable=True),
        sa.Column('contract_number', sa.String(), nullable=True),
        sa.Column('amount', sa.Float(), nullable=True),
        sa.Column('currency', sa.String(), nullable=True),
        sa.Column('start_date', sa.Date(), nullable=True),
        sa.Column('end_date', sa.Date(), nullable=True),
        sa.Column('party_name', sa.String(), nullable=True),
        sa.Column('party_contact', sa.String(), nullable=True),
        sa.Column('payment_date', sa.Date(), nullable=True),
        sa.Column('payment_method', sa.String(), nullable=True),
        sa.Column('reference_number', sa.String(), nullable=True),
        sa.Column('company_id', sa.Integer(), nullable=True),
        sa.Column('license_id', sa.Integer(), nullable=True),
        sa.Column('is_recurring', sa.Boolean(), nullable=True),
        sa.Column('next_due_date', sa.Date(), nullable=True),
        sa.Column('reminder_sent', sa.Boolean(), nullable=True),
        sa.Column('status', sa.String(), nullable=True),
        sa.Column('is_important', sa.Boolean(), nullable=True),
        sa.ForeignKeyConstraint(['company_id'], ['companies.id'], ),
        sa.ForeignKeyConstraint(['license_id'], ['licenses.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_document_archive_id'), 'document_archive', ['id'], unique=False)
    
    # إدخال البيانات الأساسية لأنواع الرخص
    op.execute("""
        INSERT INTO license_types (name, name_ar, description, is_main_license, required_fields, notification_periods, is_active)
        VALUES 
        ('commercial_license', 'الرخصة التجارية', 'الرخصة التجارية الأساسية', true, '["license_number", "issue_date", "expiry_date"]', '["6_months", "3_months", "1_month", "1_week"]', true),
        ('import_license', 'رخصة الاستيراد', 'رخصة الاستيراد والتصدير', true, '["license_number", "issue_date", "expiry_date", "issuing_authority"]', '["6_months", "3_months", "1_month", "1_week"]', true),
        ('industrial_license', 'الرخصة الصناعية', 'الرخصة الصناعية', true, '["license_number", "issue_date", "expiry_date", "issuing_authority"]', '["6_months", "3_months", "1_month", "1_week"]', true),
        ('professional_license', 'الرخصة المهنية', 'الرخصة المهنية', true, '["license_number", "issue_date", "expiry_date", "issuing_authority"]', '["6_months", "3_months", "1_month", "1_week"]', true),
        ('health_license', 'الرخصة الصحية', 'الرخصة الصحية', false, '["license_number", "issue_date", "expiry_date", "issuing_authority"]', '["6_months", "3_months", "1_month", "1_week"]', true),
        ('environmental_license', 'الرخصة البيئية', 'الرخصة البيئية', false, '["license_number", "issue_date", "expiry_date", "issuing_authority"]', '["6_months", "3_months", "1_month", "1_week"]', true),
        ('fire_safety_license', 'رخصة السلامة من الحريق', 'رخصة السلامة من الحريق', false, '["license_number", "issue_date", "expiry_date", "issuing_authority"]', '["6_months", "3_months", "1_month", "1_week"]', true),
        ('advertising_license', 'رخصة الإعلان', 'رخصة الإعلان والدعاية', false, '["license_number", "issue_date", "expiry_date", "issuing_authority"]', '["6_months", "3_months", "1_month", "1_week"]', true)
    """)
    
    # إدخال البيانات الأساسية لفئات الأرشيف
    op.execute("""
        INSERT INTO archive_categories (name, name_ar, description, color, icon, is_active)
        VALUES 
        ('contracts', 'العقود', 'جميع أنواع العقود', '#28a745', 'contract', true),
        ('receipts', 'الفواتير والإيصالات', 'فواتير وإيصالات الدفع', '#007bff', 'receipt', true),
        ('insurances', 'التأمينات', 'بوالص التأمين', '#17a2b8', 'shield', true),
        ('guarantees', 'الضمانات', 'الضمانات البنكية والمالية', '#ffc107', 'guarantee', true),
        ('legal_documents', 'المستندات القانونية', 'المستندات القانونية والرسمية', '#dc3545', 'legal', true),
        ('financial_documents', 'المستندات المالية', 'المستندات المالية والمحاسبية', '#6f42c1', 'financial', true),
        ('utilities', 'الخدمات العامة', 'فواتير الكهرباء والماء والغاز', '#fd7e14', 'utilities', true),
        ('maintenance', 'الصيانة', 'عقود وفواتير الصيانة', '#20c997', 'maintenance', true),
        ('other', 'أخرى', 'مستندات أخرى', '#6c757d', 'other', true)
    """)
    
    # إدخال البيانات الأساسية لأنواع الأرشيف
    op.execute("""
        INSERT INTO archive_types (name, name_ar, category_id, description, required_fields, is_recurring, reminder_periods, is_active)
        VALUES 
        ('rent_contract', 'عقد إيجار', 1, 'عقد إيجار المقر أو المكتب', '["contract_number", "party_name", "amount", "start_date", "end_date"]', false, '["1_month", "1_week"]', true),
        ('rent_receipt', 'إيصال إيجار', 2, 'إيصال دفع الإيجار الشهري', '["amount", "payment_date", "reference_number"]', true, '["1_week"]', true),
        ('electricity_bill', 'فاتورة كهرباء', 2, 'فاتورة الكهرباء الشهرية', '["amount", "payment_date", "reference_number"]', true, '["1_week"]', true),
        ('water_bill', 'فاتورة مياه', 2, 'فاتورة المياه الشهرية', '["amount", "payment_date", "reference_number"]', true, '["1_week"]', true),
        ('insurance_policy', 'بوليصة تأمين', 3, 'بوليصة التأمين', '["contract_number", "amount", "start_date", "end_date", "party_name"]', false, '["1_month", "1_week"]', true),
        ('bank_guarantee', 'ضمان بنكي', 4, 'ضمان بنكي', '["contract_number", "amount", "start_date", "end_date", "party_name"]', false, '["1_month", "1_week"]', true),
        ('maintenance_contract', 'عقد صيانة', 8, 'عقد صيانة', '["contract_number", "party_name", "amount", "start_date", "end_date"]', false, '["1_month", "1_week"]', true),
        ('service_contract', 'عقد خدمة', 1, 'عقد خدمة', '["contract_number", "party_name", "amount", "start_date", "end_date"]', false, '["1_month", "1_week"]', true)
    """)

def downgrade():
    # حذف الجداول بالترتيب العكسي
    op.drop_table('document_archive')
    op.drop_table('archive_types')
    op.drop_table('archive_categories')
    op.drop_table('license_documents')
    op.drop_table('license_types')
