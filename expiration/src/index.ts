import { natsWrapper } from './nats-wrapper';
import { OrderCreatedListener } from './events/listeners/order-created-listener';


const start = async () => {
    console.log('starting expiration service...');
    try {
        await natsWrapper.connect('ticketing', 'pitkh', 'http://nats-srv:4222');
        
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
    } catch (err) {
        console.error(err);
    }
};

start();

