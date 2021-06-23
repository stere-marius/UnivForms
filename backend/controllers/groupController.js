import Form from "../models/formularModel.js";
import Group from "../models/grupModel.js";
import User from "../models/utilizatorModel.js";
import FormResponses from "../models/raspunsuriModel.js";
import asyncHandler from "express-async-handler";
import mongoose from "mongoose";

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
      message: "Nu aveți permisiunea de a efectua aceasta operatie!",
    });
  }

  next();
});

const checkGroupUser = asyncHandler(async (request, response, next) => {
  const group = request.group;

  if (
    !group.utilizatori.some(
      user => user.utilizatorID.toString() === request.user._id.toString()
    )
  ) {
    return response
      .status(401)
      .json({ message: "Nu faceti parte din acest grup!" });
  }

  next();
});

// @desc    Schimba titlul formularului
// @route   PUT /api/groups/:id
// @access  Private
const updateGroupTitle = asyncHandler(async (request, response) => {
  const { title } = request.body;

  if (!title) {
    response.status(400);
    throw new Error("Titlul formularului nu trebuie să fie vid!");
  }

  request.group.nume = title;
  const savedGroup = await request.group.save();
  return response.status(200).json({ title: savedGroup.nume });
});

// @desc    Obtine grup folosind ID
// @route   GET /api/groups/:id/forms
// @access  Private
const getGroupForms = asyncHandler(async (request, response) => {
  const forms = await Promise.all(
    request.group.formulare.map(async form => {
      const formDbFound = await Form.findById(form._id.toString());

      if (!formDbFound) return null;

      const formAnswers = await FormResponses.countDocuments({
        formular: form._id,
      });

      return {
        _id: form._id,
        titlu: formDbFound.titlu,
        raspunsuri: formAnswers,
        intrebari: formDbFound.intrebari.length,
        createdAt: formDbFound.createdAt,
        utilizator: formDbFound.utilizator,
      };
    })
  );

  return response.json({
    titlu: request.group.nume,
    forms: forms.filter(Boolean),
  });
});

// @desc    Obtine administratorii grupului
// @route   GET /api/groups/:id/forms
// @access  Private
const getGroupAdmins = asyncHandler(async (request, response) => {
  const creator = request.group.creator;
  const admins = request.group.utilizatori
    .filter(user => user.administrator)
    .map(user => ({
      id: user.utilizatorID,
      creatorFormular:
        creator.toString() === user.utilizatorID.toString() || undefined,
    }));

  return response.json(admins);
});

// @desc    Creeaza grup
// @route   GET /api/groups
// @access  Private
const createGroup = asyncHandler(async (request, response) => {
  const name = request.body.name;

  if (!name || !name.trim()) {
    return response
      .status(400)
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
        "Nu sunteți creatorul acestui grup pentru a efectua această acțiune!",
    });
  }

  await group.remove();

  return response
    .status(200)
    .json({ message: "Grupul a fost șters cu succes!" });
});

// @desc    Obtine membrii grupului
// @route   GET /api/groups/:id/users
// @access  Private
const getGroupUsers = asyncHandler(async (request, response) => {
  const group = request.group;

  const users = await Promise.all(
    group.utilizatori.map(async groupUser => {
      const userDB = await User.findById(groupUser.utilizatorID);
      const { utilizatorID, administrator } = groupUser;
      const isCreator = utilizatorID.toString() === group.creator.toString();

      console.log(`Group user = ${JSON.stringify(groupUser, null, 2)}`);

      return {
        id: utilizatorID,
        administrator,
        nume: userDB.nume,
        prenume: userDB.prenume,
        email: userDB.email,
        creator: isCreator || undefined,
      };
    })
  );

  return response.status(200).json(users);
});

// @desc    Sterge membru grup
// @route   DELETE /api/groups/:id/users/:userID
// @access  Private/Group admin
const removeUser = asyncHandler(async (request, response) => {
  const group = request.group;

  const userID = request.params.userID;

  if (!mongoose.Types.ObjectId.isValid(userID)) {
    return response
      .status(400)
      .json({ message: "Introduceti un utilizator valid!" });
  }

  if (userID === group.creator.toString()) {
    return response
      .status(400)
      .json({ message: "Nu puteti șterge creatorul grupului!" });
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

// @desc    Promoveaza utilizatorul la gradul de administrator
// @route   PUT /api/groups/:id/admins
// @access  Private/Group admin
const setGroupAdmin = asyncHandler(async (request, response) => {
  const group = request.group;

  const userID = request.body.userID;
  const admin = request.body.admin;

  if (!userID) {
    return response
      .status(400)
      .json({ message: "Introduceti un utilizator valid!" });
  }

  const user = group.utilizatori.find(
    user => user.utilizatorID.toString() === userID
  );

  if (!user) {
    return response
      .status(400)
      .json({ message: "Acest utilizator nu face parte din grup!" });
  }

  if (userID === group.creator.toString()) {
    return response.status(401).json({
      message: "Rolul celui care a creat grupul nu poate fi modificat!",
    });
  }

  user.administrator = admin || false;
  await group.save();

  return response
    .status(200)
    .json({ message: "Rolul utilizatorului a fost modificat cu succes!" });
});

// @desc    Adauga formular grup
// @route   PUT /api/groups/:id/forms
// @access  Private/Group admin
const addGroupForm = asyncHandler(async (request, response) => {
  const group = request.group;
  const formID = request.body.formID;

  if (!formID) {
    return response
      .status(400)
      .json({ message: "Introduceti un formular valid!" });
  }

  const isValidForm = await Form.findById(formID);

  if (!isValidForm) {
    return response
      .status(404)
      .json({ message: "Formularul nu a fost găsit!" });
  }

  const formGroup = await Group.findOne({ "formulare._id": formID });

  if (formGroup) {
    return response.status(404).json({
      message: `Formularul se află deja într-un grup : ${formGroup.nume}`,
    });
  }

  const form = group.formulare.find(form => form._id.toString() === formID);

  if (form) {
    return response
      .status(400)
      .json({ message: "Acest formular se află deja în grup!" });
  }

  group.formulare.push({ _id: formID });
  await group.save();

  return response
    .status(200)
    .json({ message: "Formularul a fost adaugat cu succes!" });
});

// @desc    Sterge formular grup
// @route   DELETE /api/groups/:id/forms/:formID
// @access  Private/Group admin
const removeGroupForm = asyncHandler(async (request, response) => {
  const group = request.group;
  const formID = request.params.formID;

  if (!formID) {
    return response
      .status(400)
      .json({ message: "Introduceti un formular valid!" });
  }

  const isValidForm = await Form.findById(formID);

  if (!isValidForm) {
    return response
      .status(404)
      .json({ message: "Formularul nu a fost găsit!" });
  }

  const formIndex = group.formulare.findIndex(
    form => form._id.toString() === formID
  );

  if (formIndex === -1) {
    return response
      .status(400)
      .json({ message: "Acest formular nu se află în grup!" });
  }

  group.formulare.splice(formIndex, 1);
  await group.save();

  return response
    .status(200)
    .json({ message: "Formularul a fost șters cu succes!" });
});

export {
  findGroupID,
  checkGroupUser,
  updateGroupTitle,
  groupAdmin,
  createGroup,
  deleteGroup,
  removeUser,
  getGroupUsers,
  addUser,
  getGroupAdmins,
  setGroupAdmin,
  getGroupForms,
  addGroupForm,
  removeGroupForm,
};
