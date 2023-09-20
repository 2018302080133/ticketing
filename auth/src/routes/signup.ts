import express, {Request, Response} from 'express';
import { body } from 'express-validator';
import jwt from 'jsonwebtoken';
import { validateRequest, BadRequestError } from '@tickets-babyblue/common';

import { User } from '../models/user';


const router = express.Router();

router.post('/api/users/signup', 
[
    body('email')
        .isEmail()
        .withMessage('Email unvalid'),
    body('password')
        .trim()
        .isLength({min: 4, max: 20})
        .withMessage('Password must be between 4 and 20 characters')
], 
validateRequest,
async (req: Request, res: Response) => {
    const {email, password} = req.body;

    const existingUser = await User.findOne({email});

    if (existingUser) {
        throw new BadRequestError('Email already in use');
    }

    const user = User.build({email, password});
    await user.save();

    // Generate JWT
    const userJwt = jwt.sign({
        id: user.id,         // These two lines are JWT 'payload'         
        email: user.email    // Because JWT has to contain specific user info
    }, process.env.JWT_KEY!);

    // Store JWT on session object
    req.session = {          // The 'session' property is attached to 'req' by the 'cookie-session' package
        jwt: userJwt         // We cannot directly assign a new property like: 'req.session.jwt = userJwt', because it is Typescript!
    };

    res.status(201).send(user);
});

export {router as signupRouter};