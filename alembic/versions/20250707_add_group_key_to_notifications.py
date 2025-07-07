"""
Revision ID: 20250707_add_group_key_to_notifications
Revises: 
Create Date: 2025-07-07
"""
from alembic import op
import sqlalchemy as sa

def upgrade():
    op.add_column('notifications', sa.Column('group_key', sa.String(), nullable=True, index=True))

def downgrade():
    op.drop_column('notifications', 'group_key')
