import mongoose from 'mongoose';

const orderItemSchema = mongoose.Schema({
    quantity: {
        type: Number,
        required: true
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }
})

const ORDERITEM = mongoose.model('OrderItem', orderItemSchema);
export { ORDERITEM }