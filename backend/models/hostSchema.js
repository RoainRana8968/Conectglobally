let mongoose = require("mongoose");
let jwt = require("jsonwebtoken");
const bcrypt=require("bcrypt");
let hostSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    alternateNumber: {
        type: String,
        minLength: 9,
    },
    companyname:{
        type: String,
        minLength:5,
        required:true,
    },
    business:{
        type:String,
        enum:["Manufacturer",
        "Exporter",
        "Wholesaler",
        "Trader",
        "Distributor"],
        required:true,
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true,
        select: false,
        minLength: 6
    },
    phoneno: {
        type: String,
        unique: true,
        minLength: 9,
    },
    address: {
        street: String,
        city: String,
        state: String,
        pincode: String,
        country: { type: String, default: 'India' }
    },
    rating: {
        type: Number,
        min: 0,
        max: 5,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    },
    orders: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
    }],
    products: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }]
})
hostSchema.statics.hashpassword = async (password) => {
    let hashedpassword = await bcrypt.hash(password,10);
    return hashedpassword;
}
hostSchema.methods.generateToken= function(){
    try {
        const payload = {
            id:this._id,
        };


        const token = jwt.sign(
            payload,
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '7d' } // Token expires in 7 days
        );

        return token;
    } catch (error) {
        console.error('Error generating token:', error);
        throw new Error('Token generation failed');
    }
}
let hostobj = mongoose.model("Host", hostSchema);
module.exports = hostobj;