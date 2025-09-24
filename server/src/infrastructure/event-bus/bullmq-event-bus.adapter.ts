import { Queue } from 'bullmq'
import { IEventBus } from '@/core/ports/event-bus.interface.ts'
import { DomainEvent } from '@/core/events/domain-event.abstract.ts'
import { Redis } from 'ioredis'

export class BullMQEventBusAdapter implements IEventBus {
    private queues: Map<string, Queue> = new Map()
    private eventQueueMap: Map<string, string> = new Map()

    constructor(private readonly redisConnection: Redis) {
        this.setupEventRouting()
    }

    private setupEventRouting(): void {
        this.eventQueueMap.set('UserEmailChangeRequested', 'default-events')
    }

    async publishMany(events: DomainEvent[]): Promise<void> {
        for (const event of events) {
            await this.publishEvent(event)
        }
    }

    async publish(event: DomainEvent): Promise<void> {
        await this.publishMany([event])
    }

    private async publishEvent(event: DomainEvent): Promise<void> {
        const queueName = this.getQueueForEvent(event)
        const queue = this.getOrCreateQueue(queueName)

        await queue.add(event.constructor.name, event, {
            jobId: event.eventId,
            attempts: 3,
            backoff: { type: 'exponential', delay: 1000 },
            removeOnComplete: true,
            removeOnFail: 1000,
        })
    }

    private getQueueForEvent(event: DomainEvent): string {
        return this.eventQueueMap.get(event.constructor.name) || 'default-events'
    }

    private getOrCreateQueue(queueName: string): Queue {
        if (this.queues.has(queueName)) {
            return this.queues.get(queueName)!
        }

        const queue = new Queue(queueName, {
            connection: this.redisConnection,
            defaultJobOptions: {
                attempts: 3,
                backoff: { type: 'exponential', delay: 1000 },
            },
        })

        this.queues.set(queueName, queue)
        return queue
    }

    async shutdown(): Promise<void> {
        await Promise.all(
            [...this.queues.values()].map(queue => 
                queue.close().catch(e => console.error('Error closing queue:', e))
            )
        )
        this.queues.clear()
    }
}