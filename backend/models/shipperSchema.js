const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
let jwt = require("jsonwebtoken");

const shipperSchema = new mongoose.Schema(
{
    name: {
        type: String,
        required: true,
        minlength:3
    },

    email: {
        type: String,
        required: true,
        unique: true,
    },

    password: {
        type: String,
        required: true,
        minlength:6,
        select:false
    },

    phoneno: {
        type: String,
        required: true,
        minlength:9,
    },

    vehicleType: {
        type: String,
        enum: ["Bike", "Scooter", "Car", "Van", "Truck","Ship"],
        required:true
    },

    vehicleNumber: {
        type: String,
        unique: true,
        required:true,
        maxlength:6,
    },

    isAvailable: {
        type: Boolean,
        default: true
    },

    totalDeliveries: {
        type: Number,
        default: 0
    },
    city:{
        type:String,
    }
},
{
    timestamps: true
});


shipperSchema.statics.hashpassword = async (password) => {
    let hashedpassword = await bcrypt.hash(password, 10);
    return hashedpassword;
}

shipperSchema.methods.generateToken = async function(){
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



module.exports = mongoose.model("Shipper", shipperSchema);