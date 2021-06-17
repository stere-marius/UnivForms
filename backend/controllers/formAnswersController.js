import Form from "../models/formularModel.js";
import Group from "../models/grupModel.js";
import User from "../models/utilizatorModel.js";
import FormResponses from "../models/raspunsuriModel.js";
import FormAnswers from "../models/raspunsuriModel.js";
import asyncHandler from "express-async-handler";
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

// @desc    Sterge intrebarea formularului
// @route   DELETE /api/forms/:id/userAnswers
// @access  Private
const getUserAnswers = asyncHandler(async (request, response) => {
  const form = request.form;
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

// @desc    Obtine raspunsurilor formularului
// @route   GET /api/forms/:id/answers/:answerID
// @access  Private
const getSpecificAnswer = asyncHandler(async (request, response) => {
  const form = request.form;

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

  const json = await handleSpecificAnswer(form, formResponse);
  return response.status(201).json(json);
});

const handleSpecificAnswer = async (form, formResponse) => {
  const questionsID = form.intrebari.map(q => q._id.toString());
  const validAnswers = formResponse.raspunsuri.filter(answer =>
    questionsID.includes(answer.intrebare)
  );

  if (questionsID.length === 0 || validAnswers.length === 0) {
    return { raspunsuri: [] };
  }

  const user = await User.findById(formResponse.utilizator).select({
    nume: 1,
    prenume: 1,
    email: 1,
  });

  if (!user) {
    return { raspunsuri: [] };
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
      (type === CHECKBOX_QUESTION || type === RADIO_BUTTON_QUESTION) &&
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

    if (type === SHORT_TEXT_QUESTION && answer.raspuns !== undefined) {
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
      userScore += +responseQuestion.punctajUtilizator || 0;
      responseQuestion.raspuns = answer.raspuns;
      responseQuestion.esteCorect = correctUserAnswer;
      questionResponses.push(responseQuestion);

      return;
    }

    if (type === PARAGRAPH_QUESTION && answer.raspuns !== undefined) {
      let userAnswer = answer.raspuns.trim();
      const scoreCreator = answer.punctajUtilizator;

      // Acest răspuns a fost apreciat de creatorul formularului cu 20 de puncte
      // const flags = raspuns.match(/\/[a-z]/);

      responseQuestion.punctajUtilizator =
        questionScore && scoreCreator ? scoreCreator : undefined;
      userScore += +responseQuestion.punctajUtilizator || 0;
      responseQuestion.raspuns = userAnswer;
      responseQuestion.esteCorect = Boolean(responseQuestion.punctajUtilizator);
      questionResponses.push(responseQuestion);

      return;
    }

    if (type === FILE_UPLOAD && answer.fisier) {
      const scoreCreator = answer.punctajUtilizator;

      responseQuestion.punctajUtilizator =
        questionScore && scoreCreator ? scoreCreator : undefined;
      userScore += +responseQuestion.punctajUtilizator || 0;
      responseQuestion.caleFisier = answer.fisier;
      questionResponses.push(responseQuestion);
    }

    return;
  });

  return {
    utilizator: user,
    timpRamas: isNaN(timeLeft) ? undefined : timeLeft,
    dataTransmitere: formResponse.createdAt,
    dataActualizare: formResponse.updatedAt,
    punctajTotal: totalScore,
    punctajUtilizator: userScore,
    intrebari: questionResponses,
  };
};

// @desc    Obtine raspunsurilor formularului
// @route   POST /api/forms/:id/answers
// @access  Private
const getFormAnswers = asyncHandler(async (request, response) => {
  const form = request.form;

  const perPage = request.body.perPagina || 10;
  const page = (request.body.pagina > 0 && request.body.pagina) || 0;

  const search = request.query.search;

  const totalAnswers = await FormResponses.countDocuments({
    formular: form._id,
  });

  const formResponseArray = await FormResponses.find({ formular: form._id })
    .limit(perPage)
    .skip(perPage * page)
    .sort("createdAt");

  if (!formResponseArray || formResponseArray.length === 0) {
    return response.status(201).json({ raspunsuri: [] });
  }

  let responseArray = [];

  await Promise.all(
    formResponseArray.map(async formResponse => {
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
      };

      responseArray.push(responseObject);
    })
  );

  if (search) {
    responseArray = responseArray.filter(
      r =>
        r.utilizator.email === search ||
        new RegExp(`.*${search}.*`).test(r.utilizator.nume) ||
        new RegExp(`.*${search}.*`).test(r.utilizator.prenume)
    );
  }

  return response.status(201).json({
    raspunsuri: responseArray,
    raspunsuriTotale: search ? responseArray.length : totalAnswers,
    creatorFormular: form.utilizator,
  });
});
// @desc    Ofera un punctaj raspunsurile de tip paragraf sau file upload
// @route   PUT /api/forms/:id/answer/:answerID/:questionID/score
// @access  Private

