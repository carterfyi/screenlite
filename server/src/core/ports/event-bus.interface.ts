import { DomainEvent } from '../events/domain-event.abstract.ts'

export interface IEventBus {
    publishMany(events: DomainEvent[]): Promise<void>
    publish(event: DomainEvent): Promise<void>
    shutdown(): Promise<void>
}