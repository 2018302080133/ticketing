import { Publisher, OrderCreatedEvent, Subjects } from '@tickets-babyblue/common';

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
    subject: Subjects.OrderCreated = Subjects.OrderCreated;
}