const setScoreAnswer = asyncHandler(async (request, response) => {
  const answer = await FormResponses.findById(request.params.answerID);

  if (!answer) {
    response.status(404);
    throw new Error(`Raspunsul cu ID-ul ${request.params.answerID} nu exista`);
  }

  const questionParamID = request.params.questionID;
  const questionFound = request.form.intrebari.find(
    questionDB => questionDB._id.toString() === questionParamID
  );

  if (!questionFound) {
    response.status(404);
    throw new Error(`Intrebarea nu a fost gasită!`);
  }

  console.log(`Tipul întrebării este ${questionFound.tip}`);

  if (
    questionFound.tip !== FILE_UPLOAD &&
    questionFound.tip !== PARAGRAPH_QUESTION
  ) {
    response.status(400);
    throw new Error(`Tipul acesta de intrebare nu poate primi un punctaj!`);
  }

  const { punctaj: score } = request.body;
  const answerFound = answer.raspunsuri.find(
    answerDB => answerDB.intrebare.toString() === questionParamID
  );

  if (!score) {
    answerFound.punctajUtilizator = undefined;
    await answer.markModified("raspunsuri");
    await answer.save();

    return response
      .status(201)
      .json({ message: "Punctajul a șters cu success!" });
  }

  if (!answerFound) {
    response.status(404);
    throw new Error(
      `Această întrebare nu se află printre răspunsurile utilizatorului!`
    );
  }

  answerFound.punctajUtilizator = +score;
  await answer.markModified("raspunsuri");
  await answer.save();

  return response
    .status(201)
    .json({ message: "Punctajul a fost adăugat cu succes!" });
});

