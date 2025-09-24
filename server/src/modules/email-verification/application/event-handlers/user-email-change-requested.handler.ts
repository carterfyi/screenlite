import { EventHandler } from '@/core/events/event-handler.abstract.ts'
import { UserEmailChangeRequestedEvent } from '@/modules/email-verification/domain/events/user-email-change-requested.event.ts'

export class UserEmailChangeRequestedEventHandler extends EventHandler<UserEmailChangeRequestedEvent> {
    readonly event = 'user_email_change_requested'

    async handle(event: UserEmailChangeRequestedEvent): Promise<void> {
        console.log('UserEmailChangeRequestedEvent handled', event)
    }
}