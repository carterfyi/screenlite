import { IEventBus } from '@/core/ports/event-bus.interface.ts'
import { DomainEvent } from '@/core/events/domain-event.abstract.ts'

export class LoggingEventBus implements IEventBus {
    constructor(
        private readonly inner: IEventBus,
        private readonly logger: (msg: string, meta?: unknown) => void
    ) {}

    async publishMany(event: DomainEvent[]): Promise<void> {
        const eventsArray = Array.isArray(event) ? event : [event]

        await this.inner.publishMany(eventsArray)

        for (const e of eventsArray) {
            this.logger(`Published event: ${e.constructor.name}`, { id: e.eventId })
        }
    }

    async publish(event: DomainEvent): Promise<void> {
        await this.publishMany([event])
    }

    async shutdown(): Promise<void> {
        await this.inner.shutdown()
    }
}
