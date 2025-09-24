import { randomUUID } from 'crypto'

export abstract class DomainEvent {
    readonly eventId: string
    readonly occurredAt: Date

    protected constructor(public readonly eventName: string) {
        this.eventId = randomUUID()
        this.occurredAt = new Date()
    }
}
