"""user model fixed

Revision ID: c05742d42adb
Revises: 0cb3891dc62f
Create Date: 2024-12-05 15:45:41.662026

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'c05742d42adb'
down_revision: Union[str, None] = '0cb3891dc62f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.alter_column('projects', 'status',
               existing_type=postgresql.ENUM('open', 'breaktime', 'finished', name='timeentrystatusenum'),
               nullable=True,
               existing_server_default=sa.text("'open'::timeentrystatusenum"))
    op.alter_column('projects', 'redo',
               existing_type=sa.BOOLEAN(),
               nullable=True,
               existing_server_default=sa.text('false'))
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.alter_column('projects', 'redo',
               existing_type=sa.BOOLEAN(),
               nullable=False,
               existing_server_default=sa.text('false'))
    op.alter_column('projects', 'status',
               existing_type=postgresql.ENUM('open', 'breaktime', 'finished', name='timeentrystatusenum'),
               nullable=False,
               existing_server_default=sa.text("'open'::timeentrystatusenum"))
    # ### end Alembic commands ###