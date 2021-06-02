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
  getFormAnswers,
  getSpecificAnswer,
  downloadFile,
} from "../controllers/formController.js";

const router = express.Router();

router.route("/").put(protect, createForm);
router
  .route("/:id")
  .get(getFormByID)
  .delete(protect, deleteForm)
  .put(protect, updateForm);

router.route("/:id/answers").get(protect, getFormAnswers);
router
  .route("/:id/answers/:answerID/:questionID/downloadFile")
  .get(protect, downloadFile);
router.route("/:id/answers/:answerID").get(protect, getSpecificAnswer);
router.route("/:id/userAnswers").get(protect, getUserAnswers);
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
