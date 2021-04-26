import express from "express";
import { protect, admin } from "../middleware/authMiddleware.js";
import { authUser, registerUser } from "../controllers/userController.js";
import { requestValidatorResult } from "../validators/requestValidatorResult.js";
import { registerUserValidator } from "../validators/userValidator.js";

// router
//   .route("/")
//   .post(registerUserValidator, requestValidatorResult, registerUser);

const router = express.Router();
router
  .route("/")
  .post(registerUserValidator(), requestValidatorResult, registerUser);
router.post("/login", authUser);

export default router;
