"""added new enum for both user and time entries

Revision ID: 0219a56bca0e
Revises: 3520e77a6100
Create Date: 2024-11-23 22:39:08.465042

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '0219a56bca0e'
down_revision: Union[str, None] = '3520e77a6100'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

# Enum definitions
userrole_enum = postgresql.ENUM('user', 'admin', name='userrole', create_type=False)
timeentrystatus_enum = postgresql.ENUM('open', 'submitted', 'approved', 'rejected', 'breaktime', name='timeentrystatusenum', create_type=False)


def upgrade() -> None:
    # Create enum types
    userrole_enum.create(op.get_bind(), checkfirst=True)
    timeentrystatus_enum.create(op.get_bind(), checkfirst=True)

    # Add new columns to time_entries
    op.add_column(
        'time_entries',
        sa.Column(
            'status',
            sa.Enum('open', 'submitted', 'approved', 'rejected', 'breaktime', name='timeentrystatusenum'),
            nullable=True,
            server_default='open'
        )
    )
    op.add_column('time_entries', sa.Column('price', sa.Integer(), nullable=True))
    op.add_column('time_entries', sa.Column('start_break_time', sa.DateTime(timezone=True), nullable=True))
    op.add_column('time_entries', sa.Column('end_break_time', sa.DateTime(timezone=True), nullable=True))

    # Alter existing columns in time_entries
    op.alter_column(
        'time_entries',
        'start_time',
        existing_type=postgresql.TIMESTAMP(),
        type_=sa.DateTime(timezone=True),
        existing_nullable=False
    )
    op.alter_column(
        'time_entries',
        'end_time',
        existing_type=postgresql.TIMESTAMP(),
        type_=sa.DateTime(timezone=True),
        nullable=True
    )

    # Alter the role column in users
    op.alter_column(
        'users',
        'role',
        existing_type=sa.VARCHAR(),
        type_=sa.Enum('user', 'admin', name='userrole'),
        existing_nullable=True,
        postgresql_using="role::userrole"
    )


def downgrade() -> None:
    # Revert the role column in users
    op.alter_column(
        'users',
        'role',
        existing_type=sa.Enum('user', 'admin', name='userrole'),
        type_=sa.VARCHAR(),
        existing_nullable=True,
        postgresql_using="role::text"
    )

    # Revert changes to time_entries columns
    op.alter_column(
        'time_entries',
        'end_time',
        existing_type=sa.DateTime(timezone=True),
        type_=postgresql.TIMESTAMP(),
        nullable=True
    )
    op.alter_column(
        'time_entries',
        'start_time',
        existing_type=sa.DateTime(timezone=True),
        type_=postgresql.TIMESTAMP(),
        existing_nullable=False
    )

    # Drop new columns from time_entries
    op.drop_column('time_entries', 'end_break_time')
    op.drop_column('time_entries', 'start_break_time')
    op.drop_column('time_entries', 'price')
    op.drop_column('time_entries', 'status')

    # Drop enum types
    timeentrystatus_enum.drop(op.get_bind(), checkfirst=True)
    userrole_enum.drop(op.get_bind(), checkfirst=True)
