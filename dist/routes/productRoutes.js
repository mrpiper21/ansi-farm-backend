"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const product_controller_1 = require("../controllers/product-controller");
// import { protect } from '../middleware/authMiddleware';
const multer_1 = __importDefault(require("../config/multer"));
const router = express_1.default.Router();
router.post("/create/:id", 
//   protect,
multer_1.default.single("image"), product_controller_1.createProduct);
router.get("/", product_controller_1.getProducts);
router.get("/farmer/:id", product_controller_1.getFarmerProducts);
router.put("/farmer/produce/update/:id", product_controller_1.updateProduct);
router.delete("/farmer/produce/delete/:id", product_controller_1.deleteProduct);
exports.default = router;
