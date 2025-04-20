
import { createOrder, getFarmerOrders } from '../controllers/order-controller';
import express from 'express';

const router = express.Router();

router.post("/create", createOrder);
router.get("/farmer-orders/:farmerId", getFarmerOrders);

export default router