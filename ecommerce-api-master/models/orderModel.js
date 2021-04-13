const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const orderSchema = Schema({
    userId:{type: Schema.Types.ObjectId, ref:'User'},
    // adminId:{type: Schema.Types.ObjectId, ref:'User'},
    products:[{
        productId:{type: Schema.Types.ObjectId, ref:'Product'},
        quantity:{type:Number, default:1},
    }],
    orderStatus:{
        type:String,
        enum:['accepted','canceled','pending'],
    },
    note:{
        type:String
    },
    address:{
        type:String
    },
    paymentMethod:{
        type:String,
        enum:["visa","paypal","mastercard","in cash"]
    },
    deliverAt:{
        from:{
            type:Date
        },
        to:{
            type:Date
        }
    }
},
{ timestamps: { createdAt: 'createdAt' } })

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;