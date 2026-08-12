// placing an order (user side)
const { validationResult } = require("express-validator");
let productobj=require("../models/productSchema")
let hostobj=require("../models/hostSchema")
let orderobj=require("../models/ordersSchema");
let userobj=require("../models/userSchema")


module.exports.placeorder = async (req, res) => {
    try {
        let { id } = req.params;
        let object = await productobj.findById(id);
        console.log(object)

        if (!object) {
            return res.status(404).json({ message: "product notfound" });
        }

        return res.status(200).json({
            message: "product object found",
            success: true,
            obj: object
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "something went wrong", error: err.message });
    }
}





module.exports.placeordernow = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        let { id } = req.params;
        let { quantity, street, city, state, country } = req.body;

        let product = await productobj.findById(id);
        if (!product) {
            return res.status(404).json({ message: "product not found", success: false });
        }

        let neworder = await orderobj.create({
            product: id,
            // snapshot fields — captured now, so they survive even if this product is deleted later
            productTitle: product.title,
            productImage: product.image,
            productPrice: product.price,
            productCategory: product.category,
            quantity: quantity,
            street: street,
            city: city,
            state: state,
            country: country,
            host: product.host,
            user: req.user.id,
            
        });

        if (!neworder) {
            return res.status(400).json({ message: "could not place order", success: false });
        }

        await userobj.findByIdAndUpdate(
            req.user.id,
            { $push: { orders: neworder._id } }
        );

        await hostobj.findByIdAndUpdate(
            product.host,
            { $push: { orders: neworder._id } }
        );

        const io = req.app.get("io");
        io.emit("newOrder", neworder);

        return res.status(200).json({ message: "new order placed", success: true, order: neworder });

    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "something went wrong", success: false, error: err.message });
    }
}

// user viewing their own orders (Myorder.jsx)
module.exports.getmyorders = async (req, res) => {
    try {
        let orders = await orderobj.find({ user: req.user.id })
            .populate("product", "title image price category")
            .sort({ date: -1 });

        return res.status(200).json({ success: true, orders });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ success: false, message: "something went wrong", error: err.message });
    }
}

// host viewing orders placed on their products
module.exports.gethostorders = async (req, res) => {
    try {
        let orders = await orderobj.find({ host: req.currhost.id })
            .populate("product", "title image price category")
            .populate("user", "name email phoneno")
            .sort({ date: -1 });

        return res.status(200).json({ success: true, orders });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ success: false, message: "something went wrong", error: err.message });
    }
}

// host accepting (or rejecting) an order
module.exports.updateorderstatus = async (req, res) => {
    try {
        let { orderId } = req.params;
        let { status } = req.body;

        if (!["Accepted", "Rejected", "Delayed", "Delivered"].includes(status)) {
            return res.status(400).json({ success: false, message: "invalid status value" });
        }

        let order = await orderobj.findById(orderId);
        if (!order) {
            return res.status(404).json({ success: false, message: "order not found" });
        }

        // ── Who is calling? ───────────────────────────────────────────────────
        //
        // req.currshipper is set by shipperauthorization middleware
        // req.currhost    is set by hostauthorization middleware
        //
        // Only one will be truthy per request depending on which middleware ran.

        const isShipper = !!req.currshipper;
        const hostId    = req.currhost?.id || req.currhost?._id?.toString();
        const isOwningHost = hostId && order.host.toString() === hostId;

        if (isShipper) {
            // Shippers are only allowed to mark an order as Delivered
            if (status !== "Delivered") {
                return res.status(403).json({
                    success: false,
                    message: "shippers can only mark orders as Delivered",
                });
            }
            // No ownership check needed — any registered shipper can deliver
        } else if (!isOwningHost) {
            // Not a shipper and not the owning host → block
            return res.status(403).json({
                success: false,
                message: "not authorized to update this order",
            });
        }
        // ─────────────────────────────────────────────────────────────────────

        order.status = status;// updating status here.
        await order.save();

        // Populate before emitting so the frontend gets product title/image/price
        // and user name — without this the socket update wipes those fields on client.
        const populatedOrder = await orderobj
            .findById(order._id)
            .populate("user", "name email")   // adjust to your User schema
            .populate("product");             // adjust if your field name differs

        const io = req.app.get("io");
        io.emit("orderStatusUpdated", populatedOrder);
        io.emit("assignedorder", populatedOrder);

        return res.status(200).json({
            success: true,
            message: `order marked as ${status.toLowerCase()}`,
            order: populatedOrder,
        });

    } catch (err) {
        console.log(err);
        return res.status(500).json({
            success: false,
            message: "something went wrong",
            error: err.message,
        });
    }
};




