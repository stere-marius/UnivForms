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
  setGroupAdmin,
  addGroupForm,
} from "../controllers/groupController.js";

const router = express.Router();

router.route("/").put(protect, createGroup);

router
  .route("/:id")
  .get(protect, findGroupID, getGroupByID)
  .delete(protect, findGroupID, deleteGroup);
router.route("/:id/forms").put(protect, findGroupID, groupAdmin, addGroupForm);
router.route("/:id/users").put(protect, findGroupID, groupAdmin, addUser);
router
  .route("/:id/users/:userID")
  .delete(protect, findGroupID, groupAdmin, removeUser);
router
  .route("/:id/admins")
  .put(protect, findGroupID, groupAdmin, setGroupAdmin);

export default router;
