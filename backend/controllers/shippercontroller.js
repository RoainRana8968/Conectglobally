let bcrypt=require("bcrypt")
let shipobj = require("../models/shipperSchema")
let orderobj = require("../models/ordersSchema");

const { validationResult } = require("express-validator");
module.exports.signup = async (req, res) => {
    const errors = validationResult(req);

if (!errors.isEmpty()) {
    return res.status(400).json({
        errors: errors.array()
    });
}

    let {
        email,
        password,
        name,
        vehicleType,
        phoneno,
        vehicleNumber,
        city
    } = req.body;
    const existingshipper = await shipobj.findOne({
        $or: [
            { email },
            { phoneno },
            { vehicleNumber }
        ]
    });

    if (existingshipper) {

        if (existingshipper.email === email) {
            return res.status(400).json({
                success: false,
                message: "Email already exists"
            });
        }

        if (existingshipper.phoneno === phoneno) {
            return res.status(400).json({
                success: false,
                message: "Phone number already exists"
            });
        }

        if (existingshipper.vehicleNumber === vehicleNumber) {
            return res.status(400).json({
                success: false,
                message: "Vehicle number already exists"
            });
        }

    }
    let hashedpassword = await shipobj.hashpassword(password);
    let newshipper = await shipobj.create({
        email,
        password: hashedpassword,
        name,
        phoneno,
        vehicleType,
        vehicleNumber,
        city
    });



    if (!newshipper) {
        return res.status(404).json({ message: "invalid credentials of shipper" })
    }
    const token = await newshipper.generateToken();

    return res.status(200).json({
        success: true,
        token: token,
        shipper: newshipper
    });
}

module.exports.login = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
    return res.status(400).json({
        errors: errors.array()
    });
}

    let { email, password } = req.body;
    let shipper = await shipobj.findOne({ email: email }).select("+password");
    if (!shipper) {
        return res.status(401).json({ message: "shipper not present " })
    }
    const isMatch = await bcrypt.compare(password, shipper.password);
    if (!isMatch) {
        return res.status(401).json({ message: "Invalid credentials of shipper" });
    }
    let token = await shipper.generateToken();
    return res.status(200).json({
        success: true,
        token: token,
        shipper: shipper
    });
}

module.exports.profile = async (req, res) => {
    try {

        const shipper = await shipobj.findById(req.currshipper.id);

        if (!shipper) {
            return res.status(404).json({
                success: false,
                message: "shipper not found",
            });
        }

        return res.status(200).json({
            success: true,
            shipper,
        });
    } catch (err) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token",
        });
    }
};


// Returns all orders assigned to shippers (status Delayed or Delivered)
// Route must be protected by shipperauthorization middleware
module.exports.getshipperorders = async (req, res) => {
    try {
        // orderobj is now properly imported above
        let orders = await orderobj
            .find({ status: { $in: ["Delayed", "Delivered"] } })
            .populate("user", "name email")   // adjust fields to match your User schema
            .populate("product");             // adjust if your field is named differently

        return res.status(200).json({ success: true, orders });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};

module.exports.changepassword = async (req, res) => {
    try {
        // const authHeader = req.headers.authorization;

        // if (!authHeader || !authHeader.startsWith("Bearer ")) {
        //     return res.status(401).json({
        //         success: false,
        //         message: "No token provided",
        //     });
        // }

        // const token = authHeader.split(" ")[1];
        // const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const { password } = req.body;

        if (!password) {
            return res.status(400).json({
                success: false,
                message: "Password is required",
            });
        }

        const shipper = await shipobj.findById(req.currshipper.id);
        if (!shipper) {
            return res.status(404).json({
                success: false,
                message: "shipper not found",
            });
        }

        const hashedpassword = await shipobj.hashpassword(password);
        shipper.password = hashedpassword;
        await shipper.save();

        return res.status(200).json({
            success: true,
            message: "Password updated successfully",
        });
    } catch (err) {
    console.error(err);

    return res.status(500).json({
        success: false,
        message: "Internal server error",
    });
}
};


module.exports.changecred = async (req, res) => {
    try {
        // const authHeader = req.headers.authorization;

        // if (!authHeader || !authHeader.startsWith("Bearer ")) {
        //     return res.status(401).json({
        //         success: false,
        //         message: "No token provided",
        //     });
        // }

        // const token = authHeader.split(" ")[1];
        // const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const shipper = await shipobj.findById(req.currshipper.id);
        if (!shipper) {
            return res.status(404).json({
                success: false,
                message: "shipper not found",
            });
        }

        const { name, email, phoneno } = req.body;

        if (email && email !== shipper.email) {
            const existing = await shipobj.findOne({ email: email });
            if (existing) {
                return res.status(400).json({
                    success: false,
                    message: "Email already in use",
                });
            }
            shipper.email = email;
        }

        if (name) shipper.name = name;
        if (phoneno) shipper.phoneno = phoneno;

        await shipper.save();

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            shipper,
        });
    } catch (err) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token",
        });
    }
};
