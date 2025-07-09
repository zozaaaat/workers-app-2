"""merge permissions system

Revision ID: b4bb40740c04
Revises: add_permissions_system, 20250707_add_icon_color_to_notifications
Create Date: 2025-07-08 14:48:28.512439

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b4bb40740c04'
down_revision: Union[str, Sequence[str], None] = ('add_permissions_system', '20250707_add_icon_color_to_notifications')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
