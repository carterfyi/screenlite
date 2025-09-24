import { DomainEvent } from '@/core/events/domain-event.abstract.ts'

export class UserEmailChangeRequestedEvent extends DomainEvent {
    constructor(
        public readonly userId: string,
        public readonly newEmail: string,
        public readonly token: string
    ) {
        super('user_email_change_requested')
    }
}