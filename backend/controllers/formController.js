import Form from "../models/formularModel.js";
import Group from "../models/grupModel.js";
import User from "../models/utilizatorModel.js";
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

  if (formGroup) {
    const group = await Group.findById(formGroup);

    if (!group) {
      response.status(400);
      throw new Error("Grupul atribuit formularului nu exista");
    }

    const esteAdministrator = group.utilizator.find(
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

  const utilizator = request.user._id;
  const { intrebari } = request.body.intrebari;

  intrebari.map((intrebare, index) => {
    if (!intrebare.titlu) {
      response.status(400);
      throw new Error(`Intrebarea ${index + 1} nu are un titlu`);
    }

    if (
      intrebare.atribute &&
      intrebare.atribute.some(
        atribut => atribut.punctaj && !isNumeric(atribut.punctaj)
      )
    ) {
      response.status(400);
      throw new Error(
        `Punctajul intrebarii ${intrebare.titlu} trebuie sa fie un numar`
      );
    }

    if (!intrebare.tip) {
      response.status(400);
      throw new Error(`Intrebarea ${index + 1} nu are un tip`);
    }

    if (intrebare.tip !== "Upload fisier") {
      if (!intrebare.raspunsuri) {
        response.status(400);
        throw new Error(`Intrebarea ${intrebare.titlu} nu contine raspunsuri`);
      }

      if (intrebare.raspunsuri.some(raspuns => !raspuns.titlu)) {
        response.status(400);
        throw new Error(
          `Intrebarea ${intrebare.titlu} contine raspunsuri fara titlu`
        );
      }
    }
  });

  const createdForm = await Form.create({
    utilizator,
    intrebari,
  });

  if (createdForm) {
    return response.status(201).json({
      _id: createdForm._id,
      utilizator,
      intrebari,
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
  form.intrebari.push(question);
  await form.save();
  return response
    .status(201)
    .json({ message: "Intrebare adaugata cu success" });
});

// @desc    Actualizeaza intrebarea formularului
// @route   PUT /api/forms/:id/questions/:question_id
// @access  Private/Admin Group
const updateQuestion = asyncHandler(async (request, response) => {
  const form = await Form.findById(request.params.id);

  if (!form) {
    response.status(404);
    throw new Error("Formularul nu a fost gasit");
  }

  const questionIndex = form.intrebari.findIndex(
    intrebare => intrebare._id.toString() === request.params.question_id
  );

  if (questionIndex === -1) {
    return response.status(401).json({ message: "Intrebarea nu exista" });
  }

  if (form.utilizator.toString() !== request.user._id.toString()) {
    return response.status(401).json({ message: "Utilizator neautorizat" });
  }

  const newQuestion = request.body.intrebare;

  const updatedQuestion = {
    ...form.intrebari[questionIndex],
    newQuestion,
  };
  console.log(updatedQuestion);
  const updatedForm = await form.save();
  return response.status(201).json(updatedForm.intrebari);
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

const getFormResponses = asyncHandler(async (request, response) => {
  const form = await Form.findById(request.params.id);

  if (!form) {
    response.status(404);
    throw new Error("Formularul nu a fost gasit");
  }

  if (!form.intrebari) {
    return response
      .status(404)
      .json({ message: "Acest formular nu contine intrebari" });
  }

  // TODO: Adauga in baza de date raspunsurile

  const data = request.body.answers;

  if (!data) {
    return response.status(400).json({ message: "Raspunsuri invalide" });
  }

  data.forEach(dataRaspuns => {
    const intrebare = form.intrebari.filter(dataRaspuns.id);

    if (!intrebare) return;

    const { tip, raspunsuri } = intrebare;

    if (tip === "Caseta de selectare" && raspunsuri) {
      const raspunsuriCorecte = raspunsuri.map(
        raspuns =>
          raspuns.atribute &&
          raspuns.atribute.esteCorect &&
          dataRaspuns.raspunsuri.includes(raspuns._id.toString())
      );
    }
  });
});

const formFileUpload = asyncHandler(async (request, response) => {
  // TODO: Adauga calea fisierului în colecția răspunsuri_formular

  const formFormidable = new formidable.IncomingForm({
    multiples: true,
    keepFilenames: true,
    keepExtensions: true,
  });

  formFormidable.on("fileBegin", (filename, file) => {
    // console.log(`filename ${file.name}`);
    if (file.name.split(".")[1].toLowerCase() === "pdf") {
      formFormidable.emit("error", new Error("Nu se permit fisiere PDF"));
    }
  });

  const __dirname = path.resolve();

  formFormidable.uploadDir = path.join(__dirname, "../uploads");

  formFormidable.parse(request, (err, fields, files) => {
    console.log(`Fields: ${JSON.stringify(fields, null, 10)}`);
    console.log(`Files: ${JSON.stringify(files, null, 10)}`);
    console.log(typeof files);
    if (err) {
      console.log("Error " + err);
      response.status(401).json({ message: err.message });
      return;
    }

    if (!files.file) {
      formFormidable.emit("error", new Error("Fisier invalid sau inexistent"));
      return;
    }

    const formID = fields.formID;
    const questionID = fields.questionID;

    if (!formID || !mongoose.Types.ObjectId.isValid(formID)) {
      formFormidable.emit("error", new Error("Formularul nu exista"));
      return;
    }

    if (!questionID || !mongoose.Types.ObjectId.isValid(questionID)) {
      formFormidable.emit("error", new Error("Intrebarea nu a fost gasita"));
      return;
    }

    const oldPath = files.file.path;
    const newPath = path.join(
      __dirname,
      formID + "/" + request.user._id.toString() + "/" + questionID
    );

    if (!fs.existsSync(newPath)) {
      fs.mkdirSync(newPath, { recursive: true });
    }

    fs.writeFile(
      newPath + "/" + files.file.name,
      fs.readFileSync(oldPath),
      error => {
        if (error) {
          formFormidable.emit(
            "error",
            new Error(`Fisierul ${file.file.name} nu a putut fi incarcat`)
          );
          return;
        }

        response
          .status(201)
          .json({ message: "Fisierul a fost încărcat cu success" });
      }
    );

    fs.unlink(oldPath, err => {
      if (err) {
        console.error(err);
        return;
      }
    });
  });
});

const sendAnswer = asyncHandler(async (request, response) => {
  const __dirname = path.resolve();

  // const a = true;

  // if (a) {
  //   return response.status(400).json({ message: "Test" });
  // }

  const files = request.files;
  const { formID, timeLeft } = request.fields;
  let { answers } = request.fields;
  answers = JSON.parse(answers);

  console.log(`request.fields ${JSON.stringify(request.fields, null, 10)}`);
  // console.log(`questions = ${JSON.stringify(JSON.parse(answers), null, 4)}`);

  if (!formID || !mongoose.Types.ObjectId.isValid(formID)) {
    response.status(404);
    throw new Error("Formularul nu a fost gasit");
  }

  const form = await Form.findById(formID);

  if (!form) {
    response.status(404);
    throw new Error("Formularul nu a fost gasit");
  }

  // TODO: replace with object from DB
  const { timpTransmitere: timer } = request.fields;
  const { intrebari: formQuestions } = form;

  console.log(`Timer ${timer}`);

  const hasTimer = Boolean(timer && timeLeft <= 5);

  const answerObject = {
    utilizator: request.user._id,
    formular: form._id,
    raspunsuri: [],
  };

  // TODO: Iau toate intrebarile obligatorii din BD, vad daca nu sunt continute în answers, daca hasTimer îi dau mesaj de eroare

  // TODO: Verific daca un utilizator mai poate trimite raspunsuri daca permite formularul

  const getErrorsQuestions = async () => {
    const errors = [];

    await answers.forEach(async question => {
      if (!question.id) return;

      if (!question.tip) return;

      const questionDB = formQuestions.find(
        questionDB => questionDB._id.toString() === question.id
      );

      if (!questionDB) return;

      const { obligatoriu: isMandatoryQuestion } = questionDB;

      const questionType = question.tip;

      if (questionType === "Incarcare fisier") {
        const file = files[`${question.id}`];

        if (!hasTimer && isMandatoryQuestion && !file) {
          errors.push({
            id: question.id,
            title: questionDB.titlu,
            error: `Nu ati transmit un fisier pentru "${questionDB.titlu}"`,
          });
          return;
        }

        const { atribute } = questionDB;

        if (atribute) {
          const extension = file.name.split(".")[1];
          const sizeInMb = file.size / 1024 / 1024;
          const {
            tipuriFisierPermise: fileTypes,
            invalidAnswer: textRaspunsInvalid,
            maxSize: dimensiuneMaximaFisier,
          } = atribute;

          if (
            !hasTimer &&
            file &&
            ((fileTypes && !fileTypes.includes(extension)) ||
              (maxSize && sizeInMb > maxSize))
          ) {
            errors.push({
              id: question.id,
              title: questionDB.titlu,
              error: textRaspunsInvalid,
            });
            return;
          }
        }

        if (hasTimer && file) {
          const oldPath = file.path;
          const newPath = path.join(
            __dirname,
            `${formID}/${request.user._id.toString()}/${question.id}`
          );

          console.log();
          let errorRename = null;

          fs.mkdirSync(newPath, { recursive: true });

          fs.rename(oldPath, path.join(`${newPath}/${file.name}`), error => {
            if (error) {
              errors.push({
                id: questionDB.id,
                title: questionDB.titlu,
                error: `Server error! Fisierul ${file.name} nu a putut fi incarcat`,
              });
              errorRename = error;
              console.error(error);
              return;
            }
          });

          if (errorRename) return;

          console.log("Am adaugat raspunsul");
          answerObject.raspunsuri = [
            ...answerObject.raspunsuri,
            {
              id: question.id,
              fisier: path.join(
                `${question.id}/${request.user._id}/${file.name}`
              ),
            },
          ];

          return;
        }

        return;
      }

      if (questionType === "Raspuns text") {
        const answerText = question.raspuns;

        const { atribute } = questionDB;

        const canStillAnswer = !hasTimer && isMandatoryQuestion;

        if (atribute) {
          const {
            validareRaspuns: answerValidateRegex,
            textRaspunsInvalid: invalidAnswerMessage,
          } = atribute;

          if (
            canStillAnswer &&
            (!answerText || !answerText.match(answerValidateRegex))
          ) {
            errors.push({
              title: questionDB.titlu,
              id: question.id,
              error: invalidAnswerMessage,
            });
            return;
          }
        }

        if (canStillAnswer && !answerText) {
          errors.push({
            title: questionDB.titlu,
            id: question.id,
            error: `Intrebare obligatorie! Nu ati oferit un raspuns pentru "${questionDB.titlu}"`,
          });
          return;
        }

        if (answerText) {
          answerObject.raspunsuri = [
            ...answerObject.raspunsuri,
            {
              id: question.id,
              raspuns: answerText,
            },
          ];
        }

        return;
      }

      if (questionType === "Caseta de selectare") {
        const answers = question.raspunsuri;

        console.log(`answers ${answers}`);

        const { atribute } = questionDB;

        const canStillAnswer = !hasTimer && isMandatoryQuestion;

        // Daca intrebarea nu are atribute si este o intrebare obligatoriu dar nu a dat un raspuns

        if (canStillAnswer && !answers.length) {
          errors.push({
            title: questionDB.titlu,
            id: question.id,
            error: `Intrebare obligatorie! Nu ati oferit un raspuns pentru "${questionDB.titlu}"`,
          });
          return;
        }

        if (atribute) {
          const {
            validareRaspuns: {
              selectareExacta: exactSelection,
              selectareMinima: minSelection,
              textRaspunsInvalid: invalidAnswerMessage,
            },
          } = atribute;

          console.log(`atribute: ${JSON.stringify(atribute, null, 10)}`);

          console.log(`hasTimer ${hasTimer}`);
          console.log(`isMandatoryQuestion ${isMandatoryQuestion}`);
          console.log(`answers ${answers}`);
          console.log(`exactSelection ${exactSelection}`);
          console.log(`answers.length ${answers.length}`);
          console.log(`minSelection ${minSelection}`);
          if (
            canStillAnswer &&
            (!answers ||
              (exactSelection && answers.length !== exactSelection) ||
              (minSelection && answers.length < minSelection))
          ) {
            errors.push({
              title: questionDB.titlu,
              id: question.id,
              error: invalidAnswerMessage,
            });
            return;
          }
        }

        if (answers) {
          answerObject.raspunsuri = [
            ...answerObject.raspunsuri,
            {
              id: question.id,
              raspunsuri: answers,
            },
          ];
          return;
        }
      }
    });

    return errors;
  };

  const errors = await getErrorsQuestions();

  if (errors.length > 0) {
    return response.status(400).json({ errors: errors });
  }

  // console.log(`Fields ${JSON.stringify(request.fields, null, 4)}`);
  // console.log(`Files ${JSON.stringify(request.files, null, 4)}`);
  return response.status(201).json(answerObject);
});

// trimite raspunsurile
// daca formularul are ca atribut sa întoarcă rezultatele utilizatorului după trimitere, întorc un json cu rezultatele

// daca nu are, îi întorc un mesaj prin care îl informez că formularul a fost trimis

export {
  getFormByID,
  createForm,
  deleteForm,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  formFileUpload,
  sendAnswer,
};
