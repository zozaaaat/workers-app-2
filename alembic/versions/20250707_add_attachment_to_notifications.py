"""
Revision ID: 20250707_add_attachment_to_notifications
Revises: 20250707_add_phone_to_companies_and_workers
Create Date: 2025-07-07
"""
from alembic import op
import sqlalchemy as sa

def upgrade():
    op.add_column('notifications', sa.Column('attachment', sa.String(), nullable=True))

def downgrade():
    op.drop_column('notifications', 'attachment')
