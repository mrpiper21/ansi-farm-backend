import express from 'express';
import {
	createProduct,
	getFarmerProducts,
	getProducts,
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

export default router;