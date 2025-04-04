

import {
	createResource,
	getCategories,
	getResources,
} from "./../controllers/resource-controller";
import { Router } from 'express';
// import authenticate from '@/middlewares/auth';

const router = Router();
router.post('/resource/create', createResource);

// Get resources with pagination and filtering
// Can filter by category and contentType
// Example: /resources?category=soil&contentType=video&page=2&limit=5
router.get('/resource/get', getResources);

// Get available categories
router.get('/categories', getCategories);

export default router;