"""Add company documents system

Revision ID: add_company_documents
Revises: b4bb40740c04
Create Date: 2025-01-09 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import sqlite

# revision identifiers, used by Alembic.
revision = 'add_company_documents'
down_revision = 'b4bb40740c04'
branch_labels = None
depends_on = None

def upgrade():
    # إنشاء جدول أنواع المستندات
    op.create_table('document_types',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('name_ar', sa.String(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('required_fields', sa.Text(), nullable=True),
        sa.Column('notification_periods', sa.Text(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=True, default=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('name')
    )
    op.create_index(op.f('ix_document_types_id'), 'document_types', ['id'], unique=False)

    # إنشاء جدول مستندات الشركات
    op.create_table('company_documents',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('company_id', sa.Integer(), nullable=False),
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
        sa.Column('notification_sent', sa.Boolean(), nullable=True, default=False),
        sa.Column('notification_6_months', sa.Boolean(), nullable=True, default=False),
        sa.Column('notification_3_months', sa.Boolean(), nullable=True, default=False),
        sa.Column('notification_1_month', sa.Boolean(), nullable=True, default=False),
        sa.Column('notification_1_week', sa.Boolean(), nullable=True, default=False),
        sa.ForeignKeyConstraint(['company_id'], ['companies.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_company_documents_id'), 'company_documents', ['id'], unique=False)

    # إدخال أنواع المستندات الأساسية
    op.execute("""
        INSERT INTO document_types (name, name_ar, description, required_fields, notification_periods, is_active) VALUES
        ('commercial_license', 'الرخصة التجارية', 'رخصة مزاولة النشاط التجاري', '["license_number", "issue_date", "expiry_date", "issuing_authority"]', '[180, 90, 30, 7]', 1),
        ('import_license', 'رخصة الاستيراد', 'رخصة استيراد البضائع', '["license_number", "issue_date", "expiry_date", "issuing_authority"]', '[180, 90, 30, 7]', 1),
        ('advertisement_license', 'رخصة الإعلان', 'رخصة الإعلان والتسويق', '["license_number", "issue_date", "expiry_date", "issuing_authority"]', '[180, 90, 30, 7]', 1),
        ('health_certificate', 'شهادة صحية', 'شهادة صحية للمؤسسة', '["license_number", "issue_date", "expiry_date", "issuing_authority"]', '[90, 30, 7]', 1),
        ('fire_safety_certificate', 'شهادة السلامة من الحريق', 'شهادة السلامة من الحريق', '["license_number", "issue_date", "expiry_date", "issuing_authority"]', '[90, 30, 7]', 1),
        ('environmental_permit', 'تصريح بيئي', 'تصريح الأثر البيئي', '["license_number", "issue_date", "expiry_date", "issuing_authority"]', '[180, 90, 30, 7]', 1),
        ('labor_permit', 'تصريح العمالة', 'تصريح استقدام العمالة', '["license_number", "issue_date", "expiry_date", "issuing_authority"]', '[180, 90, 30, 7]', 1),
        ('tax_certificate', 'شهادة الضريبة', 'شهادة الضريبة المدفوعة', '["license_number", "issue_date", "expiry_date", "issuing_authority"]', '[90, 30, 7]', 1),
        ('other', 'أخرى', 'مستندات أخرى', '["license_number", "issue_date", "expiry_date"]', '[180, 90, 30, 7]', 1)
    """)

def downgrade():
    # حذف الجداول
    op.drop_index(op.f('ix_company_documents_id'), table_name='company_documents')
    op.drop_table('company_documents')
    op.drop_index(op.f('ix_document_types_id'), table_name='document_types')
    op.drop_table('document_types')
