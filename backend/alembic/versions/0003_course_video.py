"""Add course lesson video."""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "0003"
down_revision: Union[str, None] = "0002"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("courses", sa.Column("video", sa.String(length=500), nullable=True, server_default=""))


def downgrade() -> None:
    op.drop_column("courses", "video")
