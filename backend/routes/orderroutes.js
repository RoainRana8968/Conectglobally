let express = require("express");
let router = express.Router();
let ordercontroller = require("../controllers/orderController");
let authuser = require("../middlewares/userauthorization");
let authhost = require("../middlewares/hostauthorization");

// user places an order for a product (existing route, now points at placeordernow)
router.post("/placeorder/:id", authuser.userauthorization, ordercontroller.placeordernow);
router.get("/placeorder/:id", authuser.userauthorization, ordercontroller.placeorder);

// user views their own order history
router.get("/myorders", authuser.userauthorization, ordercontroller.getmyorders);

// host views orders placed on their products
router.get("/gethostorders", authhost.hostauthorization, ordercontroller.gethostorders);

// host accepts or rejects a specific order
router.post("/updatestatus/:orderId", authhost.hostauthorization, ordercontroller.updateorderstatus);

module.exports = router;