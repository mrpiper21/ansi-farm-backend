

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

export default router;