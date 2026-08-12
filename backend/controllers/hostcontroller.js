let hostobj = require("../models/hostSchema");
let bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
module.exports.login = async (req, res) => {
    let { email, password } = req.body;
    let host = await hostobj.findOne({ email: email }).select("+password");
    if (!host) {
        return res.status(401).json({ message: "host not present " })
    }
    const isMatch = await bcrypt.compare(password, host.password);
    if (!isMatch) {
        return res.status(401).json({ message: "Invalid credentials of host" });
    }
    let token = await host.generateToken();
    return res.status(200).json({
        success: true,
        token: token,
        host: host
    });
}
module.exports.signup = async (req, res) => {
    
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array()
        });
    }

    let { email, password, name, address, business, companyname, alternatenumber, phoneno } = req.body;
    const existingHost = await hostobj.findOne({
        $or: [
            { email: email },
            { phoneno: phoneno },
            { alternateNumber: alternatenumber }
        ]
    });


    if (existingHost) {

        if (existingHost.email === email) {
            return res.status(400).json({
                success: false,
                message: "Email already exists"
            });
        }

        if (existingHost.phoneno === phoneno) {
            return res.status(400).json({
                success: false,
                message: "Phone number already exists"
            });
        }

        if (existingHost.alternateNumber === alternatenumber) {
            return res.status(400).json({
                success: false,
                message: "Alternate number already exists"
            });
        }
    }


    const existingUser = await hostobj.findOne({ email });

    if (existingUser) {
        return res.status(400).json({
            message: "Email already exists"
        });
    }

    let hashedpassword = await hostobj.hashpassword(password);
    let newhost = await hostobj.create({
        email: email,
        password: hashedpassword,
        name: name,
        address: {
            street: address.street,
            city: address.city,
            state: address.state,
            pincode: address.pincode
        },
        business: business,
        companyname: companyname,
        alternatenumber: alternatenumber,
        phoneno: phoneno,
    });
    if (!newhost) {
        return res.status(404).json({ message: "invalid credentials of host" })
    }
    const token = await newhost.generateToken();

    return res.status(200).json({
        success: true,
        token:token,
        host: newhost
    });

}


module.exports.profile = async (req, res) => {
    try {
        const host = await hostobj.findById(req.currhost.id);

        if (!host) {
            return res.status(404).json({
                success: false,
                message: "host not found",
            });
        }

        return res.status(200).json({
            success: true,
            host,
        });
    } catch (err) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token",
        });
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

        const host = await hostobj.findById(req.currhost.id);
        if (!host) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        const hashedpassword = await hostobj.hashpassword(password);
        host.password = hashedpassword;
        await host.save();

        return res.status(200).json({
            success: true,
            message: "Password updated successfully",
        });
    } catch (err) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token",
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

        const host = await hostobj.findById(req.currhost.id);
        if (!host) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        const { name, email, phoneno } = req.body;

        if (email && email !== host.email) {
            const existing = await hostobj.findOne({ email: email });
            if (existing) {
                return res.status(400).json({
                    success: false,
                    message: "Email already in use",
                });
            }
            host.email = email;
        }

        if (name) host.name = name;
        if (phoneno) host.phoneno = phoneno;

        await host.save();

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            host,
        });
    }catch (err) {
    console.error(err);

    return res.status(500).json({
        success: false,
        message: "Internal server error",
    });
}
};
