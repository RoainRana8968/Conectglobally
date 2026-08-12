let mongoose = require("mongoose");

let productSchema = new mongoose.Schema({
    image: {
        type: String,
        default: "https://www.thespruce.com/thmb/IU44qHcgeBvfNPKcSxmSzJhhZP8=/5700x3794/filters:no_upscale():max_bytes(150000):strip_icc()/dwarf-fruit-trees-4588521-07-ebfded6071cb4a0aba4291d241962133.jpg"
    },
    title: {
        type: String,
        required: true,
        minLength:5,
    },
    price: {
        type: String,
        required: true,
        minLength:2
    },
    certified: {
        type: String,
        required:true,
    },
    date: {
        type: String,
        Date: Date.now(),
    },
     category: {
      type: String,
      required: true,
      minLength:3
    },
    stock: {
      type: Number,
      default: 0,
      required:true
    },
    description:{
        type:String,
        required:true,
    },
    host:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Host"
    }

})
let productobj=mongoose.model("Product",productSchema);
module.exports=productobj;