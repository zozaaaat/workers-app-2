"""
Revision ID: 20250707_add_email_to_companies
Revises: 20250707_add_allowed_roles_to_notifications
Create Date: 2025-07-07
"""
from alembic import op
import sqlalchemy as sa

def upgrade():
    op.add_column('companies', sa.Column('email', sa.String(), nullable=True, unique=True, index=True))

def downgrade():
    op.drop_column('companies', 'email')
