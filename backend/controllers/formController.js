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
  idValidDate,
} from "../utils/validators.js";
import path from "path";
import fs from "fs";
import mongoose from "mongoose";
import { arraysHaveSaveValues, shuffleArray } from "../utils/utilities.js";
import {
  RADIO_BUTTON_QUESTION,
  CHECKBOX_QUESTION,
  SHORT_TEXT_QUESTION,
  FILE_UPLOAD,
  PARAGRAPH_QUESTION,
} from "../utils/questionTypesConstants.js";
import sgMail from "@sendgrid/mail";

// @desc    Verifică ID-ul formularului și-l pune în obiectul request
const findFormID = asyncHandler(async (request, response, next) => {
  if (!mongoose.Types.ObjectId.isValid(request.params.id)) {
    response.status(404);
    throw new Error("Formularul nu a fost gasit!");
  }

  const form = await Form.findById(request.params.id);

  if (!form) {
    response.status(404);
    throw new Error("Formularul nu a fost gasit");
  }

  request.form = form;
  next();
});

// @desc    Verifică creatorul formularului
const checkFormAdmin = asyncHandler(async (request, response, next) => {
  if (request.form.utilizator.toString() !== request.user.id) {
    response.status(401);
    throw new Error(
      "Utilizator neautorizat! Nu sunteti creatorul acestui formular!"
    );
  }

  next();
});

// @desc    Obtine formular folosind ID
// @route   GET /api/forms/:id
// @access  Public
const getFormByID = asyncHandler(async (request, response) => {
  return response.json(request.form);
});

// @desc    Obtine formular folosind ID
// @route   GET /api/forms/:id/view
// @access  Public
const getFormView = asyncHandler(async (request, response) => {
  const formGroup = await Group.findOne({ "formulare._id": request.form._id });

  if (
    formGroup &&
    !formGroup.utilizatori.some(
      user => user.utilizatorID.toString() === request.user._id.toString()
    )
  ) {
    response.status(401);
    throw new Error(
      "Formularul se află într-un grup din care nu faceți parte!"
    );
  }

  request.form.intrebari.forEach(question => {
    const type = question.tip;
    const isBoxQuestion =
      type === RADIO_BUTTON_QUESTION || type === CHECKBOX_QUESTION;
    const attributes = question.atribute;

    if (isBoxQuestion) {
      question.raspunsuri = question.raspunsuri.map(answer => ({
        ...answer.toObject(),
        atribute: undefined,
      }));

      if (attributes && attributes.afisareRaspunsuriOrdineAleatorie) {
        console.log(`Am dat shuffle la array`);
        shuffleArray(question.raspunsuri);
      }
    }

    if (question.tip === SHORT_TEXT_QUESTION) {
      question.raspunsuri = [];
    }
  });

  return response.json(request.form);
});

// @desc    Obtine formular folosind ID
// @route   DELETE /api/forms/:id
// @access  Private/Admin Group/Admin Site
const deleteForm = asyncHandler(async (request, response) => {
  await request.form.deleteOne();
  return response
    .status(201)
    .json({ message: "Formularul a fost sters cu succes" });
});

// @desc    Actulizeaza atributele formularului
// @route   PUT /api/forms/:id
// @access  Private
const updateForm = asyncHandler(async (request, response) => {
  const form = request.form;

  const {
    titlu: title,
    raspunsuriMultipleUtilizator: multipleAnswers,
    dataValiditate: validDate,
    dataExpirare: expireDate,
    timpTransmitere: time,
  } = request.body;

  if (title) {
    form.titlu = title;
  }

  if (time && isNaN(time)) {
    response.status(401);
    throw new Error(
      "Timpul transmiterii formularului trebuie să fie un număr!"
    );
  }

  if (validDate && !isValidDate(validDate)) {
    response.status(401);
    throw new Error("Data validitate invalida!");
  }

  if (expireDate && !isValidDate(expireDate)) {
    response.status(401);
    throw new Error("Data expirare invalida!");
  }

  form.timpTransmitere = time ? +time : undefined;
  form.dataValiditate = validDate ? new Date(validDate) : undefined;
  form.expireDate = expireDate ? new Date(expireDate) : undefined;
  form.raspunsuriMultipleUtilizator = multipleAnswers
    ? multipleAnswers
    : undefined;

  await form.save();

  return response.json({ message: "Formularul a fost actualizat cu succes" });
});

