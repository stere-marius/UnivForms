import express from "express";
import {
  authUser,
  deleteUser,
  generatePasswordResetLink,
  getUserByID,
  getUserForms,
  getUserGroups,
  getUserProfile,
  registerUser,
  searchUser,
  updateUserEmail,
  updateUserPassword,
  updateUserProfile,
} from "../controllers/userController.js";
import { admin, protect } from "../middleware/authMiddleware.js";
import { requestValidatorResult } from "../validators/requestValidatorResult.js";
import {
  registerUserValidator,
  updateUserEmailValidator,
  updateUserProfileValidator,
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

router.route("/profile/generatePasswordLink").put(generatePasswordResetLink);

router.route("/profile/password").put(updateUserPassword);

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
