import express from "express";
import {
  addGroupForm,
  addUser,
  checkGroupUser,
  createGroup,
  deleteGroup,
  findGroupID,
  getGroupAdmins,
  getGroupForms,
  getGroupUsers,
  groupAdmin,
  leaveGroup,
  removeGroupForm,
  removeUser,
  setGroupAdmin,
  updateGroupTitle,
} from "../controllers/groupController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").put(protect, createGroup);

router
  .route("/:id")
  .put(protect, findGroupID, groupAdmin, updateGroupTitle)
  .delete(protect, findGroupID, groupAdmin, deleteGroup);

router
  .route("/:id/forms")
  .post(protect, findGroupID, groupAdmin, addGroupForm)
  .get(protect, findGroupID, checkGroupUser, getGroupForms);

router
  .route("/:id/forms/:formID")
  .delete(protect, findGroupID, groupAdmin, removeGroupForm);

router
  .route("/:id/users")
  .get(protect, findGroupID, checkGroupUser, getGroupUsers)
  .post(protect, findGroupID, groupAdmin, addUser)
  .delete(protect, findGroupID, leaveGroup);

router
  .route("/:id/users/:userID")
  .delete(protect, findGroupID, groupAdmin, removeUser);

router
  .route("/:id/admins")
  .get(protect, findGroupID, checkGroupUser, getGroupAdmins)
  .put(protect, findGroupID, groupAdmin, setGroupAdmin);

export default router;
