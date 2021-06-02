import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  findGroupID,
  getGroupByID,
  createGroup,
  deleteGroup,
  groupAdmin,
  removeUser,
  addUser,
} from "../controllers/groupController.js";

const router = express.Router();

router.route("/").put(protect, createGroup);

router
  .route("/:id")
  .get(protect, findGroupID, getGroupByID)
  .delete(protect, findGroupID, deleteGroup);
router.route("/:id/users").put(protect, findGroupID, groupAdmin, addUser);
router
  .route("/:id/users/:userID")
  .delete(protect, findGroupID, groupAdmin, removeUser);

export default router;
