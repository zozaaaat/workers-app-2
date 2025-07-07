"""
Revision ID: 20250707_add_phone_to_companies_and_workers
Revises: 20250707_add_email_to_companies
Create Date: 2025-07-07
"""
from alembic import op
import sqlalchemy as sa

def upgrade():
    op.add_column('companies', sa.Column('phone', sa.String(), nullable=True))
    op.add_column('workers', sa.Column('phone', sa.String(), nullable=True))

def downgrade():
    op.drop_column('companies', 'phone')
    op.drop_column('workers', 'phone')
