import { Request, Response } from 'express';
import Product, { IProduct } from "../model/productModel";
import { uploadToCloudinary } from '../config/cloudinary'; // Optional for image uploads

export const createProduct = async (req: any, res: any) => {
  try {
    const { name, category, description, price, quantity } = req.body;
    const farmerId = req.user._id; // Assuming you have authentication middleware
    
    // Validate required fields
    if (!name || !category || !price) {
      return res.status(400).json({ 
        success: false,
        message: 'Name, category, and price are required fields'
      });
    }

    // Handle image upload if exists
    let imageUrl;
    if (req.file) {
      const uploadResult = await uploadToCloudinary(req.file);
      imageUrl = uploadResult.secure_url;
    } else if (req.body.image) {
      // If image is passed as base64 or URL
      imageUrl = req.body.image;
    }

    // Create new product
    const newProduct: IProduct = new Product({
      name,
      category,
      description,
      price: parseFloat(price),
      quantity,
      imageUrl,
      farmer: farmerId
    });

    await newProduct.save();

    res.status(201).json({
      success: true,
      data: newProduct,
      message: 'Product listed successfully'
    });

  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while creating product'
    });
  }
};

export const getProducts = async (req: Request, res: Response) => {
  try {
    const { category } = req.query;
    const filter = category ? { category } : {};
    
    const products = await Product.find(filter)
      .populate('farmer', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: products
    });

  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while fetching products'
    });
  }
};