import { InitiatorDTO } from '@/shared/dto/initiator.dto.ts'
import { InitiatorType } from '../enums/initiator-type.enum.ts'
import { randomUUID } from 'crypto'

export class Initiator {
    public readonly id: string
    public readonly type: InitiatorType
    public readonly userId: string | null

    constructor(data: InitiatorDTO) {
        this.id = data.id
        this.type = data.type as InitiatorType
        this.userId = data.userId
    }

    static createUserInitiator(userId: string): Initiator {
        return new Initiator({
            id: randomUUID(),
            type: InitiatorType.User,
            userId,
        })
    }
  
    static createSystemInitiator(systemId: string): Initiator {
        return new Initiator({
            id: systemId,
            type: InitiatorType.System,
            userId: null,
        })
    }
  
    static createGuestInitiator(guestId: string): Initiator {
        return new Initiator({
            id: guestId,
            type: InitiatorType.Guest,
            userId: null,
        })
    }
  
    isUserInitiator(): boolean {
        return this.type === InitiatorType.User
    }
  
    isSystemInitiator(): boolean {
        return this.type === InitiatorType.System
    }
  
    isGuestInitiator(): boolean {
        return this.type === InitiatorType.Guest
    }
}