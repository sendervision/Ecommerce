import express from'express';

import { ORDER } from '../models/order.js';
import { ORDERITEM } from '../models/order-item.js';

export const orderRoute = express();

orderRoute.get('/', async (req, res) => {
    const orderList = await ORDER.find()
    .populate('user' ,'name').sort({'dateOrdered':-1})
    .populate({ 
        path: 'orderItems', populate: { 
            path: 'product', populate: 'category'}
    });

    if (!orderList) {
        res.status(500).json({ success: false })
    }
    res.send(orderList)
})

orderRoute.get('/:id', async (req, res) => {
    const order = await ORDER.findById(req.params.id).populate('name', 'user');

    if (!order) {
        res.status(500).json({ success: false })
    }
    res.send(order)
})

orderRoute.post('/', async (req, res) => {
   
    const orderItemsIds = Promise.all(req.body.orderItems.map( async (orderItem) => {
        let newOrderItem = new ORDERITEM({
            quantity: orderItem.quantity,
            product: orderItem.product
        })

        newOrderItem = await newOrderItem.save();

        return newOrderItem._id;
    }))

    const orderItemsIdsResolved = await orderItemsIds;

    const totalPrices = await Promise.all(orderItemsIdsResolved.map(async (orderItemId) => {
        const orderItem = await ORDERITEM.findById(orderItemId).populate('product', 'price')
        const totalPrice = orderItem.product.price * orderItem.quantity;
        return totalPrice
    }))

    const totalPrice = totalPrices.reduce((a, b) => a+ b , 0 );

    let order = new ORDER({
        orderItems: orderItemsIdsResolved,
        shippingAddress1: req.body.shippingAddress1,
        shippingAddress2: req.body.shippingAddress2,
        city: req.body.city,
        zip: req.body.zip,
        country: req.body.country,
        phone: req.body.phone,
        status: req.body.status,
        totalPrice: totalPrice,
        user: req.body.user,
    })

    order = await order.save();

    if (!order)
        return res.status(404).send('Order cannot be created')
    res.send(order);
})

orderRoute.put('/:id', async (req, res) => {
    const order = await ORDER.findByIdAndUpdate(req.params.id, {
        status: req.body.status,
    }, {
        new: true
    })

    if (!order)
        return res.status(404).send('Order cannot be created')
    res.send(order);
})

orderRoute.delete('/:id', (req, res) => {
    ORDER.findByIdAndRemove(req.params.id).then(async order => {
        if (order) {
            await order.orderItems.map(async orderItem =>{
                await OrderItem.findByIdAndRemove(orderItem)
            })
            return res.status(200).json({ success: true, message: 'Order deleted successfully' })
        } else {
            return res.status(404).json({ success: false, message: 'Order cannot find' })
        }
    }).catch(err => {
        return res.status(400).json({ success: false, error: err })
    })
})

orderRoute.get('/get/count', async (req, res) => {
    const orderCount = await ORDER.countDocuments((count) => count);
    if (!orderCount) {
        res.status(500), json({ success: false })
    }
    res.status(200).send({
        orderCount: orderCount
    });
})

orderRoute.get('/get/totalsales', async (req, res) => {
    const totalSales = await ORDER.aggregate([
        { $group: {_id: null, totalsales:{ $sum :'$totalPrice'}}}
    ])

    if (!totalSales){
        return res.status(400).send('the order sales cannot be generated')
    }
    res.send({ totalsales: totalSales.pop().totalsales})
})

orderRoute.get('/get/usersorders/:userid', async (req, res) => {
    const userOrderList = await ORDER.find({user: req.params.userid})
        .populate({
            path: 'orderItems', populate: {
                path: 'product', populate: 'category'
            }
        }).sort({ 'dateOrdered': -1 });

    if (!userOrderList) {
        res.status(500).json({ success: false })
    }
    res.send(userOrderList)
})

