import Form from "../models/formularModel.js";
import Group from "../models/grupModel.js";
import User from "../models/utilizatorModel.js";
import FormAnswers from "../models/raspunsuriModel.js";
import asyncHandler from "express-async-handler";
import { isNumeric } from "../utils/validators.js";
import formidable from "formidable";
import path from "path";
import fs from "fs";
import mongoose from "mongoose";

// @desc    Obtine formular folosind ID
// @route   GET /api/forms/:id
// @access  Public
const getFormByID = asyncHandler(async (request, response) => {
  const form = await Form.findById(request.params.id);

  if (!form) {
    response.status(401);
    throw new Error("Formularul nu a fost gasit");
  }

  return response.json(form);
});

// @desc    Obtine formular folosind ID
// @route   DELETE /api/forms/:id
// @access  Private/Admin Group/Admin Site
const deleteForm = asyncHandler(async (request, response) => {
  const form = await Form.findById(request.params.id);

  if (!form) {
    response.status(401);
    throw new Error("Formularul nu a fost gasit");
  }

  await form.remove();
  return response.json({ message: "Formularul a fost sters cu succes" });
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

  const utilizator = request.user._id;

  if (!utilizator) {
    response.status(401);
    throw new Error("Trebuie să fii logat pentru a crea un formular");
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
    utilizator: utilizator,
    intrebari: {
      titlu: "Titlul intrebarii",
      tip: "Caseta de selectare",
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
  const form = await Form.findById(request.params.id);

  if (!form) {
    response.status(404);
    throw new Error("Formularul nu a fost gasit");
  }

  const question = request.body.intrebare;

  if (!question) {
    return response.status(401).json({ message: "Intrebare invalidă!" });
  }

  if (!question.titlu) {
    return response
      .status(401)
      .json({ message: "Intrebare trebuie să conțină un titlu valid!" });
  }

  if (!question.tip) {
    return response
      .status(401)
      .json({ message: "Intrebare trebuie să conțină un tip valid!" });
  }

  const questionTypes = [
    "Caseta de selectare",
    "Incarcare fisier",
    "Buton radio",
    "Raspuns text",
  ];

  if (!questionTypes.includes(question.tip.trim())) {
    return response.status(401).json({
      message: `Intrebare trebuie să conțina un tip valid ${questionTypes.join(
        " , "
      )}!`,
    });
  }

  form.intrebari.push(question);
  const updatedForm = await form.save();
  return response
    .status(201)
    .json({
      intrebare: updatedForm.intrebari[updatedForm.intrebari.length - 1],
    });
});

// @desc    Actualizeaza intrebarea formularului
// @route   PUT /api/forms/:id/questions/:question_id
// @access  Private/Admin Group
const updateQuestion = asyncHandler(async (request, response) => {
  const form = await Form.findById(request.params.id);
  const question = request.body.intrebare;

  if (!form) {
    response.status(404);
    throw new Error("Formularul nu a fost gasit");
  }

  const questionIndex = form.intrebari.findIndex(
    intrebare => intrebare._id.toString() === request.params.questionID
  );

  if (questionIndex === -1) {
    return response.status(401).json({ message: "Intrebarea nu exista" });
  }

  if (form.utilizator.toString() !== request.user._id.toString()) {
    return response.status(401).json({ message: "Utilizator neautorizat" });
  }

  const questionDB = form.intrebari[questionIndex];
  questionDB.titlu = question.titlu;
  questionDB.tip = question.tip;
  questionDB.obligatoriu = question.obligatoriu || false;
  questionDB.raspunsuri = question.raspunsuri;

  if (
    question.atribute &&
    question.atribute.punctaj &&
    isNaN(question.atribute.punctaj)
  ) {
    return response
      .status(401)
      .json({ message: "Punctajul trebuie să fie un număr !" });
  }

  question.atribute.punctaj = +question.atribute.punctaj;

  if (question.tip === "Caseta de selectare" && question.atribute) {
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
// @route   DELETE /api/forms/:id/questions/:question_id
// @access  Private/Admin Group??
const deleteQuestion = asyncHandler(async (request, response) => {
  const form = await Form.findById(request.params.id);

  if (!form) {
    response.status(404);
    throw new Error("Formularul nu a fost gasit");
  }

  const questionIndex = form.intrebari.findIndex(
    intrebare => intrebare.id === request.params.question_id
  );

  if (questionIndex === -1) {
    return response.status(401).json({ message: "Intrebarea nu exista" });
  }

  if (form.utilizator.toString() !== request.user.id) {
    return response.status(401).json({ message: "Utilizator neautorizat" });
  }

  form.intrebari.splice(questionIndex, 1);
  await form.save();
  return response.json({ message: "Intrebarea a fost stearsa cu success" });
});

// @desc    Trimite raspunsurilor formularului
// @route   POST /api/forms/sendAnswer
// @access  Private
const sendAnswer = asyncHandler(async (request, response) => {
  const files = request.files;
  let { formID, timeLeft } = request.fields;
  console.log(`Object %0 `, request.fields.answers);

  const answers = JSON.parse(request.fields.answers);

  if (!formID || !mongoose.Types.ObjectId.isValid(formID)) {
    response.status(404);
    Object.keys(files).forEach(file => fs.unlink(files[file].path, () => {}));
    return response
      .status(404)
      .json({ errors: ["Formularul nu a fost gasit"] });
  }

  const form = await Form.findById(formID);

  if (!form) {
    response.status(404);
    Object.keys(files).forEach(file => fs.unlink(files[file].path, () => {}));
    return response
      .status(404)
      .json({ errors: ["Formularul nu a fost gasit"] });
  }

  // TODO: replace with object from DB
  const { timpTransmitere: timer } = request.fields;
  const { intrebari: formQuestions } = form;

  console.log(`Timer ${timer}`);

  timeLeft = timer && timeLeft;

  const answerObject = {
    utilizator: request.user._id,
    formular: form._id,
    raspunsuri: [],
  };

  const addResponse = raspuns => {
    answerObject.raspunsuri.push(raspuns);
  };

  const errors = [];
  const addError = (question, error) => {
    errors.push({
      title: question.titlu,
      id: question.id,
      error,
    });
  };

  const verifyQuestions = async () => {
    answers.forEach(question => {
      const { id, tip: questionType } = question;

      if (!id) return;

      if (!questionType) return;

      const questionDB = formQuestions.find(
        questionDB => questionDB._id.toString() === id
      );

      if (!questionDB) return;

      if (questionType === "Incarcare fisier") {
        handleFileUploadQuestion(
          questionDB,
          formID,
          request.user._id.toString(),
          timeLeft,
          files[`${question.id}`],
          addError,
          addResponse
        );
        delete files[`${question.id}`];
        return;
      }

      if (questionType === "Raspuns text") {
        handleTextResponse(
          questionDB,
          timeLeft,
          question.raspuns,
          addError,
          addResponse
        );
        return;
      }

      if (questionType === "Caseta de selectare") {
        handleTextBoxResponse(
          questionDB,
          timeLeft,
          question.raspunsuri,
          addError,
          addResponse
        );
      }
    });
  };

  await verifyQuestions();
  Object.keys(files).forEach(file => fs.unlink(files[file].path, () => {}));

  if (errors.length > 0) {
    console.log(`Errors backend ${JSON.stringify(errors, null, 4)}`);
    return response.status(400).json({ errors: errors });
  }

  console.log(
    `Answer Object `,
    JSON.stringify(answerObject.raspunsuri, null, 10)
  );

  const formAnswer = await FormAnswers.create({
    utilizator: request.user._id,
    formular: form._id,
    raspunsuri: answerObject.raspunsuri,
  });

  return response
    .status(201)
    .json({ answerObject: answerObject, formAnswer: formAnswer._id });
});

const handleFileUploadQuestion = (
  questionDB,
  formID,
  userID,
  timeLeft,
  file,
  addError,
  addResponse
) => {
  const { obligatoriu: isMandatoryQuestion, atribute } = questionDB;

  const hasTime = timeLeft > 5;

  const canAnswer = hasTime || !timeLeft;

  // prezenta atributului timeLeft indica faptul ca exista un timp pentru intrebare

  if (canAnswer && isMandatoryQuestion && !file) {
    addError(
      questionDB,
      `Nu ati transmit un fisier pentru "${questionDB.titlu}"`
    );
    return;
  }

  if (atribute && file && canAnswer) {
    const extension = file.name.split(".")[1];
    const sizeInMb = file.size / 1024 / 1024;
    const {
      tipuriFisierPermise: fileTypes,
      textRaspunsInvalid: invalidAnswer,
      dimensiuneMaximaFisier: maxSize,
    } = atribute;

    const isValidExtension = fileTypes && fileTypes.includes(extension);
    const isValidSize = maxSize && sizeInMb <= maxSize;

    if (!isValidExtension || !isValidSize) {
      addError(questionDB, invalidAnswer);
      fs.unlinkSync(file.path);
      return;
    }
  }

  if (canAnswer && file) {
    const __dirname = path.resolve();
    const oldPath = file.path;
    const newPath = path.join(
      __dirname,
      `../uploads/${formID}/${userID}/${questionDB.id}`
    );

    let errorRename = null;

    fs.mkdirSync(newPath, { recursive: true });

    fs.rename(oldPath, path.join(`${newPath}/${file.name}`), error => {
      if (error) {
        addError(
          questionDB,
          `Server error! Fisierul ${file.name} nu a putut fi incarcat`
        );
        errorRename = error;
        console.error(error);
        return;
      }
    });

    if (errorRename) return;

    addResponse({
      intrebare: questionDB.id,
      fisier: path.join(`${questionDB.id}/${userID}/${file.name}`),
    });
  }
};

const handleTextResponse = (
  questionDB,
  timeLeft,
  answerText,
  addError,
  addResponse
) => {
  const { obligatoriu: isMandatoryQuestion, atribute } = questionDB;

  const { titlu: questionTitle } = questionDB;

  const hasTime = timeLeft > 5;

  const canAnswer = hasTime || !timeLeft;

  if (canAnswer && isMandatoryQuestion && !answerText) {
    addError(
      questionDB,
      `Nu ati transmit un raspuns pentru "${questionTitle}"`
    );
    return;
  }

  if (atribute && answerText && canAnswer) {
    const {
      validareRaspuns: answerValidateRegex,
      textRaspunsInvalid: invalidAnswerMessage,
    } = atribute;

    const isValidAnswer = answerText.match(answerValidateRegex);

    if (!isValidAnswer) {
      addError(questionDB, invalidAnswerMessage);
      return;
    }
  }

  if (!answerText) return;

  addResponse({
    intrebare: questionDB.id,
    raspuns: answerText,
  });
};

const handleTextBoxResponse = (
  questionDB,
  timeLeft,
  answers,
  addError,
  addResponse
) => {
  const hasTime = timeLeft > 5;

  const canAnswer = hasTime || !timeLeft;

  const isAnswer = answers.length > 0;

  let { obligatoriu: isMandatoryQuestion, atribute } = questionDB;

  if (canAnswer && isMandatoryQuestion && !isAnswer) {
    addError(
      questionDB,
      `Intrebare obligatorie! Nu ati oferit un raspuns pentru "${questionDB.titlu}"`
    );
    return;
  }

  if (atribute && atribute.validareRaspuns && canAnswer && isAnswer) {
    const {
      selectareExacta: exactSelection,
      selectareMinima: minSelection,
      textRaspunsInvalid: invalidAnswerMessage,
    } = atribute.validareRaspuns;

    const isExactSelection = answers.length === exactSelection;
    const isMinSelection = answers.length >= minSelection;

    console.log(
      `Exact selection ${questionDB.titlu} ${exactSelection} ${
        answers.length === exactSelection
      } ${isExactSelection}`
    );
    console.log(
      `Min selection ${questionDB.titlu} ${minSelection} ${
        answers.length >= minSelection
      } ${isMinSelection}`
    );

    if (exactSelection && !isExactSelection) {
      addError(questionDB, invalidAnswerMessage);
      return;
    }

    if (minSelection && !isMinSelection) {
      addError(questionDB, invalidAnswerMessage);
      return;
    }
  }

  console.log(`Intrebare ${questionDB.titlu}`);
  console.log(`Is answer = ${isAnswer}`);
  if (!isAnswer) return;

  addResponse({
    intrebare: questionDB.id,
    raspunsuri: answers,
  });
};

export {
  getFormByID,
  createForm,
  deleteForm,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  sendAnswer,
};
