let express = require("express");
let router = express.Router();
let usercontroller = require("../controllers/usercontroller");
let userauth = require("../middlewares/userauthorization")
const { body } = require("express-validator");

router.post("/login", [body("email")
    .isEmail()
    .withMessage("Please enter a valid email"),
body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),], usercontroller.login);


router.post("/signup", [body("email")
    .isEmail()
    .withMessage("Please enter a valid email"),
body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
body("name").isLength({ min: 3 }).withMessage("Name must be at least 3 characters"),
body("phoneno")
    .notEmpty().withMessage("Phone number is required")
    .isMobilePhone("en-IN").withMessage("Please enter a valid Indian phone number"),
body("alternatenumber")
    .optional({ checkFalsy: true })
    .isMobilePhone("en-IN").withMessage("Please enter a valid Indian alternate phone number"),
body("address.pincode")
    .optional({ checkFalsy: true })
    .isPostalCode("IN").withMessage("Invalid Indian pincode"),
body("address.street").notEmpty().withMessage("Street is required"),
body("address.city").notEmpty().withMessage("City is required"),
body("address.state").notEmpty().withMessage("State is required")

], usercontroller.signup);

router.get("/profile",userauth.userauthorization, usercontroller.profile);
router.post("/changepassword",userauth.userauthorization,usercontroller.changepassword);
router.post("/changecred",userauth.userauthorization,usercontroller.changecred);

module.exports = router;