// @desc    Sterge raspunsul formularului
// @route   DELETE /api/forms/:id/answer/:answerID
// @access  Private
const deleteAnswer = asyncHandler(async (request, response) => {
  const answer = await FormResponses.findById(request.params.answerID);

  if (!answer) {
    response.status(404);
    throw new Error(`Raspunsul cu ID-ul ${request.params.answerID} nu exista`);
  }

  await answer.deleteOne();

  return response
    .status(201)
    .json({ message: "Raspunsul a fost șters cu success!" });
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
    return response.status(400).json({
      errors: ["Din păcate acest formular nu mai acceptă răspunsuri!"],
      canAnswer: false,
    });
  }

  if (form.dataValiditate && form.dataValiditate > new Date()) {
    return response.status(403).json({
      errors: ["Acest formular nu este valid în momentul curent!"],
      canAnswer: false,
    });
  }

  if (!form.raspunsuriMultipleUtilizator) {
    const alreadyAnswered = await FormResponses.findOne({
      utilizator: request.user._id,
      formular: form._id,
    });

    if (alreadyAnswered) {
      return response.status(400).json({
        errors: ["Ati transmit deja un răspuns pentru acest formular!"],
        canAnswer: false,
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

      const hasTime = timeLeft > 5;
      const canAnswer = hasTime || !timeLeft;

      console.log();
      const isAnswer =
        files[`${question.id}`] ||
        question.raspuns ||
        question.raspunsuri.length > 0;

      if (canAnswer && questionDB.obligatoriu && !isAnswer) {
        addError(
          questionDB,
          `Nu ati furnizat un raspuns intrebarii obligatorii "${questionDB.titlu}"`
        );
        return;
      }

      if (questionType === FILE_UPLOAD) {
        handleFileUploadQuestion(
          questionDB,
          formID,
          request.user._id.toString(),
          canAnswer,
          files[`${question.id}`],
          addError,
          addResponse
        );
        delete files[`${question.id}`];
        return;
      }

      if (questionType === SHORT_TEXT_QUESTION) {
        handleTextResponse(
          questionDB,
          canAnswer,
          question.raspuns,
          addError,
          addResponse
        );
        return;
      }

      if (questionType === PARAGRAPH_QUESTION) {
        handleParagraphQuestion(questionDB, question.raspuns, addResponse);
        return;
      }

      if (
        questionType === CHECKBOX_QUESTION ||
        questionType === RADIO_BUTTON_QUESTION
      ) {
        handleMarkBoxResponse(
          questionDB,
          canAnswer,
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
  canAnswer,
  file,
  addError,
  addResponse
) => {
  if (questionDB.atribute && file && canAnswer) {
    const extension = file.name.split(".")[1].toUpperCase();
    const sizeInMb = file.size / 1024 / 1024;
    const {
      extensiiFisierPermise: fileTypes,
      textRaspunsInvalid: invalidAnswer,
      dimensiuneMaximaFisier: maxSize,
    } = questionDB.atribute;

    const isValidExtension = fileTypes && fileTypes.includes(extension);
    const isValidSize = maxSize && sizeInMb <= maxSize;

    if ((fileTypes && !isValidExtension) || (maxSize && !isValidSize)) {
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
      `./uploads/${formID}/${userID}/${questionDB.id}/${uniqueID}`
    );

    console.log(`File path = ${newPath}`);

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
      fisier: path.join(
        `${formID}/${userID}/${questionDB.id}/${uniqueID}/${file.name}`
      ),
    });
  }
};

const handleTextResponse = (
  questionDB,
  canAnswer,
  answerText,
  addError,
  addResponse
) => {
  if (
    questionDB.atribute &&
    answerText &&
    questionDB.atribute.descriereValidare &&
    canAnswer
  ) {
    const {
      validareRaspuns: answerValidate,
      descriereValidare: validationDescription,
      textRaspunsInvalid: invalidAnswerMessage,
    } = questionDB.atribute;

    if (validationDescription === "NUMAR" && !/^\d+$/.test(answerText.trim())) {
      addError(questionDB, invalidAnswerMessage);
      return;
    }

    if (
      validationDescription === "SIR DE CARACTERE" &&
      !answerText.match(/^[a-zA-Z\u00C0-\u017F\s]+$/)
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

const handleParagraphQuestion = (questionDB, answerText, addResponse) => {
  if (!answerText) return;

  addResponse({
    intrebare: questionDB.id,
    raspuns: answerText,
  });
};

const handleMarkBoxResponse = (
  questionDB,
  canAnswer,
  answers,
  addError,
  addResponse
) => {
  const isAnswer = answers.length > 0;
  let { attributes: attributes } = questionDB;

  if (attributes && attributes.validareRaspuns && canAnswer && isAnswer) {
    const {
      selectareExacta: exactSelection,
      selectareMinima: minSelection,
      textRaspunsInvalid: invalidAnswerMessage,
    } = attributes.validareRaspuns;

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

const sendAnswerLinkEmail = asyncHandler(async (request, response) => {
  const { email } = request.body;

  const user = await User.findOne({ email });

  if (!user) {
    response.status(404);
    throw new Error(`Utilizatorul cu adresa de email ${email} nu există!`);
  }

  const answerID = request.params.answerID;

  const { titlu: formTitle, _id } = request.form;

  console.log(`Request url = ${request.url}`);
  console.log(`Request path = ${request.path}`);
  console.log(`req.headers.host = ${request.headers.host}`);
  console.log(`request.originalURL = ${request.originalUrl}`);
  console.log(`request.baseUrl = ${request.baseUrl}`);

  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  const siteURL = request.protocol + "://" + request.get("host");
  const msg = {
    to: email.trim(),
    from: process.env.SENDGRID_EMAIL,
    subject: `Raspunsuri formular ${formTitle}`,
    html: `
  
      <div
        style="border-radius: 16px, margin-top: 4rem, background-color: #FFF, padding-bottom: 1rem"
      >
        <div style="display: flex, flex-direction: column">
          <h4 style="text-align='center'"> Raspunsurile dvs la formularul ${formTitle} </h4>
  
        <table cellspacing="0" cellpadding="0">
          <tr>
            <td align="center" width="150" height="40" bgcolor="#01df9b" style="-webkit-border-radius: 5px; -moz-border-radius: 5px; border-radius: 5px; color: #000; display: block;">
            <a target="_blank" href="${siteURL}/form/${_id}/answers/${answerID}" style="font-size:16px; font-family: Montserrat, Helvetica, Arial, sans-serif; text-decoration: none; line-height:40px; width:100%; display:inline-block">
            <span style="color: #000">
            Accesati link
            </span>
            </a>
            </td>
          </tr>
        </table>
        </div>
        
      </div>
      `,
  };
  sgMail.send(msg);

  return response
    .status(200)
    .json({ message: "Răspunsul a fost transmis cu succes!" });
});

const getFormAnswersStatistics = asyncHandler(async (request, response) => {
  const form = request.form;

  const answers = await FormResponses.find({
    formular: form._id,
  });

  if (!answers) {
    return response.status(201).json({ message: [] });
  }

  const answersStatistics = await Promise.all(
    answers.map(async answer => ({
      ...(await handleSpecificAnswer(form, answer)),
    }))
  );

  const questionsAnswers = [].concat(
    ...answersStatistics.map(answerStats => answerStats.intrebari)
  );

  const questionsWithScore = request.form.intrebari.filter(
    question => question.punctaj > 0
  );

  const questionScore = questionsWithScore.map(question => {
    const questionScore = questionsAnswers
      .filter(answer => answer.id.toString() === question._id.toString())
      .reduce(
        (acc, questionScore) => acc + questionScore.punctajUtilizator || 0,
        0
      );

    return {
      id: question._id,
      titlu: question.titlu,
      scorTotal: questionScore,
    };
  });
  const usersScore = answersStatistics.map(answer => ({
    utilizator: answer.utilizator,
    punctajUtilizator: answer.punctajUtilizator,
  }));

  usersScore.length = usersScore.length > 5 ? 5 : usersScore.length;
  questionScore.sort((a, b) => b.scorTotal - a.scorTotal);

  const bestQuestions = questionScore
    .filter(question => question.scorTotal > 0)
    .slice(0, 5);
  const badQuestions = questionScore
    .slice(questionScore.length - 5, questionScore.length)
    .filter(
      question =>
        !bestQuestions.find(bestQuestion => bestQuestion.id === question.id)
    );

  return response.status(200).json({
    usersScore,
    bestQuestions,
    badQuestions,
  });
});

export {
  sendAnswer,
  getUserAnswers,
  getFormAnswers,
  getSpecificAnswer,
  deleteAnswer,
  setScoreAnswer,
  sendAnswerLinkEmail,
  getFormAnswersStatistics,
};
