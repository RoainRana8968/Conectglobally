const jwt = require("jsonwebtoken");

module.exports.userauthorization = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization || "";
        const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

        if (!token) {
            return res.status(401).json({ message: "No token provided" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");
        req.user = decoded;// it wil work for specific request not for all request to access value by using req.user
        next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};