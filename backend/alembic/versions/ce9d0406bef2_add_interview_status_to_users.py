"""add interview_status to users

Revision ID: ce9d0406bef2
Revises: 100d88c51a0a
Create Date: 2025-11-03 12:57:52.117439

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'ce9d0406bef2'
down_revision: Union[str, Sequence[str], None] = '100d88c51a0a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('users', sa.Column('interview_status', sa.String(length=50), nullable=False, server_default='not_started'))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('users', 'interview_status')