import { Request, Response } from 'express';
import Order from "../model/orderModel"
import Product from "../model/productModel"
import mongoose from 'mongoose';

/**
 * Create a new order
 */
  
  export const createOrder = async (req: any, res: any) => {
    const session = await mongoose.startSession();
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
      const farmers = new Set<mongoose.Types.ObjectId>(); // Track unique farmers
      const productsToUpdate = [];
  
      // Process each item
      for (const item of items) {
        const product = await Product.findById(item.product)
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
        const availableQuantity: any = typeof product.quantity === 'string' 
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
      const order = new Order({
        buyer,
        items: orderItems,
        farmers: Array.from(farmers), // Convert Set to array
        totalAmount,
        status: 'pending'
      });
  
      await order.save({ session });
  
      // Update product quantities
      for (const productUpdate of productsToUpdate) {
        await Product.findByIdAndUpdate(
          productUpdate.id,
          { $set: { quantity: productUpdate.quantity } },
          { session }
        );
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
  
    } catch (error) {
      await session.abortTransaction();
      console.error('Error creating order:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to create order' 
      });
    } finally {
      session.endSession();
    }
  }

  export const getFarmerOrders = async (req: any, res: any) => {
    try {
      const farmerId = req.params.farmerId;
      const { status, page = 1, limit = 10 } = req.query;
  
      const query: any = { 
        farmers: farmerId,
        ...(status && { status }) 
      };
  
      const orders = await Order.find(query)
        .populate('buyer', 'name email')
        .populate('items.product', 'name imageUrl')
        .sort({ createdAt: -1 })
        .limit(Number(limit))
        .skip((Number(page) - 1) * Number(limit))
        .exec();
  
      const total = await Order.countDocuments(query);
  
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
    } catch (error) {
      console.error('Error fetching farmer orders:', error);
      return res.status(500).json({ 
        success: false,
        error: 'Failed to fetch orders' 
      });
    }
  };

export const getOrders = async (req: Request, res: Response) => {
  try {
    const { buyer } = req.query;
    const filter = buyer ? { buyer } : {};
    const orders = await Order.find(filter)
      .populate('buyer', 'name email')
      .populate('items.product', 'name price imageUrl');
    return res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

export const getFarmerOrderDetails = async (req: Request, res: Response) => {
    try {
      const { farmerId, orderId } = req.params;
  
      const order = await Order.findOne({
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
      const farmerItems = order.items.filter(item => 
        item.farmer && item.farmer.toString() === farmerId
      );
  
      res.json({
        success: true,
        data: {
          ...order.toObject(),
          items: farmerItems
        }
      });
    } catch (error) {
      console.error('Error fetching farmer order details:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to fetch order details' 
      });
    }
  };

/**
 * Get a single order by ID
 */
export const getOrderById = async (req: Request, res: Response) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('buyer', 'name email')
      .populate('items.product', 'name price imageUrl');
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch order' });
  }
};

/**
 * Update order status (e.g., from 'pending' to 'confirmed')
 */
export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status, updatedAt: Date.now() },
      { new: true }
    );
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update order' });
  }
};

/**
 * Delete an order (admin only)
 */
export const deleteOrder = async (req: Request, res: Response) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete order' });
  }
};