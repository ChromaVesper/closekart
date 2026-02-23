const SwapKeeper = require("../models/SwapKeeper");
const SwapItem = require("../models/SwapItem");
const SwapOrder = require("../models/SwapOrder");
const User = require("../models/User");

// Helper: get or create SwapKeeper profile for the logged-in user
const getOrCreateProfile = async (userId) => {
    let keeper = await SwapKeeper.findOne({ userId });
    if (!keeper) {
        const user = await User.findById(userId).select("name email phone");
        keeper = await SwapKeeper.create({
            userId,
            ownerName: user?.name || "",
            email: user?.email || "",
            phone: user?.phone || "",
        });
    }
    return keeper;
};

// ──────────────────────────────────────────────────────────────
// DASHBOARD STATS
// ──────────────────────────────────────────────────────────────

exports.getDashboardStats = async (req, res) => {
    try {
        const keeper = await getOrCreateProfile(req.user.id);

        const [totalItems, totalOrders, pendingOrders, acceptedOrders] = await Promise.all([
            SwapItem.countDocuments({ swapKeeperId: keeper._id }),
            SwapOrder.countDocuments({ swapKeeperId: keeper._id }),
            SwapOrder.countDocuments({ swapKeeperId: keeper._id, status: "pending" }),
            SwapOrder.countDocuments({ swapKeeperId: keeper._id, status: "accepted" }),
        ]);

        res.json({ totalItems, totalOrders, pendingOrders, acceptedOrders });
    } catch (err) {
        console.error("getDashboardStats error:", err.message);
        res.status(500).json({ msg: "Server error" });
    }
};

// ──────────────────────────────────────────────────────────────
// ITEMS
// ──────────────────────────────────────────────────────────────

exports.getItems = async (req, res) => {
    try {
        const keeper = await getOrCreateProfile(req.user.id);
        const items = await SwapItem.find({ swapKeeperId: keeper._id }).sort({ createdAt: -1 });
        res.json(items);
    } catch (err) {
        console.error("getItems error:", err.message);
        res.status(500).json({ msg: "Server error" });
    }
};

exports.createItem = async (req, res) => {
    try {
        const keeper = await getOrCreateProfile(req.user.id);
        const { title, description, category, images, price, swapAllowed, stock, status } = req.body;

        if (!title || price === undefined) {
            return res.status(400).json({ msg: "Title and price are required" });
        }

        const item = await SwapItem.create({
            swapKeeperId: keeper._id,
            title,
            description,
            category,
            images: images || [],
            price,
            swapAllowed: swapAllowed || false,
            stock: stock || 0,
            status: status || "active",
        });

        res.status(201).json(item);
    } catch (err) {
        console.error("createItem error:", err.message);
        res.status(500).json({ msg: "Server error" });
    }
};

exports.updateItem = async (req, res) => {
    try {
        const keeper = await getOrCreateProfile(req.user.id);
        const item = await SwapItem.findOne({ _id: req.params.id, swapKeeperId: keeper._id });
        if (!item) return res.status(404).json({ msg: "Item not found" });

        const fields = ["title", "description", "category", "images", "price", "swapAllowed", "stock", "status"];
        fields.forEach((f) => {
            if (req.body[f] !== undefined) item[f] = req.body[f];
        });

        await item.save();
        res.json(item);
    } catch (err) {
        console.error("updateItem error:", err.message);
        res.status(500).json({ msg: "Server error" });
    }
};

exports.deleteItem = async (req, res) => {
    try {
        const keeper = await getOrCreateProfile(req.user.id);
        const item = await SwapItem.findOneAndDelete({ _id: req.params.id, swapKeeperId: keeper._id });
        if (!item) return res.status(404).json({ msg: "Item not found" });
        res.json({ msg: "Item deleted" });
    } catch (err) {
        console.error("deleteItem error:", err.message);
        res.status(500).json({ msg: "Server error" });
    }
};

// ──────────────────────────────────────────────────────────────
// ORDERS
// ──────────────────────────────────────────────────────────────

exports.getOrders = async (req, res) => {
    try {
        const keeper = await getOrCreateProfile(req.user.id);
        const orders = await SwapOrder.find({ swapKeeperId: keeper._id })
            .populate("itemId", "title images price")
            .populate("buyerId", "name email phone")
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        console.error("getOrders error:", err.message);
        res.status(500).json({ msg: "Server error" });
    }
};

exports.acceptOrder = async (req, res) => {
    try {
        const keeper = await getOrCreateProfile(req.user.id);
        const order = await SwapOrder.findOne({ _id: req.params.id, swapKeeperId: keeper._id });
        if (!order) return res.status(404).json({ msg: "Order not found" });
        if (order.status !== "pending") return res.status(400).json({ msg: "Order is not pending" });

        order.status = "accepted";
        await order.save();
        res.json({ msg: "Order accepted", order });
    } catch (err) {
        console.error("acceptOrder error:", err.message);
        res.status(500).json({ msg: "Server error" });
    }
};

exports.declineOrder = async (req, res) => {
    try {
        const keeper = await getOrCreateProfile(req.user.id);
        const order = await SwapOrder.findOne({ _id: req.params.id, swapKeeperId: keeper._id });
        if (!order) return res.status(404).json({ msg: "Order not found" });
        if (order.status !== "pending") return res.status(400).json({ msg: "Order is not pending" });

        order.status = "declined";
        await order.save();
        res.json({ msg: "Order declined", order });
    } catch (err) {
        console.error("declineOrder error:", err.message);
        res.status(500).json({ msg: "Server error" });
    }
};

// ──────────────────────────────────────────────────────────────
// PROFILE
// ──────────────────────────────────────────────────────────────

exports.getProfile = async (req, res) => {
    try {
        const keeper = await getOrCreateProfile(req.user.id);
        res.json(keeper);
    } catch (err) {
        console.error("getProfile error:", err.message);
        res.status(500).json({ msg: "Server error" });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const keeper = await getOrCreateProfile(req.user.id);
        const fields = ["shopName", "ownerName", "email", "phone", "address", "city", "state", "pincode", "avatar"];
        fields.forEach((f) => {
            if (req.body[f] !== undefined) keeper[f] = req.body[f];
        });
        await keeper.save();
        res.json(keeper);
    } catch (err) {
        console.error("updateProfile error:", err.message);
        res.status(500).json({ msg: "Server error" });
    }
};
