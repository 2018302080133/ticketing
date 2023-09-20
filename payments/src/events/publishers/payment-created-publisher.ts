import { Subjects, Publisher, PaymentCreatedEvent } from '@tickets-babyblue/common';

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
    subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
}
