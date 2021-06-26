import express from "express";
import formidableMiddleware from "express-formidable";
import {
  deleteAnswer,
  getFormAnswers,
  getFormAnswersStatistics,
  getSpecificAnswer,
  getUserAnswers,
  sendAnswer,
  sendAnswerLinkEmail,
  setScoreAnswer,
} from "../controllers/formAnswersController.js";
import {
  checkFormAdmin,
  createForm,
  createQuestion,
  deleteForm,
  deleteQuestion,
  downloadFile,
  findFormID,
  getFormByID,
  getFormView,
  updateForm,
  updateQuestion,
  userCanAnswer,
} from "../controllers/formController.js";
import { protect } from "../middleware/authMiddleware.js";

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
    formidableMiddleware({ multiples: true, uploadDir: "./uploads" }),
    sendAnswer
  );

export default router;
