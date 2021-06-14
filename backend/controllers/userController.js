import User from "../models/utilizatorModel.js";
import Group from "../models/grupModel.js";
import Form from "../models/formularModel.js";
import asyncHandler from "express-async-handler";
import generateToken from "../utils/generateToken.js";
import FormResponses from "../models/raspunsuriModel.js";
import sgMail from "@sendgrid/mail";
import crypto from "crypto";

const sendMailResetEmail = asyncHandler(async (request, response) => {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  const msg = {
    to: "marius.nikusor2015@gmail.com", // Change to your recipient
    from: "stere.marius99@gmail.com", // Change to your verified sender
    subject: "Sending with SendGrid is Fun",
    text: "and easy to do anywhere, even with Node.js",
    html: "<strong>and easy to do anywhere, even with Node.js</strong>",
  };
  sgMail
    .send(msg)
    .then(() => {
      response.status(201).json({ message: "Email sent" });
      console.log("Email sent");
    })
    .catch(error => {
      console.error(error);
      response.status(400).json({ error: error });
    });
});

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

  // const passwordRegex = new RegExp("^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})");

  // if(!passwordRegex.test()){

  //   return;
  // }

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

  console.log(`Date invalide`);
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

// @desc    Obtine utilizator folosind ID
// @route   POST /api/users/:id
// @access  Public
const searchUser = asyncHandler(async (request, response) => {
  const { email } = request.query;

  const user = await User.find({
    email: new RegExp(`.*${email}.*`, "ig"),
  }).select({ email: 1 });

  if (user) {
    return response.json(user);
  }
  response.status(404);
  throw new Error(`Utilizatorul nu a fost gasit`);
});

// @desc    Actualizeaza email utilizatorului
// @route   PUT /api/users/profile/email
// @access  Private/Admin
const updateUserEmail = asyncHandler(async (request, response) => {
  const user = await User.findById(request.user._id).select("-parola");

  if (!user) {
    response.status(404);
    throw new Error(
      `Utilizatorul cu id-ul ${request.user._id} nu a fost gasit`
    );
  }

  const { resetToken, email } = request.body;

  if (resetToken !== user.tokenSchimbareEmail) {
    user.tokenSchimbareEmail = undefined;
    user.expirareSchimbareEmail = undefined;
    user.save();
    response.status(400);
    throw new Error(
      `Link-ul de confirmare este invalid! Pentru a genera un nou link, schimbați adresa de email!`
    );
  }

  if (new Date(user.expirareSchimbareEmail) < Date.now()) {
    user.tokenSchimbareEmail = undefined;
    user.expirareSchimbareEmail = undefined;
    user.save();
    response.status(400);
    throw new Error(`Link-ul a expirat!`);
  }

  const isAlreadyEmail = await User.findOne({
    email: email.trim(),
  });

  if (isAlreadyEmail) {
    response.status(400);
    throw new Error(`Adresa de email ${email} este asociată altui cont!`);
  }

  user.email = email;
  user.tokenSchimbareEmail = undefined;
  user.expirareSchimbareEmail = undefined;
  const updatedUser = await user.save();

  return response.json({
    _id: updatedUser._id,
    nume: updatedUser.nume,
    prenume: updatedUser.prenume,
    email: updatedUser.email,
    token: generateToken(updatedUser._id),
  });
});

// @desc    Actualizeaza profilul utilizatorului
// @route   PUT /api/users/profile
// @access  Private/Admin
const updateUserProfile = asyncHandler(async (request, response) => {
  const user = await User.findById(request.user._id).select("-parola");

  if (!user) {
    response.status(404);
    throw new Error(
      `Utilizatorul cu id-ul ${request.user._id} nu a fost gasit`
    );
  }
  const { nume, prenume, email } = request.body;
  user.nume = nume || user.nume;
  user.prenume = prenume || user.prenume;

  const isEmailChanged = email && user.email.trim() !== email.trim();

  console.log(`Am primit email ${email.trim()}`);
  console.log(`Email curent ${user.email.trim()}`);
  console.log(`isEmailChanged ${isEmailChanged}`);

  if (isEmailChanged) {
    const isAlreadyEmail = await User.findOne({
      email: email.trim(),
    });

    if (isAlreadyEmail) {
      response.status(400);
      throw new Error(`Adresa de email ${email} este asociată altui cont!`);
    }

    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    const tokenSchimbareEmail = crypto.randomBytes(20).toString("hex");
    user.tokenSchimbareEmail = tokenSchimbareEmail;
    user.expirareSchimbareEmail = Date.now() + 600000;
    const msg = {
      to: user.email,
      from: "stere.marius99@gmail.com",
      subject: "Confirmare schimbare adresa email",
      html: `
      <strong>
      Adresa dumneavoastră de email a fost schimbată.
      <br>Pentru a confirma accesați localhost:3000/?resetEmailToken=${tokenSchimbareEmail}&email=${email.trim()}
      <br>Acest link este valabil 10 minute!
      </strong>
      `,
    };
    sgMail.send(msg);
  }

  const updatedUser = await user.save();

  return response.json({
    user: {
      _id: updatedUser._id,
      nume: updatedUser.nume,
      prenume: updatedUser.prenume,
      email: updatedUser.email,
      token: generateToken(updatedUser._id),
    },
    message: isEmailChanged
      ? "Confirmati schimbarea adresei de email folosind link-ul transmis pe adresa de email asociată contului dvs!"
      : undefined,
  });
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
    "utilizatori.utilizatorID": `${request.user._id}`,
  });

  return response.json(groups);
});

// @desc    Obtine formularele utilizatorului
// @route   GET /api/users/forms
// @access  Private
const getUserForms = asyncHandler(async (request, response) => {
  const user = await User.findById(request.user._id);

  if (!user) {
    response.status(404);
    throw new Error("Utilizatorul nu a fost gasit");
  }

  let forms = await Form.find({ utilizator: `${request.user._id}` });

  forms = await Promise.all(
    forms.map(async form => {
      const formAnswers = await FormResponses.countDocuments({
        formular: form._id,
      });

      return {
        _id: form._id,
        titlu: form.titlu,
        raspunsuri: formAnswers,
        intrebari: form.intrebari.length,
        createdAt: form.createdAt,
        utilizator: form.utilizator,
      };
    })
  );

  return response.json(forms);
});

export {
  authUser,
  registerUser,
  getUserByID,
  searchUser,
  updateUserProfile,
  deleteUser,
  getUsers,
  getUserProfile,
  getUserGroups,
  getUserForms,
  sendMailResetEmail,
  updateUserEmail,
};
