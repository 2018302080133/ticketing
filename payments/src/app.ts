import express from 'express';
import 'express-async-errors';
import {json} from 'body-parser';
import cookieSession from 'cookie-session';
import {errorHandler, NotFoundError, currentUser} from '@tickets-babyblue/common';

import { createChargeRouter } from './routes/new';


const app = express();

// Ingress-nginx makes http requests to be proxy, but "secure: true" doesn't allow this, so we have to let Express trust these proxy requests
app.set('trust proxy', true);   

app.use(json());
app.use(cookieSession({
    signed: false,

    // This line means: if we are not in test mode, we set "secure: true", which means cookies will only be sent with HTTPS requests
    // While in test mode, we set "secure: false", because Jest do not use HTTPS to send requests
    secure: process.env.NODE_ENV !== 'test'  
}));

// We use the "currentUser" middleware for all routes
// But we will implement the "requireAuth" middleware on routes contingently
// That's because some routes need users to be authenticated first while some are not
app.use(currentUser);

app.use(createChargeRouter);

app.all('*', () => {
    throw new NotFoundError();
})

app.use(errorHandler);

export {app};