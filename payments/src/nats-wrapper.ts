import nats, { Stan } from 'node-nats-streaming';

class NatsWrapper {
    private _client?: Stan;

    // In TypeScript, a "getter" is a way to access the properties of an object. 
    // It provides more control over how the data is accessed and returned.
    // So, in here, we make sure that "_client" can be accessed only after it succesfully connected.
    // We can access "_client" by calling "natsWrapper.client" in other place.
    get client() { 
        if (!this._client) {
            throw new Error('Cannot access NATS client before connecting');
        }
        return this._client;
    }

    connect(clusterId: string, clientId: string, url: string) {
        // "clusterId" is should matches what we defined in "nats-depl.yaml -> containers -> args -> -cid".
        // "clientId" should be a random unique string, representing the identity of the "Stan".
        this._client = nats.connect(clusterId, clientId, { url });
        
        // Manually return a Promise so that we can use "await" when calling this "connect" function in other place.
        return new Promise<void>((resolve, reject) => {
            this.client.on('connect', () => {
                console.log('Connected to NATS');
                resolve();
            });
            this.client.on('error', (err) => {
                reject(err);
            });
        });
    }
}

// Output an instance, not a class.
export const natsWrapper = new NatsWrapper();
