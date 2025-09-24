import { Workspace } from '@/core/entities/workspace.entity.ts'
import { WorkspaceStatus } from '@/core/enums/workspace-status.enum.ts'
import { randomUUID } from 'crypto'

export class WorkspaceFactory {
    static create(props: {
        name: string
        slug: string
    }): Workspace {
        const id = randomUUID()
        const now = new Date()
    
        return new Workspace({
            id,
            name: props.name,
            slug: props.slug,
            status: WorkspaceStatus.ACTIVE,
            createdAt: now,
            updatedAt: now,
            deletedAt: null,
            picturePath: null
        })
    }
}