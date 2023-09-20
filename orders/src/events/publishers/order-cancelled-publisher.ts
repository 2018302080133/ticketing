import { Subjects, Publisher, OrderCancelledEvent } from '@tickets-babyblue/common';

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
}
