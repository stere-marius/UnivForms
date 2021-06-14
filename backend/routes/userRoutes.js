import express from "express";
import { protect, admin } from "../middleware/authMiddleware.js";
import {
  authUser,
  registerUser,
  getUserByID,
  deleteUser,
  getUsers,
  updateUserProfile,
  getUserProfile,
  getUserGroups,
  getUserForms,
  searchUser,
  updateUserEmail,
  generatePasswordResetLink,
  updateUserPassword,
} from "../controllers/userController.js";
import { requestValidatorResult } from "../validators/requestValidatorResult.js";
import {
  registerUserValidator,
  updateUserProfileValidator,
  updateUserEmailValidator,
} from "../validators/userValidator.js";

const router = express.Router();

router
  .route("/")
  .post(registerUserValidator(), requestValidatorResult, registerUser)
  .get(protect, searchUser);

router
  .route("/profile")
  .get(protect, getUserProfile)
  .put(
    protect,
    updateUserProfileValidator(),
    requestValidatorResult,
    updateUserProfile
  );

router
  .route("/profile/generatePasswordLink")
  .put(protect, generatePasswordResetLink);

router.route("/profile/password").put(protect, updateUserPassword);

router
  .route("/profile/email")
  .put(
    protect,
    updateUserEmailValidator(),
    requestValidatorResult,
    updateUserEmail
  );

router.get("/groups", protect, getUserGroups);
router.get("/forms", protect, getUserForms);
router.post("/login", authUser);

router.route("/:id").get(getUserByID).delete(protect, admin, deleteUser);

export default router;
