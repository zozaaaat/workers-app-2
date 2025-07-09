"""empty message

Revision ID: b2182c35b51d
Revises: add_company_documents, add_company_documents_system, af97ac112f80
Create Date: 2025-07-09 11:48:35.905071

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b2182c35b51d'
down_revision: Union[str, Sequence[str], None] = ('add_company_documents', 'add_company_documents_system', 'af97ac112f80')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
