"""Add profile images to users."""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "0002"
down_revision: Union[str, None] = "0001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("users", sa.Column("profile_image", sa.String(length=500), nullable=True, server_default=""))


def downgrade() -> None:
    op.drop_column("users", "profile_image")
