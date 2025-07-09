"""add_company_documents_system

Revision ID: add_company_documents_system
Revises: 
Create Date: 2025-07-09 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import sqlite

# revision identifiers, used by Alembic.
revision = 'add_company_documents_system'
down_revision = None  # Set this to the latest revision ID
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
        sa.Column('is_active', sa.Boolean(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_document_types_id'), 'document_types', ['id'], unique=False)
    op.create_index(op.f('ix_document_types_name'), 'document_types', ['name'], unique=True)
    
    # إنشاء جدول مستندات الشركة
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
        sa.Column('notification_sent', sa.Boolean(), nullable=True),
        sa.Column('notification_6_months', sa.Boolean(), nullable=True),
        sa.Column('notification_3_months', sa.Boolean(), nullable=True),
        sa.Column('notification_1_month', sa.Boolean(), nullable=True),
        sa.Column('notification_1_week', sa.Boolean(), nullable=True),
        sa.ForeignKeyConstraint(['company_id'], ['companies.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_company_documents_id'), 'company_documents', ['id'], unique=False)
    op.create_index(op.f('ix_company_documents_company_id'), 'company_documents', ['company_id'], unique=False)
    op.create_index(op.f('ix_company_documents_document_type'), 'company_documents', ['document_type'], unique=False)
    op.create_index(op.f('ix_company_documents_expiry_date'), 'company_documents', ['expiry_date'], unique=False)

def downgrade():
    # حذف الجداول
    op.drop_index(op.f('ix_company_documents_expiry_date'), table_name='company_documents')
    op.drop_index(op.f('ix_company_documents_document_type'), table_name='company_documents')
    op.drop_index(op.f('ix_company_documents_company_id'), table_name='company_documents')
    op.drop_index(op.f('ix_company_documents_id'), table_name='company_documents')
    op.drop_table('company_documents')
    
    op.drop_index(op.f('ix_document_types_name'), table_name='document_types')
    op.drop_index(op.f('ix_document_types_id'), table_name='document_types')
    op.drop_table('document_types')
