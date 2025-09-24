import { FastifyInstance } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { RequestVerificationEmailUseCase } from '../../application/usecases/request-verification-email.usecase.ts'
import { EmailVerificationTokenFactory } from '../../domain/services/email-verification-token.factory.ts'
import { RequestVerificationEmailSchema } from '../schemas/request-verification-email.schema.ts'

export async function requestVerificationEmailRoute(fastify: FastifyInstance) {
    fastify.withTypeProvider<ZodTypeProvider>().post('/request-verification-email', {
        schema: {
            body: RequestVerificationEmailSchema
        },
    }, async (request, reply) => {
        const { userId } = request.body

        const tokenFactory = new EmailVerificationTokenFactory(fastify.tokenGenerator, fastify.secureHasher)

        const requestVerificationEmail = new RequestVerificationEmailUseCase({
            userRepo: fastify.userRepository,
            tokenRepo: fastify.emailVerificationTokenRepository,
            tokenFactory,
            jobProducer: fastify.jobProducer,
            config: fastify.config,
        })

        await requestVerificationEmail.execute(userId)

        reply.status(200).send({ message: 'VERIFICATION_EMAIL_SENT' })
    })
} 