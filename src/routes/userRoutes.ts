

import {
	generateFarmerCode,
	validateFarmerCode,
} from "../controllers/farmCode-controller";
import {
	getFarmerDetails,
	getFarmers,
	login,
	registerUser,
} from "../controllers/user-controller";
import { Router } from "express";
// import authenticate from '@/middlewares/auth';

const router = Router();

router.post("/register", registerUser).post("/login", login);
router.get("/farmers", getFarmers).get("/farmers/single/:id", getFarmerDetails);
router.post("/generate", generateFarmerCode);
router.post("/validate", validateFarmerCode);

export default router;