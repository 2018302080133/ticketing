import {MongoMemoryServer} from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { app } from '../app';

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

