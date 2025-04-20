
import {
	createOrder,
	getFarmerOrderDetails,
	getFarmerOrders,
	updateOrderStatus,
} from "../controllers/order-controller";
import express from "express";

const router = express.Router();

router.post("/create", createOrder);
router.get("/farmer-orders/:farmerId", getFarmerOrders);
router.get("/farmer-orders/single/:farmerId/:orderId", getFarmerOrderDetails);
router.get("/farmer-orders/:id/status", updateOrderStatus);

export default router