import { Publisher, Subjects, TicketUpdatedEvent } from "@tickets-babyblue/common";

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
    subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
}