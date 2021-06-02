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
import path from "path";
import fs from "fs";
import mongoose from "mongoose";
import { arraysHaveSaveValues } from "../utils/utilities.js";

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

// @desc    Actulizeaza atributele formularului
// @route   PUT /api/forms/:id
// @access  Private
const updateForm = asyncHandler(async (request, response) => {
  const form = await Form.findById(request.params.id);

  if (!form) {
    response.status(401);
    throw new Error("Formularul nu a fost gasit");
  }

  if (form.utilizator._id.toString() !== request.user._id.toString()) {
    response.status(401);
    throw new Error("Nu aveti permisiunea de a edita acest formular!");
  }

  const title = request.body.titlu;
  const multipleAnswers = request.body.raspunsuriMultipleUtilizator;
  let validDate = request.body.dataValiditate;
  let expireDate = request.body.dataExpirare;
  const time = request.body.timpTransmitere;

  if (title) {
    form.titlu = title;
  }

  if (time && isNaN(time)) {
    response.status(401);
    throw new Error(
      "Timpul transmiterii formularului trebuie să fie un număr!"
    );
  }

  if (time) {
    form.timpTransmitere = +time;
  }

  if (multipleAnswers) {
    form.raspunsuriMultipleUtilizator = multipleAnswers;
  }

  if (!validDate) {
  }

  if (validDate) {
    validDate = new Date(validDate);

    if (!(validDate instanceof Date && !isNaN(validDate))) {
      response.status(401);
      throw new Error("Data validitate invalida!");
    }

    form.dataValiditate = validDate;
    console.log(`Am adaugat data validitatea ca fiind ${validDate}`);
  }

  if (expireDate) {
    expireDate = new Date(expireDate);

    if (!(expireDate instanceof Date && !isNaN(expireDate))) {
      response.status(401);
      throw new Error("Data expirare invalida!");
    }

    form.dataExpirare = expireDate;
    console.log(`Am adaugat data validitatea ca fiind ${expireDate}`);
  }

  const updatedForm = await form.save();
  console.log(`Updated form = ${JSON.stringify(updatedForm, null, 2)}`);

  return response.json({ message: "Formularul a fost actualizat cu succes" });
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

  const title = request.body.titlu;
  const type = request.body.tip;

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
    "Caseta de selectare",
    "Incarcare fisier",
    "Buton radio",
    "Raspuns text",
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

  if (question.punctaj && !/^[0-9]+$/.test(+question.punctaj)) {
    return response
      .status(401)
      .json({ message: "Punctajul trebuie să fie un număr !" });
  }

  question.punctaj = +question.punctaj;

  if (
    question.tip === "Buton radio" &&
    question.raspunsuri.filter(question => question.atribute.raspunsCorect)
      .length > 1
  ) {
    return response.status(401).json({
      message:
        "O întrebare de tip radio nu poate avea mai mult de un răspuns corect!",
    });
    return;
  }

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
// @route   DELETE /api/forms/:id/userAnswers
// @access  Private
const getUserAnswers = asyncHandler(async (request, response) => {
  const form = await Form.findById(request.params.id);

  if (!form) {
    response.status(404);
    throw new Error("Formularul nu a fost gasit");
  }

  const user = request.body.utilizator;

  const answers = await FormResponses.find({
    utilizator: user,
    formular: form._id,
  });

  if (!answers) {
    return response.status(201).json({ message: [] });
  }

  return response.status(201).json({ message: answers });
});

// @desc    Sterge intrebarea formularului
// @route   DELETE /api/forms/:id/questions
// @access  Private
const deleteQuestion = asyncHandler(async (request, response) => {
  const form = await Form.findById(request.params.id);

  if (!form) {
    response.status(404);
    throw new Error("Formularul nu a fost gasit");
  }

  const questionID = request.params.questionID;

  const questionIndex = form.intrebari.findIndex(
    intrebare => intrebare._id.toString() === questionID
  );

  if (questionIndex === -1) {
    response.status(401);
    throw new Error("Intrebarea nu a fost gasita");
  }

  if (form.utilizator.toString() !== request.user.id) {
    response.status(401);
    throw new Error(
      "Utilizator neautorizat! Nu sunteti creatorul acestui formular!"
    );
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
  const formID = request.params.id;

  if (!mongoose.Types.ObjectId.isValid(formID)) {
    return response.status(404).json({ message: `Acest formular nu exista!` });
  }

  const form = await Form.findById(formID);

  if (!form) {
    return response.status(404).json({ message: `Acest formular nu exista!` });
  }

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

// @desc    Obtine raspunsurilor formularului
// @route   GET /api/forms/:id/answers/:answerID
// @access  Private
const getSpecificAnswer = asyncHandler(async (request, response) => {
  const formID = request.params.id;

  if (!mongoose.Types.ObjectId.isValid(formID)) {
    response.status(404);
    throw new Error("Acest formular nu exista!");
  }

  const form = await Form.findById(formID);

  if (!form) {
    response.status(404);
    throw new Error("Acest formular nu exista!");
  }

  if (!request.params.answerID) {
    response.status(404);
    throw new Error("Acest raspuns nu exista!");
  }

  if (!mongoose.Types.ObjectId.isValid(request.params.answerID)) {
    response.status(404);
    throw new Error("Acest raspuns nu exista!");
  }

  const formResponse = await FormResponses.findOne({
    formular: request.params.id,
    _id: request.params.answerID,
  });

  if (!formResponse) {
    response.status(404);
    throw new Error(
      `Raspunsul cu ID-ul ${request.params.answerID} nu a fost gasit`
    );
  }

  const questionsID = form.intrebari.map(q => q._id.toString());
  const validAnswers = formResponse.raspunsuri.filter(answer =>
    questionsID.includes(answer.intrebare)
  );

  if (questionsID.length === 0 || validAnswers.length === 0) {
    return response.status(201).json({ raspunsuri: [] });
  }

  const timeLeft =
    form.timpTransmitere && +form.timpTransmitere - +formResponse.timpRamas;

  const questionResponses = [];

  let userScore = 0;
  const totalScore = form.intrebari
    .map(q => q.punctaj || 0)
    .reduce((preValue, currValue) => preValue + currValue, 0);

  validAnswers.forEach(answer => {
    const question = form.intrebari.find(
      q => q._id.toString() === answer.intrebare
    );
    const {
      _id: id,
      tip: type,
      titlu: title,
      raspunsuri: questionAnswers,
      punctaj: questionScore,
    } = question;

    const responseQuestion = {
      id,
      titlu: title,
      punctajIntrebare: questionScore,
      tip: type,
    };

    if (
      (type === "Caseta de selectare" || type === "Buton radio") &&
      answer.raspunsuri
    ) {
      const correctAnswersDB = questionAnswers
        .filter(
          a => a.toObject().atribute && a.toObject().atribute.raspunsCorect
        )
        .map(answer => answer._id);

      const answersUser = [];

      const userAnswers = questionAnswers.map(answerDB => {
        const includes = answer.raspunsuri.includes(answerDB._id.toString());

        const attributes = answerDB.toObject().atribute;
        const isCorrect = attributes && attributes.raspunsCorect;

        if (includes) {
          answersUser.push(answerDB.toObject()._id);
          return {
            id: answerDB._id,
            titlu: answerDB.toObject().titlu,
            esteCorect: isCorrect || false,
          };
        }

        return { id: answerDB._id, titlu: answerDB.toObject().titlu };
      });

      console.log(`${title}`);
      console.log(`answersUser = ${JSON.stringify(answersUser, null, 2)}`);
      console.log(
        `correctAnswersDB = ${JSON.stringify(correctAnswersDB, null, 2)}`
      );
      console.log(
        `arrayEqual = ${arraysHaveSaveValues(answersUser, correctAnswersDB)}`
      );

      responseQuestion.punctajUtilizator = questionScore
        ? arraysHaveSaveValues(answersUser, correctAnswersDB)
          ? questionScore
          : 0
        : undefined;
      userScore += +responseQuestion.punctajUtilizator || 0;
      responseQuestion.raspunsuri = userAnswers;
      questionResponses.push(responseQuestion);

      return;
    }

    if (type === "Raspuns text" && answer.raspuns !== undefined) {
      let userAnswer = answer.raspuns.trim();
      let correctUserAnswer = false;
      // const flags = raspuns.match(/\/[a-z]/);

      for (let answerDB of questionAnswers) {
        const { raspuns, tipRaspuns: answerType } = answerDB.toObject();

        if (answerType === "CONTINE_TEXT" && userAnswer.includes(raspuns)) {
          correctUserAnswer = true;
          break;
        }

        if (answerType === "RASPUNS_EXACT" && userAnswer === raspuns) {
          correctUserAnswer = true;
          break;
        }

        if (
          answerType === "POTRIVESTE_REGEX" &&
          new RegExp(raspuns).test(userAnswer)
        ) {
          correctUserAnswer = true;
          break;
        }
      }

      responseQuestion.punctajUtilizator = questionScore
        ? correctUserAnswer
          ? questionScore
          : 0
        : undefined;
      userScore += +responseQuestion.punctaj || 0;
      responseQuestion.raspuns = answer.raspuns;
      responseQuestion.esteCorect = correctUserAnswer;
      questionResponses.push(responseQuestion);

      return;
    }

    if (type === "Incarcare fisier" && answer.fisier) {
      let correctUserAnswer = false;

      responseQuestion.punctajUtilizator = questionScore
        ? correctUserAnswer
          ? questionScore
          : 0
        : undefined;
      userScore += +responseQuestion.punctaj || 0;
      responseQuestion.caleFisier = answer.fisier;
      responseQuestion.esteCorect = true;
      questionResponses.push(responseQuestion);
    }

    return;
  });

  return response.status(201).json({
    timpRamas: isNaN(timeLeft) ? undefined : timeLeft,
    punctajTotal: totalScore,
    punctajUtilizator: userScore,
    intrebari: questionResponses,
  });
});

// @desc    Obtine raspunsurilor formularului
// @route   GET /api/forms/:id/answers
// @access  Private
const getFormAnswers = asyncHandler(async (request, response) => {
  const formID = request.params.id;

  if (!mongoose.Types.ObjectId.isValid(formID)) {
    response.status(404);
    throw new Error("Acest formular nu exista!");
  }

  const form = await Form.findById(formID);

  if (!form) {
    response.status(404);
    throw new Error("Acest formular nu exista!");
  }

  if (form.utilizator.toString() !== request.user._id.toString()) {
    response.status(401);
    throw new Error("Nu sunteti utilizatorul acestui formular");
  }

  const perPage = request.body.perPagina || 15;
  const page = request.body.pagina || 0;

  const formResponseArray = await FormResponses.find({ formular: form._id })
    .limit(perPage)
    .skip(perPage * page)
    .sort("createdAt");

  if (!formResponseArray || formResponseArray.length === 0) {
    return response.status(201).json({ raspunsuri: [] });
  }

  const responseArray = [];

  await Promise.all(
    formResponseArray.map(async formResponse => {
      // const questionsID = form.intrebari.map(q => q._id.toString());
      // const validAnswers = formResponse.raspunsuri.filter(answer =>
      //   questionsID.includes(answer.intrebare)
      // );

      const user = await User.findById(formResponse.utilizator).select({
        email: 1,
        _id: 1,
        nume: 1,
        prenume: 1,
      });

      if (!user) return;

      const responseObject = {
        id: formResponse._id,
        utilizator: user,
        dataTransmitere: formResponse.createdAt,
        // intrebari: [],
      };

      responseArray.push(responseObject);
      // });
    })
  );

  // formResponseArray.forEach(async formResponse => {
  //         console.log(`Am adaugat in responseArray`);
  //   });
  // });

  console.log(`Am returnat răspunsul`);
  return response.status(201).json({ raspunsuri: responseArray });
});

// @desc    Trimite raspunsurilor formularului
// @route   POST /api/forms/sendAnswer
// @access  Private
const sendAnswer = asyncHandler(async (request, response) => {
  const files = request.files;
  let { formID, timeLeft } = request.fields;

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

  if (form.dataExpirare && form.dataExpirare <= new Date()) {
    return response.status(401).json({
      errors: ["Din păcate acest formular nu mai acceptă răspunsuri!"],
    });
  }

  if (form.dataValiditate && form.dataValiditate < new Date()) {
    return response
      .status(401)
      .json({ errors: ["Acest formular nu este valid în momentul curent!"] });
  }

  if (!form.raspunsuriMultipleUtilizator) {
    const alreadyAnswered = await FormResponses.find({
      utilizator: request.user._id,
      formular: form._id,
    });

    if (alreadyAnswered) {
      return response.status(401).json({
        errors: ["Ati transmit deja un răspuns pentru acest formular!"],
      });
    }
  }

  const { timpTransmitere: timer } = form;
  const { intrebari: formQuestions } = form;

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

      if (
        questionType === "Caseta de selectare" ||
        questionType === "Buton radio"
      ) {
        handleMarkBoxResponse(
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
    const extension = file.name.split(".")[1].toUpperCase();
    const sizeInMb = file.size / 1024 / 1024;
    const {
      extensiiFisierPermise: fileTypes,
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
    const uniqueID = mongoose.Types.ObjectId();
    const newPath = path.join(
      __dirname,
      `../uploads/${formID}/${userID}/${questionDB.id}/${uniqueID}`
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
      fisier: path.join(`${formID}/${userID}/${questionDB.id}/${uniqueID}`),
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

  if (atribute && answerText && atribute.descriereValidare && canAnswer) {
    const {
      validareRaspuns: answerValidate,
      descriereValidare: validationDescription,
      textRaspunsInvalid: invalidAnswerMessage,
    } = atribute;

    if (validationDescription === "NUMAR" && !/^\d+$/.test(answerText.trim())) {
      addError(questionDB, invalidAnswerMessage);
      return;
    }

    if (
      validationDescription === "SIR DE CARACTERE" &&
      !answerText.match(/^[A-Za-z]+$/)
    ) {
      addError(questionDB, invalidAnswerMessage);
      return;
    }

    if (
      validationDescription === "EXPRESIE REGULATA" &&
      !answerText.match(answerValidate)
    ) {
      addError(questionDB, invalidAnswerMessage);
      return;
    }

    if (
      validationDescription !== "NUMAR" &&
      validationDescription.includes("NUMAR") &&
      !validateNumberRange(answerText, answerValidate, validationDescription)
    ) {
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

const handleMarkBoxResponse = (
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

    if (exactSelection && !isExactSelection) {
      addError(questionDB, invalidAnswerMessage);
      return;
    }

    if (minSelection && !isMinSelection) {
      addError(questionDB, invalidAnswerMessage);
      return;
    }
  }

  if (!isAnswer) return;

  addResponse({
    intrebare: questionDB.id,
    raspunsuri: answers,
  });
};

export {
  createForm,
  getFormByID,
  updateForm,
  deleteForm,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  sendAnswer,
  getUserAnswers,
  getFormAnswers,
  getSpecificAnswer,
  downloadFile,
};
