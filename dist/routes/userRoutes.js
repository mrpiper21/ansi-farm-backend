"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const user_controller_1 = require("../controllers/user-controller");
const express_1 = require("express");
// import authenticate from '@/middlewares/auth';
const router = (0, express_1.Router)();
router.post('/register', user_controller_1.registerUser).post('/login', user_controller_1.login);
exports.default = router;
