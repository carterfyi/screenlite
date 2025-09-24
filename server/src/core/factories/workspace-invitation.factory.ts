import { WorkspaceInvitationStatus } from '../enums/workspace-invitation-status.enum.ts'
import { WorkspaceInvitation } from '../entities/workspace-invitation.entity.ts'
import { randomUUID } from 'crypto'

export class WorkspaceInvitationFactory {
    static create(props: {
        workspaceId: string
        email: string
        status: WorkspaceInvitationStatus
        initiatorId: string
    }): WorkspaceInvitation {
        const id = randomUUID()
        const now = new Date()
    
        return new WorkspaceInvitation({
            id,
            email: props.email,
            status: props.status,
            workspaceId: props.workspaceId,
            createdAt: now,
            initiatorId: props.initiatorId
        })
    }
}