import express, {Request, Response} from 'express';
import { body } from 'express-validator';
import jwt from 'jsonwebtoken';
import {validateRequest, BadRequestError} from '@tickets-babyblue/common';

import { Password } from '../services/password';
import { User } from '../models/user';


const router = express.Router();

router.post('/api/users/signin', 
[
    body('email')
        .isEmail()
        .withMessage('Email unvalid'),
    body('password')
        .trim()
        .notEmpty()
        .withMessage('Password cannot be empty')
],
validateRequest,
async (req: Request, res: Response) => {
    const {email, password} = req.body;

    const existingUser = await User.findOne({email});
    if (!existingUser) {
        throw new BadRequestError('No such user');
    }

    const passwordMatch = await Password.compare(existingUser.password, password);
    if (!passwordMatch) {
        throw new BadRequestError('Password is wrong');
    }

    // Generate JWT
    const userJwt = jwt.sign({
        id: existingUser.id,         // These two lines are JWT 'payload'         
        email: existingUser.email    // Because JWT has to contain specific user info
    }, process.env.JWT_KEY!);

    // Store JWT on session object
    req.session = {          // The 'session' property is attached to 'req' by the 'cookie-session' package
        jwt: userJwt         // We cannot directly assign a new property like: 'req.session.jwt = userJwt', because it is Typescript!
    };


    res.status(200).send(existingUser);
});

export {router as signinRouter};