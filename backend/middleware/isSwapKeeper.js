const User = require("../models/User");

/**
 * isSwapKeeper middleware — must be used AFTER authMiddleware.
 * Verifies the authenticated user has role swap_keeper or shopkeeper.
 */
module.exports = async function (req, res, next) {
    try {
        const userId = req.user?.id || req.user?.userId;
        if (!userId) {
            return res.status(401).json({ msg: "Not authenticated" });
        }

        const user = await User.findById(userId).select("role");
        if (!user) {
            return res.status(401).json({ msg: "User not found" });
        }

        const allowedRoles = ["swap_keeper", "shopkeeper"];
        if (!allowedRoles.includes(user.role)) {
            return res.status(403).json({ msg: "Access denied. Swap Keeper role required." });
        }

        // Attach full user role to request for downstream use
        req.user.role = user.role;
        next();
    } catch (err) {
        console.error("isSwapKeeper error:", err.message);
        res.status(500).json({ msg: "Server error in role check" });
    }
};
