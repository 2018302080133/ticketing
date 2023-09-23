import mongoose from 'mongoose';

import { app } from './app';
import { natsWrapper } from './nats-wrapper';
import { OrderCreatedListener } from './events/listeners/order-created-listener';
import { OrderCancelledListener } from './events/listeners/order-cancelled-listener';

const start = async () => {
    console.log('starting tickets service...');
    if (!process.env.JWT_KEY) {
        throw new Error('JWT_KEY must be defined');
    }

    try {
        await natsWrapper.connect('ticketing', 'ajdfj', 'http://nats-srv:4222');
        
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

        new OrderCreatedListener(natsWrapper.client).listen();
        new OrderCancelledListener(natsWrapper.client).listen();

        await mongoose.connect('mongodb://tickets-mongo-srv:27017/tickets');
        console.log('Connected to MongoDB');
    } catch (err) {
        console.error(err);
    }

    app.listen(3000, () => {
        console.log('Listening on 3000');
    });
};

start();

