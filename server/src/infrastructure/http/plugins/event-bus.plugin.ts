import fp from 'fastify-plugin'
import { FastifyPluginAsync } from 'fastify'
import { IEventBus } from '@/core/ports/event-bus.interface.ts'
import { BullMQEventBusAdapter } from '@/infrastructure/event-bus/bullmq-event-bus.adapter.ts'
import { LoggingEventBus } from '@/infrastructure/event-bus/logging-event-bus.adapter.ts'

declare module 'fastify' {
    interface FastifyInstance {
        eventBus: IEventBus
    }
}

const eventBusPlugin: FastifyPluginAsync = async (fastify) => {
    const redis = fastify.redis.getClient('bullmq')

    const eventBus = new BullMQEventBusAdapter(redis)

    const loggingEventBus = new LoggingEventBus(eventBus, fastify.log.info)

    fastify.decorate('eventBus', loggingEventBus)

    fastify.addHook('onClose', async () => {
        await loggingEventBus.shutdown().catch(error => {
            fastify.log.error('Error shutting down EventBus:', error)
        })
    })
}

export default fp(eventBusPlugin, {
    name: 'event-bus',
    dependencies: ['redis'],
})