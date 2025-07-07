"""
Revision ID: 20250707_add_scheduled_at_to_notifications
Revises: 20250707_add_attachment_to_notifications
Create Date: 2025-07-07
"""
from alembic import op
import sqlalchemy as sa

def upgrade():
    op.add_column('notifications', sa.Column('scheduled_at', sa.DateTime(), nullable=True, index=True))
    op.add_column('notifications', sa.Column('sent', sa.Boolean(), nullable=False, server_default='0', index=True))

def downgrade():
    op.drop_column('notifications', 'scheduled_at')
    op.drop_column('notifications', 'sent')
