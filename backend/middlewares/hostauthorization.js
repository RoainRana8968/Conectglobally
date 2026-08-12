const jwt = require("jsonwebtoken");
const hostobj = require("../models/hostSchema");

module.exports.hostauthorization = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization || "";
        const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

        if (!token) {
            return res.status(401).json({ message: "No token provided" });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");

        const host = await hostobj.findById(decoded.id);
        console.log("Host:", host);

        if (!host) {
            return res.status(403).json({
                success: false,
                message: "Only hosts can access this route."
            });
        }

        req.currhost = decoded;//changed
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token"
        });
    }
};