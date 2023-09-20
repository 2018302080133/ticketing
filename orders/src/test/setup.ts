import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';


declare global {
    var signin: () => string[];
}

jest.mock('../nats-wrapper');

let mongo: any;    // Make 'mongo' accessible to all three functions

// These three functions are inside of Jest 

// This function runs before all of our tests
beforeAll(async () => {
    // Our original environment variable is stored in k8s, which is not accessible when testing
    process.env.JWT_KEY = 'asdfasdf';  

    mongo = await MongoMemoryServer.create();
    const mongoUri = mongo.getUri();

    await mongoose.connect(mongoUri, {});
});   

// This function runs before each of our tests
// Delete all data from the last test in the MongoMemoryServer 
beforeEach(async () => {
    jest.clearAllMocks();
    const collections = await mongoose.connection.db.collections();
  
    for (let collection of collections) {
        await collection.deleteMany({});
    }
});

// This function runs after all of our tests
afterAll(async () => {
    if (mongo) {
        await mongo.stop();
    }
    await mongoose.connection.close();
});

// Fake a cookie for signup. Because we don't want to bother the Auth service while testing
global.signin = () => {
    // Build a JWT payload.  { id, email }
    const payload = {
      id: new mongoose.Types.ObjectId().toHexString(),
      email: 'test@test.com'
    };

    // Create the JWT!
    const token = jwt.sign(payload, process.env.JWT_KEY!);

    // Build session Object. { jwt: MY_JWT }
    const session = { jwt: token };

    // Turn that session into JSON
    const sessionJSON = JSON.stringify(session);

    // Take JSON and encode it as base64
    const base64 = Buffer.from(sessionJSON).toString('base64');

    // return a string thats the cookie with the encoded data
    return [`session=${base64}`];
};