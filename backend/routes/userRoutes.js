import express, { response } from "express";
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
const { verify } = require(`coinpayments-ipn`);
const CoinpaymentsIPNError = require(`coinpayments-ipn/lib/error`);

const router = express.Router();

router.post("/notifications", function (req, res, next) {
  if (
    !req.get(`HMAC`) ||
    !req.body ||
    !req.body.ipn_mode ||
    req.body.ipn_mode !== `hmac` ||
    "05165d28d51b2617a258f7dc14af9a3c" !== req.body.merchant
  ) {
    return next(new Error(`Invalid request`));
  }

  let isValid, error;

  try {
    isValid = verify(req.get(`HMAC`), IPN_SECRET, req.body);
  } catch (e) {
    error = e;
  }

  if (error && error instanceof CoinpaymentsIPNError) {
    return next(error);
  }

  if (!isValid) {
    return next(new Error(`Hmac calculation does not match`));
  }

  // const requestBody = JSON.stringify(request.body);

  return res.status(200).json(req.body);
});

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
