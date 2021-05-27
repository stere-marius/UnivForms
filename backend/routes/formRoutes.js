import express from "express";
import { protect, admin } from "../middleware/authMiddleware.js";
import formidableMiddleware from "express-formidable";

import { requestValidatorResult } from "../validators/requestValidatorResult.js";
import {
  registerUserValidator,
  updateUserProfileValidator,
} from "../validators/userValidator.js";

import {
  getFormByID,
  createForm,
  deleteForm,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  formFileUpload,
  sendAnswer,
} from "../controllers/formController.js";

const router = express.Router();

router.route("/").put(protect, createForm);
router.route("/:id").get(getFormByID).delete(protect, deleteForm);
router.route("/:id/questions").put(protect, createQuestion);
router
  .route("/:id/questions/:question_id")
  .put(protect, updateQuestion)
  .delete(protect, deleteQuestion);
router.route("/uploadFormResponse").post(protect, formFileUpload);

router
  .route("/sendAnswer")
  .post(
    protect,
    formidableMiddleware({ multiples: true, uploadDir: "../uploads" }),
    sendAnswer
  );

export default router;
