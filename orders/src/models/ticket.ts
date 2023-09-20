import mongoose from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

import { Order } from './order';
import { OrderStatus } from '@tickets-babyblue/common';

interface TicketAttributes {
    id: string;
    title: string;
    price: number;
}

export interface TicketDoc extends mongoose.Document {
    title: string;
    price: number;
    version: number;
    // Because "isReserved" is an async function, it returns a Promise.
    // When the Promise resolves, the resolved value will be a boolean.
    isReserved(): Promise<boolean>;
}

interface TicketModel extends mongoose.Model<TicketDoc> {
    build(attrs: TicketAttributes): TicketDoc;
    findAndCheckVersion(event: { id: string, version: number }): Promise<TicketDoc | null>;
}

const ticketSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
        min: 0,
    },
}, {
    toJSON: {
        transform(doc, ret) {
            ret.id = ret._id;
            delete ret._id;
        },
    },
});

ticketSchema.set('versionKey', 'version');
ticketSchema.plugin(updateIfCurrentPlugin);

// Add a static method to the model, which is called on the model itself, not on an instance of it.
ticketSchema.statics.build = (attrs: TicketAttributes) => {
    return new Ticket({
        _id: attrs.id,
        title: attrs.title,
        price: attrs.price,
    });
};

ticketSchema.statics.findAndCheckVersion = (event: { id: string, version: number }) => {
    return Ticket.findOne({
        _id: event.id,
        version: event.version - 1
    });
}

// Add an instance method to the model, which is called on an instance of a document.
// Do not use an arrow function when using "this" keyword.
ticketSchema.methods.isReserved = async function () {
    // "this" refers to the ticket document that calls the "isReserved" function.
    // For a specific ticket, if we can find its related "uncancelled" order, that means this ticket has been reserved.
    const existingOrder = await Order.findOne({
        ticket: this,
        status: {
            $in: [
                OrderStatus.Created,
                OrderStatus.AwaitingPayment,
                OrderStatus.Complete,
            ],
        },
    });
    // The double not (!!) is a common JavaScript idiom to coerce any value to its corresponding boolean representation.
    // The first ! will coerce existingOrder into its opposite boolean value.
    // The second ! will negate that again, 
    // ensuring you end up with the "truthy" or "falsy" value of the original variable, but as an actual boolean (true or false).
    return !!existingOrder;
};

const Ticket = mongoose.model<TicketDoc, TicketModel>('Ticket', ticketSchema);

export { Ticket };
