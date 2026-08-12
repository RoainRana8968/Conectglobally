const userobj = require("../models/userSchema")
const bcrypt=require("bcrypt");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");



module.exports.login = async (req, res) => {
   const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array()
        });
    }

    let { email, password } = req.body;

    let user = await userobj.findOne({ email: email }).select("+password");
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
    }

    let token = await user.generateToken();

    res.status(200).json({
        success: true,
        token,
        user:user
    });
}

module.exports.signup=async (req,res)=>{

     const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array()
        });
    }

    let{email,password,name,phoneno, alternatenumber,address}=req.body;
    let phoneNumber = phoneno || req.body.phone;

    let hashedpassword=await userobj.hashpassword(password);
    let newuser=await userobj.create({
        email:email, 
        password:hashedpassword,
        name:name,
        phoneno:phoneNumber,
      alternatenumber: alternatenumber,
        address: {
            street: address?.street || "",
            city: address?.city || "",
            state: address?.state || "",
            pinCode: address?.pincode || address?.pinCode || ""
        }
    });
    if(!newuser){
        return res.status(404).json({message:"invalid credentials of user"})
    }
   const token = await newuser.generateToken();
      return res.status(200).json({
        success: true,
        message: "Signup successful",
        token,
        user:newuser
    });
}


module.exports.profile = async (req, res) => {
    try {


        const user = await userobj.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        return res.status(200).json({
            success: true,
            user,
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

        const user = await userobj.findById(req.user.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        const hashedpassword = await userobj.hashpassword(password);
        user.password = hashedpassword;
        await user.save();

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

        const user = await userobj.findById(req.user.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        const { name, email, phoneno } = req.body;

        if (email && email !== user.email) {
            const existing = await userobj.findOne({ email: email });
            if (existing) {
                return res.status(400).json({
                    success: false,
                    message: "Email already in use",
                });
            }
            user.email = email;
        }

        if (name) user.name = name;
        if (phoneno) user.phoneno = phoneno;

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            user,
        });
    } catch (err) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token",
        });
    }
};
