"""
Revision ID: 20250707_add_attachment_to_notifications
Revises: 20250707_add_phone_to_companies_and_workers
Create Date: 2025-07-07
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '20250707_add_attachment_to_notifications'
down_revision = '20250707_add_phone_to_companies_and_workers'
branch_labels = None
depends_on = None

def upgrade():
    op.add_column('notifications', sa.Column('attachment', sa.String(), nullable=True))

def downgrade():
    op.drop_column('notifications', 'attachment')
