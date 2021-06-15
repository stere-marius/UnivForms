import User from "../models/utilizatorModel.js";
import Group from "../models/grupModel.js";
import Form from "../models/formularModel.js";
import asyncHandler from "express-async-handler";
import generateToken from "../utils/generateToken.js";
import FormResponses from "../models/raspunsuriModel.js";
import sgMail from "@sendgrid/mail";
import crypto from "crypto";

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

// @desc    Schimba parola utilizatorului
// @route   PUT /api/users/profile/changePassword
// @access  Private/Admin
const generatePasswordResetLink = asyncHandler(async (request, response) => {
  const { email } = request.body;

  if (!email) {
    response.status(404);
    throw new Error(`Adresa de email nu trebuie să fie vidă!`);
  }

  const user = await User.findOne({ email: email }).select("-parola");

  if (!user) {
    response.status(404);
    throw new Error(`Nu exista un utilizator cu aceasta adresa de email`);
  }

  if (
    user.tokenResetareParola &&
    new Date(user.expirareResetareParola) > Date.now()
  ) {
    response.status(400);
    throw new Error(
      `Link-ul pentru resetarea parola a fost deja generat! Verificați mesajele inbox sau spam!`
    );
  }

  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  const tokenResetareParola = crypto.randomBytes(20).toString("hex");
  user.tokenResetareParola = tokenResetareParola;
  user.expirareResetareParola = Date.now() + 600000;
  const siteURL = request.protocol + "://" + request.hostname;
  const msg = {
    to: user.email,
    from: process.env.SENDGRID_EMAIL,
    subject: "Confirmare schimbare parola",
    html: `
      <div
        style="border-radius: 16px, margin-top: 4rem, background-color: #FFF, padding-bottom: 1rem"
      >
        <div style="display: flex, flex-direction: column">
          <h4 style="text-align='center'"> Link schimbare parola </h4>

        <table cellspacing="0" cellpadding="0">
          <tr>
            <td align="center" width="150" height="40" bgcolor="#01df9b" style="-webkit-border-radius: 5px; -moz-border-radius: 5px; border-radius: 5px; color: #000; display: block;">
            <a target="_blank" href="${siteURL}/?resetPasswordToken=${tokenResetareParola}&email=${email}" style="font-size:16px; font-family: Montserrat, Helvetica, Arial, sans-serif; text-decoration: none; line-height:40px; width:100%; display:inline-block">
            <span style="color: #000">
            Accesati link
            </span>
            </a>
            </td>
          </tr>
        </table>


          <p>Acest link este valabil 10 minute!</p>
        </div>
        
      </div>
      `,
  };
  await user.save();
  sgMail.send(msg);
  return response.status(200).json({
    message:
      "Un link de schimbare al parolei a fost trimis pe adresa dvs de email!",
  });
});

// @desc    Actualizeaza parola utilizatorului
// @route   PUT /api/users/profile/password
// @access  Private/Admin
const updateUserPassword = asyncHandler(async (request, response) => {
  const { resetToken, newPassword, email } = request.body;

  if (!newPassword) {
    response.status(400);
    throw new Error(`Noua parola nu trebuie să fie vidă!`);
  }

  if (newPassword.length < 8) {
    response.status(400);
    throw new Error(`Noua parola trebuie să fie mai lungă de 7 caractere!`);
  }

  const user = await User.findOne({ email }).select("-parola");

  if (!user) {
    response.status(404);
    throw new Error(`Utilizatorul cu adresa de email ${email} nu exista!`);
  }

  if (new Date(user.expirareResetareParola) < Date.now()) {
    user.tokenResetareParola = undefined;
    user.expirareResetareParola = undefined;
    user.save();
    response.status(400);
    throw new Error(`Link-ul a expirat!`);
  }

  if (resetToken.trim() !== user.tokenResetareParola) {
    user.tokenResetareParola = undefined;
    user.expirareResetareParola = undefined;
    user.save();
    response.status(400);
    throw new Error(
      `Link-ul de confirmare este invalid! Generați un nou link de resetare al parolei!`
    );
  }

  user.parola = newPassword;
  await user.save();
  return response
    .status(200)
    .json({ message: "Parola a fost schimbată cu succes!" });
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

  if (isEmailChanged) {
    if (
      user.tokenSchimbareEmail &&
      new Date(user.expirareSchimbareEmail) > Date.now()
    ) {
      response.status(400);
      throw new Error(
        `Link-ul pentru schimbarea adresei de email a fost deja generat! Verificați mesajele inbox sau spam!`
      );
    }

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
    const siteURL = request.protocol + "://" + request.hostname;
    const msg = {
      to: user.email,
      from: process.env.SENDGRID_EMAIL,
      subject: "Confirmare schimbare adresa email",
      html: `

      <div
        style="border-radius: 16px, margin-top: 4rem, background-color: #FFF, padding-bottom: 1rem"
      >
        <div style="display: flex, flex-direction: column">
          <h4 style="text-align='center'"> Link schimbare email </h4>

        <table cellspacing="0" cellpadding="0">
          <tr>
            <td align="center" width="150" height="40" bgcolor="#01df9b" style="-webkit-border-radius: 5px; -moz-border-radius: 5px; border-radius: 5px; color: #000; display: block;">
            <a target="_blank" href="${siteURL}/?resetEmailToken=${tokenSchimbareEmail}&email=${email.trim()}" style="font-size:16px; font-family: Montserrat, Helvetica, Arial, sans-serif; text-decoration: none; line-height:40px; width:100%; display:inline-block">
            <span style="color: #000">
            Accesati link
            </span>
            </a>
            </td>
          </tr>
        </table>


          <p>Acest link este valabil 10 minute!</p>
        </div>
        
      </div>
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
  updateUserEmail,
  generatePasswordResetLink,
  updateUserPassword,
};
