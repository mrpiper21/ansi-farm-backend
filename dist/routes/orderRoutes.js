"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const order_controller_1 = require("../controllers/order-controller");
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
router.post("/create", order_controller_1.createOrder);
router.get("/farmer-orders/:farmerId", order_controller_1.getFarmerOrderDetails);
router.get("/farmer-orders/:id/status", order_controller_1.updateOrderStatus);
exports.default = router;
