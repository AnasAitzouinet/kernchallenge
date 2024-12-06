"""breaktime fixed

Revision ID: 855ac52ad34d
Revises: 3cc42f111875
Create Date: 2024-12-05 15:51:45.715993

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '855ac52ad34d'
down_revision: Union[str, None] = '3cc42f111875'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Add 'project_id' column to 'breaks' table, initially nullable
    op.add_column('breaks', sa.Column('project_id', sa.Integer(), nullable=True))

    # 2. Populate 'project_id' with data from 'parent_id'
    op.execute('''
        UPDATE breaks
        SET project_id = parent_id
    ''')

    # 3. Alter 'project_id' to be non-nullable
    op.alter_column('breaks', 'project_id', nullable=False)

    # 4. Drop the old foreign key constraint from 'breaks' to 'projects' via 'parent_id'
    op.drop_constraint('breaks_parent_id_fkey', 'breaks', type_='foreignkey')

    # 5. Create new foreign key constraint from 'breaks.project_id' to 'projects.id' with ON DELETE CASCADE
    op.create_foreign_key(
        'breaks_project_id_fkey',
        'breaks',
        'projects',
        ['project_id'],
        ['id'],
        ondelete='CASCADE'
    )

    # 6. Drop the 'parent_id' column from 'breaks' table
    op.drop_column('breaks', 'parent_id')


def downgrade() -> None:
    # Reverse the changes made in the upgrade

    # 1. Add 'parent_id' column back to 'breaks' table, initially nullable
    op.add_column('breaks', sa.Column('parent_id', sa.Integer(), nullable=True))

    # 2. Populate 'parent_id' with data from 'project_id'
    op.execute('''
        UPDATE breaks
        SET parent_id = project_id
    ''')

    # 3. Alter 'parent_id' to be non-nullable
    op.alter_column('breaks', 'parent_id', nullable=False)

    # 4. Drop the foreign key constraint on 'project_id'
    op.drop_constraint('breaks_project_id_fkey', 'breaks', type_='foreignkey')

    # 5. Create the old foreign key constraint from 'breaks.parent_id' to 'projects.id'
    op.create_foreign_key(
        'breaks_parent_id_fkey',
        'breaks',
        'projects',
        ['parent_id'],
        ['id'],
    )

    # 6. Drop the 'project_id' column from 'breaks' table
    op.drop_column('breaks', 'project_id')
