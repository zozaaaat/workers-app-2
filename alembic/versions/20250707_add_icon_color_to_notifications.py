"""
Revision ID: 20250707_add_icon_color_to_notifications
Revises: 20250707_add_action_fields_to_notifications
Create Date: 2025-07-07
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '20250707_add_icon_color_to_notifications'
down_revision = '20250707_add_action_fields_to_notifications'
branch_labels = None
depends_on = None

def upgrade():
    op.add_column('notifications', sa.Column('icon', sa.String(), nullable=True))
    op.add_column('notifications', sa.Column('color', sa.String(), nullable=True))

def downgrade():
    op.drop_column('notifications', 'icon')
    op.drop_column('notifications', 'color')
