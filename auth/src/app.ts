import express from 'express';
import 'express-async-errors';
import {json} from 'body-parser';
import cookieSession from 'cookie-session';
import {errorHandler, NotFoundError} from '@tickets-babyblue/common';

import { currentUserRouter } from './routes/current-user';
import { signinRouter } from './routes/signin';
import { signoutRouter } from './routes/signout';
import { signupRouter } from './routes/signup';


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


app.use(currentUserRouter);
app.use(signinRouter);
app.use(signoutRouter);
app.use(signupRouter);

app.all('*', () => {
    throw new NotFoundError();
})

app.use(errorHandler);

export {app};