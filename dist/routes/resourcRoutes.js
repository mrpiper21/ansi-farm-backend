"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const resource_controller_1 = require("./../controllers/resource-controller");
const express_1 = require("express");
// import authenticate from '@/middlewares/auth';
const router = (0, express_1.Router)();
router.post("/resource/create", resource_controller_1.createResource);
// Get resources with pagination and filtering
// Can filter by category and contentType
// Example: /resources?category=soil&contentType=video&page=2&limit=5
router.get("/resource/get", resource_controller_1.getResources);
router.get("/resource/get/:id", resource_controller_1.getResourceById);
// Get available categories
router.get('/categories', resource_controller_1.getCategories);
exports.default = router;
