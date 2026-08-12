let mongoose = require("mongoose");

let orderSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
    },
    // snapshot of the product at order time — survives even if the live product is later deleted
    productTitle: {
        type: String,
        required: true
    },
    productImage: {
        type: String
    },
    productPrice: {
        type: String
    },
    productCategory: {
        type: String
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    host: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Host",
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    street: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ["Pending", "Accepted", "Rejected","Delayed","Delivered"],
        default: "Pending"
    },
    productRemoved: {
        type: Boolean,
        default: false
    },
    productRemovedAt: {
        type: Date,
        default: null
    }
} ,{
    timestamps: true
})

let orderobj = mongoose.model("Order", orderSchema);
module.exports = orderobj;