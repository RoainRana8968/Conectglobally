const express=require("express");
const cors = require("cors");
const app=express();
app.use(express.json());
const geminiRoutes = require("./routes/openairoutes");
const userroutes=require("./routes/userroute");
const hostroutes=require("./routes/hostroute");const productroutes  =require("./routes/productroutes")
const orderroutes=require("./routes/orderroutes")
const shipperroutes=require("./routes/shipperroutes");
const chatRoutes = require('./routes/chat');
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/users",userroutes)
app.use("/hosts",hostroutes)
app.use("/products",productroutes)
app.use("/orders",orderroutes)
app.use("/shipper",shipperroutes);
// Use chat routes
app.use('/api', chatRoutes);
// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
});

module.exports=app;
