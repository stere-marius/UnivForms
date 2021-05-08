import User from "../models/utilizatorModel.js";
import Group from "../models/grupModel.js";
import Form from "../models/formularModel.js";
import asyncHandler from "express-async-handler";
import generateToken from "../utils/generateToken.js";

// @desc    Logheaza utilizator & obtine token
// @route   POST /api/users/login
// @access  Public
const authUser = asyncHandler(async (request, response) => {
  const { email, parola } = request.body;
  const user = await User.findOne({ email });
  if (user && (await user.matchPassword(parola))) {
    return response.json({
      _id: user._id,
      nume: user.nume,
      prenume: user.prenume,
      email: user.email,
      esteAdministrator: user.esteAdministrator,
      token: generateToken(user._id),
    });
  }

  console.log("Eroare");
  response.status(401);
  throw new Error("Email sau parola invalide");
});

// @desc    Inregistreaza utilizator
// @route   POST /api/users
// @access  Public
const registerUser = asyncHandler(async (request, response) => {
  const { nume, prenume, email, parola } = request.body;
  const userExists = await User.findOne({ email });

  if (userExists) {
    response.status(400);
    throw new Error("Utilizator deja existent");
  }

  const user = await User.create({
    nume,
    prenume,
    email,
    parola,
  });

  if (user) {
    return response.status(201).json({
      _id: user._id,
      nume: user.nume,
      prenume: user.prenume,
      email: user.email,
      esteAdministrator: user.esteAdministrator,
      token: generateToken(user._id),
    });
  }

  response.status(400);
  throw new Error("Date invalide");
});

// @desc    Obtine utilizator folosind ID
// @route   POST /api/users/:id
// @access  Public
const getUserByID = asyncHandler(async (request, response) => {
  const user = await User.findById(request.params.id).select("-parola");
  if (user) {
    return response.json(user);
  }
  response.status(404);
  throw new Error(`Utilizatorul cu id-ul ${request.params.id} nu a fost gasit`);
});

// @desc    Actualizeaza profilul utilizatorului
// @route   PUT /api/users/profile
// @access  Private/Admin
const updateUserProfile = asyncHandler(async (request, response) => {
  const user = await User.findById(request.params.id).select("-parola");
  if (user) {
    user.nume = request.body.nume || user.nume;
    user.prenume = request.body.prenume || user.prenume;
    user.email = request.body.email || user.email;
    user.esteAdministrator = request.body.esteAdministrator;

    if (request.body.password) {
      user.password = request.body.password;
    }

    const updatedUser = await user.save();

    return response.json({
      _id: updatedUser._id,
      nume: updatedUser.nume,
      prenume: updatedUser.prenume,
      email: updatedUser.email,
      esteAdministrator: updatedUser.esteAdministrator,
      token: generateToken(updatedUser._id),
    });
  }

  response.status(404);
  throw new Error(`Utilizatorul cu id-ul ${request.params.id} nu a fost gasit`);
});

// @desc    Obtine profilul utilizatorului
// @route   DELETE /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (request, response) => {
  const user = await User.findById(request.user._id);
  if (user) {
    return response.json({
      _id: user._id,
      nume: user.nume,
      prenume: user.prenume,
      email: user.email,
      esteAdministrator: user.esteAdministrator,
    });
  }
  response.status(404);
  throw new Error("Utilizatorul nu a fost gasit");
});

// @desc    Sterge utilizator folosind ID
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (request, response) => {
  const user = await User.findById(request.params.id);

  if (user) {
    await user.remove();
    response.json({ message: "Utilizatorul a fost sters" });
  } else {
    response.status(404);
    throw new Error(
      `Utilizatorul cu id-ul ${request.params.id} nu a fost gasit`
    );
  }
});

// @desc    Obtine utilizator folosind ID
// @route   GET /api/users/
// @access  Public
const getUsers = asyncHandler(async (request, response) => {
  const users = await User.find();
  return response.json(users);
});

// @desc    Obtine grupurile utilizatorului
// @route   GET /api/users/groups
// @access  Private
const getUserGroups = asyncHandler(async (request, response) => {
  const user = await User.findById(request.user._id);

  if (!user) {
    response.status(404);
    throw new Error("Utilizatorul nu a fost gasit");
  }

  const groups = await Group.find({
    "utilizatori._id": `${request.user._id}`,
  });

  return response.json(groups);
});

// @desc    Obtine formularele utilizatorului
// @route   GET /api/users/groups
// @access  Private
const getUserForms = asyncHandler(async (request, response) => {
  const user = await User.findById(request.user._id);

  if (!user) {
    response.status(404);
    throw new Error("Utilizatorul nu a fost gasit");
  }

  const forms = await Form.find({ utilizator: `${request.user._id}` });

  return response.json(forms);
});

export {
  authUser,
  registerUser,
  getUserByID,
  updateUserProfile,
  deleteUser,
  getUsers,
  getUserProfile,
  getUserGroups,
  getUserForms,
};
