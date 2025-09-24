import { DomainEvent } from '@/core/events/domain-event.abstract.ts'

export abstract class EventHandler<T extends DomainEvent> {
    abstract readonly event: string

    abstract handle(event: T): Promise<void>

    async onError(error: Error, event: T): Promise<void> {
        console.error(`Error handling event ${this.event}:`, error, event)
        throw error
    }
}