let express = require("express");
let router = express.Router();
let hostcontroller = require("../controllers/hostcontroller");
let hostauth=require("../middlewares/hostauthorization")
const { body } = require("express-validator");
router.post("/login", hostcontroller.login);


router.post("/signup", [body("email")
    .isEmail()
    .withMessage("Please enter a valid email"),
body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
body("name").isLength({ min: 3 }).withMessage("Name must be at least 3 characters"),

body("business").notEmpty().withMessage("Business type is required"),
body("companyname").isLength({ min: 5 }).withMessage("Company name must be at least 5 characters"),
body("business").isIn(["Manufacturer", "Exporter", "Wholesaler", "Trader", "Distributor"]).withMessage("Invalid buisness type"),
], hostcontroller.signup);
router.get("/profile",hostauth.hostauthorization, hostcontroller.profile);

router.post("/changepassword",hostauth.hostauthorization,hostcontroller.changepassword);
router.post("/changecred",hostauth.hostauthorization,hostcontroller.changecred);
module.exports = router;