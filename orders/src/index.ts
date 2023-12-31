import mongoose from 'mongoose';

import { app } from './app';
import { natsWrapper } from './nats-wrapper';
import { TicketCreatedListener } from './events/listeners/ticket-created-listener';
import { TicketUpdatedListener } from './events/listeners/ticket-updated-listener';
import { ExpirationCompleteListener } from './events/listeners/expiration-complete-listener';
import { PaymentCreatedListener } from './events/listeners/payment-created-listener';


const start = async () => {
    console.log('starting order service....');
    if (!process.env.JWT_KEY) {
        throw new Error('JWT_KEY must be defined');
    }

    try {
        await natsWrapper.connect('ticketing', 'htlkd', 'http://nats-srv:4222');
        
        // "Graceful Shutdown" of Stan: 
        // After a Stan lose connection to NATS, NATS will still think it's alive, and will keep sending events to it, although it's gone.
        // So we have to make sure that after a Stan lose connection to NATS, we restart the whole Service,
        // so that NATS will realize that it is gone forever, and stop sending events to it.
        natsWrapper.client.on('close', () => {
            console.log('NATS connection closed!');
            process.exit();  // Kill the process running this Service
        });
        process.on('SIGINT', () => natsWrapper.client.close());
        process.on('SIGTERM', () => natsWrapper.client.close());

        new TicketCreatedListener(natsWrapper.client).listen();
        new TicketUpdatedListener(natsWrapper.client).listen();
        new ExpirationCompleteListener(natsWrapper.client).listen();
        new PaymentCreatedListener(natsWrapper.client).listen();

        await mongoose.connect('mongodb://orders-mongo-srv:27017/orders');
        console.log('Connected to MongoDB');
    } catch (err) {
        console.error(err);
    }

    app.listen(3000, () => {
        console.log('Listening on 3000');
    });
};

start();

