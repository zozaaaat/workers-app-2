"""
Revision ID: 20250707_add_group_key_to_notifications
Revises: notif20250707
Create Date: 2025-07-07
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '20250707_add_group_key_to_notifications'
down_revision = 'notif20250707'
branch_labels = None
depends_on = None

def upgrade():
    op.add_column('notifications', sa.Column('group_key', sa.String(), nullable=True, index=True))

def downgrade():
    op.drop_column('notifications', 'group_key')
