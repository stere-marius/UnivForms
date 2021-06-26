import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  findGroupID,
  createGroup,
  deleteGroup,
  groupAdmin,
  getGroupUsers,
  removeUser,
  addUser,
  setGroupAdmin,
  addGroupForm,
  removeGroupForm,
  getGroupForms,
  getGroupAdmins,
  checkGroupUser,
  updateGroupTitle,
  leaveGroup,
} from "../controllers/groupController.js";

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
