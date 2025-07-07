"""
Revision ID: 20250707_add_action_fields_to_notifications
Revises: 20250707_add_scheduled_at_to_notifications
Create Date: 2025-07-07
"""
from alembic import op
import sqlalchemy as sa

def upgrade():
    op.add_column('notifications', sa.Column('action_required', sa.String(), nullable=True))
    op.add_column('notifications', sa.Column('action_status', sa.String(), nullable=True))

def downgrade():
    op.drop_column('notifications', 'action_required')
    op.drop_column('notifications', 'action_status')
