import express from "express";
import { protect, admin } from "../middleware/authMiddleware.js";
import formidableMiddleware from "express-formidable";

import {
  getFormByID,
  createForm,
  deleteForm,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  sendAnswer,
  updateForm,
  getUserAnswers,
} from "../controllers/formController.js";

const router = express.Router();

router.route("/").put(protect, createForm);
router
  .route("/:id")
  .get(getFormByID)
  .delete(protect, deleteForm)
  .put(protect, updateForm);

router.route("/:id/userAnswers").get(getUserAnswers);
router.route("/:id/questions").put(protect, createQuestion);

router
  .route("/:id/questions/:questionID")
  .put(protect, updateQuestion)
  .delete(protect, deleteQuestion);

router
  .route("/sendAnswer")
  .post(
    protect,
    formidableMiddleware({ multiples: true, uploadDir: "../uploads" }),
    sendAnswer
  );

export default router;