// @desc    Verifica daca un utilizator mai poate trimite raspunsuri unui formular
// @route   GET /api/forms/:id/canAnswer
// @access  Private
const userCanAnswer = asyncHandler(async (request, response, next) => {
  const answers = await FormResponses.find({
    utilizator: request.user._id,
    formular: request.form.id,
  });

  if (!request.form.raspunsuriMultipleUtilizator && answers) {
    response.status(403);
    throw new Error(
      "Ați oferit deja un răspuns la acest formular! Acest formular nu permite raspunsuri multiple!"
    );
  }

  next();
});

// @desc    Creeaza formular
// @route   PUT /api/forms/
// @access  Private/Admin Group
const createForm = asyncHandler(async (request, response) => {
  const formGroup = request.body.grup;
  const titlu = request.body.titlu;

  if (!titlu) {
    response.status(401);
    throw new Error("Formularul trebuie să aibă un titlu");
  }

  let group;

  if (formGroup) {
    group = await Group.findById(formGroup);

    if (!group) {
      response.status(404);
      throw new Error("Grupul atribuit formularului nu exista");
    }

    const esteAdministrator = group.utilizatori.find(
      r =>
        r._id.toString() === request.user._id.toString() && r.esteAdministrator
    );

    if (!esteAdministrator) {
      response.status(401);
      throw new Error(
        "Trebuie sa fii administrator pentru a atribut un formular grupului"
      );
    }
  }

  const createdForm = await Form.create({
    utilizator: request.user._id,
    intrebari: {
      titlu: "Titlul intrebarii",
      tip: CHECKBOX_QUESTION,
    },
    titlu: titlu,
  });

  if (group) {
    group.formulare.push(createdForm._id);
    await group.save();
  }

  if (createdForm) {
    return response.status(201).json({
      id: createdForm._id,
      utilizator,
      titlu,
    });
  }

  response.status(400);
  throw new Error("Date invalide");
});

// @desc    Actualizeaza intrebarile formularului
// @route   PUT /api/forms/:id/questions
// @access  Private
const createQuestion = asyncHandler(async (request, response) => {
  const form = request.form;

  const { titlu: title, tip: type } = request.body;

  console.log(`Am primit în body ${title} ${type}`);

  if (!title) {
    return response
      .status(401)
      .json({ message: "Intrebare trebuie să conțină un titlu valid!" });
  }

  if (!type) {
    return response
      .status(401)
      .json({ message: "Intrebare trebuie să conțină un tip valid!" });
  }

  const questionTypes = [
    CHECKBOX_QUESTION,
    FILE_UPLOAD,
    RADIO_BUTTON_QUESTION,
    SHORT_TEXT_QUESTION,
    PARAGRAPH_QUESTION,
  ];

  if (!questionTypes.includes(type.trim())) {
    return response.status(401).json({
      message: `Intrebare trebuie să conțina un tip valid ${questionTypes.join(
        " , "
      )}!`,
    });
  }

  form.intrebari.push({
    titlu: title,
    tip: type,
  });
  const updatedForm = await form.save();
  return response
    .status(201)
    .json(updatedForm.intrebari[updatedForm.intrebari.length - 1]);
});

