"""add notifications table
Revision ID: notif20250707
Revises: 
Create Date: 2025-07-07
"""
from alembic import op
import sqlalchemy as sa

revision = 'notif20250707'
down_revision = '72320e91abcf'
branch_labels = None
depends_on = None

def upgrade():
    op.create_table(
        'notifications',
        sa.Column('id', sa.Integer, primary_key=True, index=True),
        sa.Column('message', sa.String, nullable=False),
        sa.Column('created_at', sa.DateTime, nullable=False),
        sa.Column('read', sa.Boolean, default=False),
        sa.Column('user_id', sa.Integer, sa.ForeignKey('users.id'), nullable=True),
        sa.Column('type', sa.String, default='general'),
        sa.Column('expires_at', sa.DateTime, nullable=True),
    )

def downgrade():
    op.drop_table('notifications')
