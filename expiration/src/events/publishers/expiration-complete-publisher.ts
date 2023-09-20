import { Subjects, Publisher, ExpirationCompleteEvent } from '@tickets-babyblue/common';
  
export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
    subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
}
  