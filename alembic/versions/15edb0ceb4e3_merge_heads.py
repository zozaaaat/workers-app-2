"""merge heads

Revision ID: 15edb0ceb4e3
Revises: 20250109_add_license_documents_and_archive, b2182c35b51d
Create Date: 2025-07-09 15:25:54.979813

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '15edb0ceb4e3'
down_revision: Union[str, Sequence[str], None] = ('20250109_add_license_documents_and_archive', 'b2182c35b51d')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
