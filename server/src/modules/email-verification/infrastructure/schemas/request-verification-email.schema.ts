import z from 'zod'

export const RequestVerificationEmailSchema = z.object({
    userId: z.uuid(),
})

export type RequestVerificationEmailDTO = z.infer<typeof RequestVerificationEmailSchema>