import User from "../models/utilizatorModel.js";
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

export { authUser, registerUser };
