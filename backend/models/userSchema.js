const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
let jwt = require("jsonwebtoken");
let userSchema = new mongoose.Schema({
    name: {
        type: String,
        minlength: 3
    },
    phoneno:{
        type: String,
        minLength:10,
    },
    alternatenumber:{
        type: String,
        minLength:10,
    },
    password: {
        type: String,
        select: false,
        minlength: 6
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
     orders: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
    }]
    ,
    role: {
        type: String,
        enum: ['customer', 'host', 'shipper', 'admin'],
        default: 'customer'
    },
    address: {
        street: String,
        city: String,
        state: String,
        country: String,
        pinCode: String
    },
    location: {
        type: String,
    },
    coordinates: {
        type: Number,

    }
});

userSchema.statics.hashpassword = async (password) => {
    let hashedpassword = await bcrypt.hash(password, 10);
    return hashedpassword;
}

userSchema.methods.generateToken = async function(){
    try {
        const payload = {
            id:this._id,
        };

        const token = jwt.sign(//it signs userid
            payload,
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '7d' } // Token expires in 7 days
        );

        return token;
    } catch (error) {
        console.error('Error generating token:', error);
        throw new Error('Token generation failed');
    }
};

module.exports = mongoose.model("User", userSchema);