let express=require("express");
let router=express.Router();
let productcontroller=require("../controllers/productcontroller");
let authuser=require("../middlewares/userauthorization")
let authhost=require("../middlewares/hostauthorization")
// add later on here authuser.hostauthorization
router.post("/addnewproduct",authhost.hostauthorization,productcontroller.addnewproduct);
// router.get("/latest", productcontroller.getLatestProduct);
router.get("/all", productcontroller.getAllProducts);
router.get("/fetchproducts",authhost.hostauthorization,productcontroller.fetchproducts);
router.get("/:id",authhost.hostauthorization,productcontroller.getProductById);
router.post("/updateproduct",authhost.hostauthorization,productcontroller.updateproduct);
router.delete("/delete/:id",authhost.hostauthorization,productcontroller.deleteproduct);

module.exports=router;