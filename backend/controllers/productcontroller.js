
const { validationResult } = require("express-validator");
let productobj = require("../models/productSchema");
let hostobj = require("../models/hostSchema");
let orderobj = require("../models/ordersSchema");
let userobj = require("../models/userSchema")


module.exports.addnewproduct = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array()
        });
    }
    const hostId = req.currhost?.id || req.currhost?._id;
    let { title, certified, image, price, stock, description, category } = req.body;
    let newproduct = await productobj.create({
        title,
        certified,
        image,
        price,
        stock,
        description,
        category,
        host: hostId,
    });
    if (!newproduct) {
        return res.status(404).json({ message: "Invalid credentials" });
    }
    await hostobj.findByIdAndUpdate(
        hostId,
        {
            $push: {
                products: newproduct._id
            }
        });


        //here we are trying to send the details of host to client side for placing he product hosted by this host.
    const populatedProduct = await productobj.findById(newproduct._id).populate({
        path: "host",
        select: "name companyname email phoneno address"
    });


    const io = req.app.get("io");
    io.emit("productAdded", populatedProduct);

    return res.status(200).json({
        message: "new product added",
        success: true,
        product: populatedProduct,
    });
};






// module.exports.getLatestProduct = async (req, res) => {
//     try {
//         const latestProduct = await productobj.findOne({}).sort({ _id: -1 }).populate({
//             path: "host",
//             select: "name companyname email phoneno address"
//         });

//         if (!latestProduct) {
//             return res.status(404).json({
//                 success: false,
//                 message: "No product found"
//             });
//         }

//         return res.status(200).json({
//             success: true,
//             product: latestProduct
//         });
//     } catch (error) {
//         return res.status(500).json({
//             success: false,
//             message: "Failed to fetch latest product",
//             error: error.message
//         });
//     }
// };

//changed here--------------------------------------------------
module.exports.getAllProducts = async (req, res) => {
    try {
        const products = await productobj.find({}).sort({ _id: -1 }).populate({
            path: "host",
            select: "name companyname email phoneno address"
        });

        return res.status(200).json({
            success: true,
            products
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch products",
            error: error.message
        });
    }
};
//------------------------------------------------------------------------


module.exports.fetchproducts = async (req, res) => {
    try {
        const hostId = req.currhost?.id || req.currhost?._id;

        if (!hostId) {
            return res.status(401).json({
                success: false,
                message: "Host not authenticated"
            });
        }

        const host = await hostobj.findById(hostId).populate("products");
        if (!host) {
            return res.status(404).json({
                success: false,
                message: "Host not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "fetching successful",
            products: host.products || []
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch products",
            error: error.message
        });
    }
};

module.exports.getProductById = async (req, res) => {
    const product = await productobj.findById(req.params.id);
    if (!product) {
        return res.status(404).json({ message: "product not found" })
    }
    res.json({
        success: true,
        product,
    });
};

module.exports.updateproduct = async (req, res) => {
    try {

        const { updatedproduct } = req.body;

        const newpr = await productobj.findByIdAndUpdate(
            updatedproduct._id,
            updatedproduct,
            { new: true }
        );

        res.json({
            success: true,
            product: newpr
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

exports.deleteproduct = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedProduct = await productobj.findByIdAndDelete(id);

        if (!deletedProduct) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }
        await hostobj.findByIdAndUpdate(
            req.currhost?.id || req.currhost?._id,
            {
                $pull: {
                    products: id
                }
            }
        );
        // mark any existing orders on this product so it survives future page loads,
        // not just clients that were connected live when this happened

           await orderobj.updateMany(
    { product: id, status: "Pending" },
    { productRemoved: true, productRemovedAt: new Date() }
);
        

        // 🔔 notify all connected users that this product is gone
        const io = req.app.get("io");
        if (io) {
            io.emit("productDeleted", { productId: id });
        }

        res.status(200).json({
            success: true,
            message: "Product deleted successfully",
            deletedProduct,
        });
    } catch (err) {
        console.error(err);

        res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};
// module.exports.placeorder = async (req, res) => {
//     try {
//         let { id } = req.params;
//         let object = await productobj.findById(id);
//         console.log(object)

//         if (!object) {
//             return res.status(404).json({ message: "product notfound" });
//         }

//         return res.status(200).json({
//             message: "product object found",
//             success: true,
//             obj: object
//         });
//     } catch (err) {
//         console.log(err);
//         return res.status(500).json({ message: "something went wrong", error: err.message });
//     }
// }




// module.exports.placeordernow = async (req, res) => {
//     try {
//         const errors = validationResult(req);
//         if (!errors.isEmpty()) {
//             return res.status(400).json({
//                 success: false,
//                 errors: errors.array()
//             });
//         }

//         let { id } = req.params; // product id from the route
//         let { quantity, street, city, state, country } = req.body;

//         let product = await productobj.findById(id);
//         if (!product) {
//             return res.status(404).json({ message: "product not found", success: false });
//         }

//         let neworder = await orderobj.create({
//             product: id,
//             quantity: quantity,
//             street: street,
//             city: city,
//             state: state,
//             country: country,
//             host: product.host,
//             user: req.user.id
//         });

//         if (!neworder) {
//             return res.status(400).json({ message: "could not place order", success: false });
//         }

//         await userobj.findByIdAndUpdate(
//             req.user.id,
//             {
//                 $push: {
//                     orders: neworder._id
//                 }
//             }
//         );

//         return res.status(200).json({ message: "new order placed", success: true, order: neworder });

//     } catch (err) {
//         console.log(err);
//         return res.status(500).json({ message: "something went wrong", success: false, error: err.message });
//     }
// }