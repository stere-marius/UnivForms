import Form from "../models/formularModel.js";
import Group from "../models/grupModel.js";
import User from "../models/utilizatorModel.js";
import FormResponses from "../models/raspunsuriModel.js";
import FormAnswers from "../models/raspunsuriModel.js";
import asyncHandler from "express-async-handler";
import {
  isNumeric,
  validateNumberRange,
  validateStringLength,
} from "../utils/validators.js";
import mongoose from "mongoose";
import { request } from "express";

// @desc    Valideaza existența grupului și îl pune în request
const findGroupID = asyncHandler(async (request, response, next) => {
  const groupID = request.params.id;

  if (!mongoose.Types.ObjectId.isValid(groupID)) {
    return response.status(404).json({ message: "Grupul nu a fost gasit" });
  }

  const group = await Group.findById(request.params.id);

  if (!group) {
    return response.status(404).json({ message: "Grupul nu a fost gasit" });
  }

  request.group = group;
  next();
});

const groupAdmin = asyncHandler(async (request, response, next) => {
  const groupAdmins = request.group.utilizatori
    .filter(user => user.administrator)
    .map(user => user.utilizatorID.toString());

  request.groupAdmins = groupAdmins;

  if (!groupAdmins.includes(request.user._id.toString())) {
    return response.status(401).json({
      message: "Nu aveți permisiunea de a sterge utilizatori din grup!",
    });
  }

  next();
});

// @desc    Obtine grup folosind ID
// @route   GET /api/groups/:id
// @access  Private
const getGroupByID = asyncHandler(async (request, response) => {
  const group = await Group.findById(request.group);

  return response.json(group);
});

// @desc    Creeaza grup
// @route   GET /api/groups
// @access  Private
const createGroup = asyncHandler(async (request, response) => {
  const name = request.body.name;

  if (!name || !name.trim()) {
    return response
      .status(401)
      .json({ message: "Numele grupului nu trebuie să fie vid!" });
  }

  const utilizatori = [];
  utilizatori.push({
    administrator: true,
    utilizatorID: request.user._id,
  });

  const group = await Group.create({
    nume: name,
    creator: request.user._id,
    utilizatori,
  });

  return response.status(201).json(group);
});

// @desc    Sterge grup
// @route   DELETE /api/groups/:id
// @access  Private/Group creator
const deleteGroup = asyncHandler(async (request, response) => {
  const group = request.group;

  if (group.creator.toString() !== request.user._id.toString()) {
    return response.status(401).json({
      message:
        "Nu sunteți administratorul acestui grup pentru a efectua această acțiune!",
    });
  }

  return response
    .status(200)
    .json({ message: "Grupul a fost șters cu succes!" });
});

// @desc    Sterge membru grup
// @route   DELETE /api/groups/:id/users/:userID
// @access  Private/Group admin
const removeUser = asyncHandler(async (request, response) => {
  const group = request.group;

  const userID = request.params.userID;

  if (!userID) {
    return response
      .status(400)
      .json({ message: "Introduceti un utilizator valid!" });
  }

  const removeIndex = group.utilizatori.findIndex(
    user => user.utilizatorID.toString() === userID
  );

  if (removeIndex === -1) {
    return response
      .status(400)
      .json({ message: "Acest utilizator nu se află în grup!" });
  }

  group.utilizatori.splice(removeIndex, 1);
  await group.save();

  return response
    .status(200)
    .json({ message: "Utilizatorul a fost șters cu succes!" });
});

// @desc    Adauga membru grup
// @route   PUT /api/groups/:id/users/
// @access  Private/Group admin
const addUser = asyncHandler(async (request, response) => {
  const group = request.group;

  const userID = request.body.userID;

  if (!userID) {
    return response
      .status(400)
      .json({ message: "Introduceti un utilizator valid!" });
  }

  const isAlreadyInGroup = group.utilizatori.find(
    user => user.utilizatorID.toString() === userID
  );

  if (isAlreadyInGroup) {
    return response
      .status(400)
      .json({ message: "Acest utilizator se află deja în grup!" });
  }

  const user = await User.findById(userID);

  if (!user) {
    return response
      .status(404)
      .json({ message: "Utilizatorul nu a fost găsit!" });
  }

  group.utilizatori.push({ utilizatorID: userID });
  await group.save();

  return response
    .status(200)
    .json({ message: "Utilizatorul a fost adaugat cu succes!" });
});

export {
  findGroupID,
  groupAdmin,
  getGroupByID,
  createGroup,
  deleteGroup,
  removeUser,
  addUser,
};
