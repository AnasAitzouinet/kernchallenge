"""delete time entry model and merge it with projects model

Revision ID: 0cb3891dc62f
Revises: 3f42a7c4b363
Create Date: 2024-12-05 15:36:52.543911

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '0cb3891dc62f'
down_revision: Union[str, None] = '3f42a7c4b363'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Add 'parent_id' column to 'breaks' table, initially nullable
    op.add_column('breaks', sa.Column('parent_id', sa.Integer(), nullable=True))

    # 2. Populate 'parent_id' with data from 'time_entries' table
    op.execute('''
        UPDATE breaks
        SET parent_id = time_entries.project_id
        FROM time_entries
        WHERE breaks.time_entry_id = time_entries.id
    ''')

    # 3. Alter 'parent_id' to be non-nullable
    op.alter_column('breaks', 'parent_id', nullable=False)

    # 4. Drop the foreign key constraint from 'breaks' to 'time_entries'
    op.drop_constraint('breaks_time_entry_id_fkey', 'breaks', type_='foreignkey')

    # 5. Drop the 'time_entry_id' column from 'breaks' table
    op.drop_column('breaks', 'time_entry_id')

    # 6. Create new foreign key constraint from 'breaks.parent_id' to 'projects.id'
    op.create_foreign_key('breaks_parent_id_fkey', 'breaks', 'projects', ['parent_id'], ['id'])

    # 7. Drop the index on 'time_entries' table
    op.drop_index('ix_time_entries_id', table_name='time_entries')

    # 8. Drop the 'time_entries' table
    op.drop_table('time_entries')

    # 9. Add new columns to 'projects' table
    status_enum = postgresql.ENUM('open', 'finished', 'breaktime', name='timeentrystatusenum')
    status_enum.create(op.get_bind(), checkfirst=True)

    op.add_column('projects', sa.Column('start_time', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()))
    op.add_column('projects', sa.Column('end_time', sa.DateTime(timezone=True), nullable=True))
    op.add_column('projects', sa.Column('status', status_enum, nullable=False, server_default='open'))
    op.add_column('projects', sa.Column('redo', sa.Boolean(), nullable=False, server_default='false'))

def downgrade() -> None:
    # Reverse the changes made in the upgrade

    # 1. Drop new columns from 'projects' table
    op.drop_column('projects', 'redo')
    op.drop_column('projects', 'status')
    op.drop_column('projects', 'end_time')
    op.drop_column('projects', 'start_time')

    # 2. Drop the enum type if no longer used
    op.execute('DROP TYPE IF EXISTS timeentrystatusenum')

    # 3. Drop the new foreign key constraint from 'breaks' table
    op.drop_constraint('breaks_parent_id_fkey', 'breaks', type_='foreignkey')

    # 4. Add 'time_entry_id' column back to 'breaks' table
    op.add_column('breaks', sa.Column('time_entry_id', sa.INTEGER(), nullable=False))

    # 5. Recreate the foreign key constraint from 'breaks' to 'time_entries'
    op.create_foreign_key('breaks_time_entry_id_fkey', 'breaks', 'time_entries', ['time_entry_id'], ['id'])

    # 6. Drop 'parent_id' column from 'breaks' table
    op.drop_column('breaks', 'parent_id')

    # 7. Recreate the 'time_entries' table
    status_enum = postgresql.ENUM('open', 'breaktime', 'finished', name='timeentrystatusenum')
    status_enum.create(op.get_bind(), checkfirst=True)

    op.create_table(
        'time_entries',
        sa.Column('id', sa.INTEGER(), autoincrement=True, nullable=False),
        sa.Column('project_id', sa.INTEGER(), nullable=False),
        sa.Column('user_id', sa.INTEGER(), nullable=False),
        sa.Column('start_time', sa.TIMESTAMP(timezone=True), nullable=False),
        sa.Column('end_time', sa.TIMESTAMP(timezone=True), nullable=True),
        sa.Column('description', sa.VARCHAR(), nullable=True),
        sa.Column('status', status_enum, nullable=True),
        sa.Column('price', sa.INTEGER(), nullable=True),
        sa.CheckConstraint('end_time > start_time', name='check_end_time'),
        sa.ForeignKeyConstraint(['project_id'], ['projects.id'], name='time_entries_project_id_fkey'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], name='time_entries_user_id_fkey'),
        sa.PrimaryKeyConstraint('id', name='time_entries_pkey')
    )

    # 8. Recreate the index on 'time_entries' table
    op.create_index('ix_time_entries_id', 'time_entries', ['id'], unique=False)
