"""
Revision ID: 20250707_add_allowed_roles_to_notifications
Revises: 20250707_add_archived_to_notifications
Create Date: 2025-07-07
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '20250707_add_allowed_roles_to_notifications'
down_revision = '20250707_add_archived_to_notifications'
branch_labels = None
depends_on = None

def upgrade():
    op.add_column('notifications', sa.Column('allowed_roles', sa.String(), nullable=True))

def downgrade():
    op.drop_column('notifications', 'allowed_roles')
