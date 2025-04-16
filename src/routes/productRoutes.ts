import express from 'express';
import {
	createProduct,
	deleteProduct,
	getFarmerProducts,
	getProducts,
	updateProduct,
} from "../controllers/product-controller";
// import { protect } from '../middleware/authMiddleware';
import upload from "../config/multer";

const router = express.Router();

router.post(
	"/create/:id",
	//   protect,
	upload.single("image"),
	createProduct
);

router.get("/", getProducts);
router.get("/farmer/:id", getFarmerProducts);
router.get("/farmer/produce/update/:id", updateProduct);
router.get("/farmer/produce/delete/:id", deleteProduct);

export default router;