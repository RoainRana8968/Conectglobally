let express=require("express");
let router=express.Router();
let shippercontroller=require("../controllers/shippercontroller");
let authshipper=require("../middlewares/shipperauthorization")
let ordercontroller = require("../controllers/orderController");
const { body } = require("express-validator");

router.post("/signup",shippercontroller.signup);

router.post("/login",[body("email")
    .isEmail()
    .withMessage("Please enter a valid email"),
body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),],shippercontroller.login)


router.get("/profile", authshipper.shipperauthorization, [
        body("email").isEmail(),
        body("password").isLength({ min: 6 }),
        body("name").notEmpty(),
        body("phoneno").isMobilePhone(),
        body("vehicleNumber").notEmpty(),
        body("vehicleType").notEmpty(),
        body("city").notEmpty()
    ],shippercontroller.profile);
    router.get("/getshipperorders",authshipper.shipperauthorization,shippercontroller.getshipperorders);

// Shipper: Delivered only
router.post("/updatestatus/:orderId", authshipper.shipperauthorization, ordercontroller.updateorderstatus);

module.exports=router;