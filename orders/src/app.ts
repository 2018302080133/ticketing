import express from 'express';
import 'express-async-errors';
import {json} from 'body-parser';
import cookieSession from 'cookie-session';
import {errorHandler, NotFoundError, currentUser} from '@tickets-babyblue/common';

import { deleteOrderRouter } from './routes/delete';
import { indexOrderRouter } from './routes/index';
import { newOrderRouter } from './routes/new';
import { showOrderRouter } from './routes/show';


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

app.use(deleteOrderRouter);
app.use(indexOrderRouter);
app.use(newOrderRouter);
app.use(showOrderRouter);

app.all('*', () => {
    throw new NotFoundError();
})

app.use(errorHandler);

export {app};