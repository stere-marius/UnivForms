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
  updateForm,
  downloadFile,
  findFormID,
  checkFormAdmin,
  userCanAnswer,
} from "../controllers/formController.js";
import {
  sendAnswer,
  getUserAnswers,
  getFormAnswers,
  getSpecificAnswer,
  deleteAnswer,
  setScoreAnswer,
  sendAnswerLinkEmail,
  getFormAnswersStatistics,
} from "../controllers/formAnswersController.js";

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
  .route("/:id/answers/statistics")
  .get(protect, findFormID, checkFormAdmin, getFormAnswersStatistics);

router
  .route("/:id/answers/:answerID/sendUserAnswer")
  .post(protect, findFormID, checkFormAdmin, sendAnswerLinkEmail);

router
  .route("/:id/answers/:answerID/:questionID/downloadFile")
  .get(protect, findFormID, downloadFile);

router
  .route("/:id/answers/:answerID/:questionID/score")
  .put(protect, findFormID, checkFormAdmin, setScoreAnswer);

router
  .route("/:id/answers/:answerID")
  .get(findFormID, getSpecificAnswer)
  .delete(protect, findFormID, checkFormAdmin, deleteAnswer);

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
    formidableMiddleware({ multiples: true, uploadDir: "/uploads" }),
    sendAnswer
  );

export default router;
