import express from "express";
import { protect, admin } from "../middleware/authMiddleware.js";
import formidableMiddleware from "express-formidable";

import {
  getFormByID,
  getFormView,
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
  findFormID,
  checkFormAdmin,
  userCanAnswer,
  deleteAnswer,
} from "../controllers/formController.js";

const router = express.Router();

router.route("/").put(protect, createForm);

router
  .route("/:id")
  .get(protect, findFormID, checkFormAdmin, getFormByID)
  .delete(protect, findFormID, checkFormAdmin, deleteForm)
  .put(protect, findFormID, checkFormAdmin, updateForm);

router.route("/:id/view").get(protect, findFormID, userCanAnswer, getFormView);

router
  .route("/:id/answers")
  .post(protect, findFormID, checkFormAdmin, getFormAnswers);

router
  .route("/:id/answers/:answerID/:questionID/downloadFile")
  .get(protect, findFormID, downloadFile);

router
  .route("/:id/answers/:answerID")
  .get(protect, findFormID, getSpecificAnswer)
  .delete(protect, findFormID, deleteAnswer);

router.route("/:id/userAnswers").get(protect, getUserAnswers);

router
  .route("/:id/questions")
  .put(protect, findFormID, checkFormAdmin, createQuestion);

router
  .route("/:id/questions/:questionID")
  .put(protect, findFormID, checkFormAdmin, updateQuestion)
  .delete(protect, findFormID, checkFormAdmin, deleteQuestion);

router
  .route("/sendAnswer")
  .post(
    protect,
    formidableMiddleware({ multiples: true, uploadDir: "../uploads" }),
    sendAnswer
  );

export default router;