// @desc    Actualizeaza intrebarea formularului
// @route   PUT /api/forms/:id/questions/:question_id
// @access  Private/Admin Group
const updateQuestion = asyncHandler(async (request, response) => {
  const form = request.form;
  const question = request.body.intrebare;

  const questionIndex = form.intrebari.findIndex(
    intrebare => intrebare._id.toString() === request.params.questionID
  );

  if (questionIndex === -1) {
    return response.status(401).json({ message: "Intrebarea nu exista" });
  }

  const questionDB = form.intrebari[questionIndex];
  questionDB.titlu = question.titlu;
  questionDB.tip = question.tip;
  questionDB.obligatoriu = question.obligatoriu || false;
  questionDB.raspunsuri = question.raspunsuri;

  if (question.punctaj && !/^[0-9]+$/.test(+question.punctaj)) {
    return response
      .status(401)
      .json({ message: "Punctajul trebuie să fie un număr !" });
  }

  questionDB.punctaj = +question.punctaj;

  if (
    question.tip === RADIO_BUTTON_QUESTION &&
    question.raspunsuri.filter(question => question.atribute?.raspunsCorect)
      .length > 1
  ) {
    return response.status(401).json({
      message:
        "O întrebare de tip radio nu poate avea mai mult de un răspuns corect!",
    });
  }

  if (question.tip === CHECKBOX_QUESTION && question.atribute) {
    const attributes = question.atribute;
    const answerValidation = attributes.validareRaspuns || {};

    if (!answerValidation) return;

    const exactSelection = answerValidation.selectareExacta;
    const minSelection = answerValidation.selectareMinima;
    const invalidAnswerText = answerValidation.textRaspunsInvalid;

    if (exactSelection && minSelection) {
      return response.status(401).json({
        message:
          "Selectarea exactă și selectarea minimă nu pot exista simultan!",
      });
    }

    if (exactSelection && isNaN(exactSelection)) {
      return response
        .status(401)
        .json({ message: "Format invalid al numărului de selecții exacte !" });
    }

    if (minSelection && isNaN(minSelection)) {
      return response
        .status(401)
        .json({ message: "Format invalid al numărului de selecții minime !" });
    }

    if ((exactSelection || minSelection) && !invalidAnswerText) {
      return response
        .status(401)
        .json({ message: "Textul raspunsului invalid este vid !" });
    }

    if (minSelection) {
      delete question.atribute.validareRaspuns.selectareExacta;
      answerValidation.selectareMinima = +minSelection;
    }

    if (exactSelection) {
      delete question.atribute.validareRaspuns.selectareMinima;
      answerValidation.selectareExacta = +exactSelection;
    }
  }

  questionDB.atribute = question.atribute || {};
  questionDB.imagine = question.imagine || "";

  const updatedForm = await form.save();

  return response.status(201).json(updatedForm.intrebari[questionIndex]);
});

// @desc    Sterge intrebarea formularului
// @route   DELETE /api/forms/:id/questions
// @access  Private
const deleteQuestion = asyncHandler(async (request, response) => {
  const form = request.form;

  const questionID = request.params.questionID;

  const questionIndex = form.intrebari.findIndex(
    intrebare => intrebare._id.toString() === questionID
  );

  if (questionIndex === -1) {
    response.status(401);
    throw new Error("Intrebarea nu a fost gasita");
  }

  form.intrebari.splice(questionIndex, 1);
  await form.save();
  return response
    .status(201)
    .json({ message: "Intrebarea a fost stearsa cu success" });
});

// @desc    Descarcă fișierul atașat răspunsului
// @route   GET /api/forms/:id/answers/:answerID/:questionID/downloadFile
// @access  Private
const downloadFile = asyncHandler(async (request, response) => {
  const form = request.form;

  if (!request.params.answerID) {
    return response.status(404).json({ message: `Acest raspuns nu exista!` });
  }

  if (!mongoose.Types.ObjectId.isValid(request.params.answerID)) {
    return response.status(404).json({ message: `Acest raspuns nu exista!` });
  }

  const formResponse = await FormResponses.findOne({
    formular: request.params.id,
    _id: request.params.answerID,
  });

  if (!formResponse) {
    return response.status(404).json({
      message: `Raspunsul cu ID-ul ${request.params.answerID} nu a fost gasit`,
    });
  }

  if (
    form.utilizator._id.toString() !== request.user._id.toString() &&
    formResponse.utilizator.toString() !== request.user._id.toString()
  ) {
    return response.status(401).json({
      message: `Utilizator neautorizat! Numai deținătorul formularului sau cel care a încărcat fișierul au permisiunea de a-l descărca!`,
    });
  }

  const question = formResponse.raspunsuri.find(
    q => q.intrebare.toString() === request.params.questionID
  );

  if (!question) {
    return response
      .status(404)
      .json({ message: `Întrebarea nu a fost găsită!` });
  }

  if (!question.fisier) {
    return response
      .status(404)
      .json({ message: `Întrebarea nu conține un fișier atașat!` });
  }

  const __dirname = path.resolve();
  const filePath = path.join(__dirname, `../uploads/${question.fisier}`);

  console.log(`File path is ${filePath}`);
  if (!fs.existsSync(filePath)) {
    return response.status(404).json({ message: `Fisierul nu a fost găsit!` });
  }

  return response.status(201).download(filePath);
});

export {
  createForm,
  getFormByID,
  getFormView,
  updateForm,
  deleteForm,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  downloadFile,
  findFormID,
  checkFormAdmin,
  userCanAnswer,
};
