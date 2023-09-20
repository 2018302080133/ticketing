import { Publisher, Subjects, TicketCreatedEvent } from "@tickets-babyblue/common";

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
    subject: Subjects.TicketCreated = Subjects.TicketCreated;
}