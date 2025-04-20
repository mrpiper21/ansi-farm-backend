"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteOrder = exports.updateOrderStatus = exports.getOrderById = exports.getFarmerOrderDetails = exports.getOrders = exports.getFarmerOrders = exports.createOrder = void 0;
const orderModel_1 = __importDefault(require("../model/orderModel"));
const productModel_1 = __importDefault(require("../model/productModel"));
const mongoose_1 = __importDefault(require("mongoose"));
/**
 * Create a new order
 */
const createOrder = async (req, res) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const { buyer, items } = req.body;
        // Validate input
        if (!buyer || !items || items.length === 0) {
            await session.abortTransaction();
            return res.status(400).json({ error: 'Buyer and items are required' });
        }
        let totalAmount = 0;
        const orderItems = [];
        const farmers = new Set(); // Track unique farmers
        const productsToUpdate = [];
        // Process each item
        for (const item of items) {
            const product = await productModel_1.default.findById(item.product)
                .populate('farmer')
                .session(session);
            if (!product) {
                await session.abortTransaction();
                return res.status(404).json({ error: `Product ${item.product} not found` });
            }
            if (!product.farmer) {
                await session.abortTransaction();
                return res.status(400).json({ error: `Product ${product.name} has no associated farmer` });
            }
            // Convert quantity to number if stored as string
            const availableQuantity = typeof product.quantity === 'string'
                ? parseFloat(product.quantity)
                : product.quantity;
            if (availableQuantity < item.quantity) {
                await session.abortTransaction();
                return res.status(400).json({
                    error: `Insufficient stock for ${product.name}. Available: ${availableQuantity}`
                });
            }
            const itemPrice = product.price * item.quantity;
            totalAmount += itemPrice;
            orderItems.push({
                product: product._id,
                quantity: item.quantity,
                price: product.price,
                farmer: product.farmer._id
            });
            farmers.add(product.farmer._id);
            productsToUpdate.push({
                id: product._id,
                quantity: availableQuantity - item.quantity
            });
        }
        // Create the order
        const order = new orderModel_1.default({
            buyer,
            items: orderItems,
            farmers: Array.from(farmers), // Convert Set to array
            totalAmount,
            status: 'pending'
        });
        await order.save({ session });
        // Update product quantities
        for (const productUpdate of productsToUpdate) {
            await productModel_1.default.findByIdAndUpdate(productUpdate.id, { $set: { quantity: productUpdate.quantity } }, { session });
        }
        // Send notifications to farmers
        //   for (const farmerId of farmers) {
        //     const farmer = await User.findById(farmerId).session(session);
        //     if (farmer) {
        //       await sendNotification({
        //         userId: farmer._id,
        //         title: 'New Order Received',
        //         message: `You have a new order #${order._id}`,
        //         type: 'order',
        //         data: { orderId: order._id }
        //       });
        //     }
        //   }
        await session.commitTransaction();
        res.status(201).json({
            success: true,
            message: 'Order created successfully',
            order: order.toObject({ versionKey: false })
        });
    }
    catch (error) {
        await session.abortTransaction();
        console.error('Error creating order:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create order'
        });
    }
    finally {
        session.endSession();
    }
};
exports.createOrder = createOrder;
const getFarmerOrders = async (req, res) => {
    try {
        const farmerId = req.params.farmerId;
        const { status, page = 1, limit = 10 } = req.query;
        const query = {
            farmers: farmerId,
            ...(status && { status })
        };
        const orders = await orderModel_1.default.find(query)
            .populate('buyer', 'name email')
            .populate('items.product', 'name imageUrl')
            .sort({ createdAt: -1 })
            .limit(Number(limit))
            .skip((Number(page) - 1) * Number(limit))
            .exec();
        const total = await orderModel_1.default.countDocuments(query);
        return res.json({
            success: true,
            data: orders,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit))
            }
        });
    }
    catch (error) {
        console.error('Error fetching farmer orders:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to fetch orders'
        });
    }
};
exports.getFarmerOrders = getFarmerOrders;
const getOrders = async (req, res) => {
    try {
        const { buyer } = req.query;
        const filter = buyer ? { buyer } : {};
        const orders = await orderModel_1.default.find(filter)
            .populate('buyer', 'name email')
            .populate('items.product', 'name price imageUrl');
        return res.json(orders);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
};
exports.getOrders = getOrders;
const getFarmerOrderDetails = async (req, res) => {
    try {
        const { farmerId, orderId } = req.params;
        const order = await orderModel_1.default.findOne({
            _id: orderId,
            farmers: farmerId
        })
            .populate('buyer', 'name email')
            .populate('items.product', 'name imageUrl price')
            .populate('items.farmer', 'name email')
            .exec();
        if (!order) {
            return res.status(404).json({
                success: false,
                error: 'Order not found or not associated with this farmer'
            });
        }
        // Filter items to only show those belonging to this farmer
        const farmerItems = order.items.filter(item => item.farmer && item.farmer.toString() === farmerId);
        res.json({
            success: true,
            data: {
                ...order.toObject(),
                items: farmerItems
            }
        });
    }
    catch (error) {
        console.error('Error fetching farmer order details:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch order details'
        });
    }
};
exports.getFarmerOrderDetails = getFarmerOrderDetails;
/**
 * Get a single order by ID
 */
const getOrderById = async (req, res) => {
    try {
        const order = await orderModel_1.default.findById(req.params.id)
            .populate('buyer', 'name email')
            .populate('items.product', 'name price imageUrl');
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        res.json(order);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch order' });
    }
};
exports.getOrderById = getOrderById;
/**
 * Update order status (e.g., from 'pending' to 'confirmed')
 */
const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const order = await orderModel_1.default.findByIdAndUpdate(req.params.id, { status, updatedAt: Date.now() }, { new: true });
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        res.json(order);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update order' });
    }
};
exports.updateOrderStatus = updateOrderStatus;
/**
 * Delete an order (admin only)
 */
const deleteOrder = async (req, res) => {
    try {
        const order = await orderModel_1.default.findByIdAndDelete(req.params.id);
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        res.json({ message: 'Order deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete order' });
    }
};
exports.deleteOrder = deleteOrder;
