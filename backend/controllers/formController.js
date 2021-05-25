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
  const formFormidable = new formidable.IncomingForm();
  formFormidable.keepExtensions = true;
  formFormidable.keepFilenames = true;

  const __dirname = path.resolve();
  console.log("__dirname " + __dirname);

  formFormidable.uploadDir = path.join(__dirname, "/uploads");

  // formFormidable.on("fileBegin", (name, file) => {
  //   // const [formID, userID, questionID, fileName] = file.name.split("_");
  //   // const directory = path.join(
  //   //   __dirname,
  //   //   "../" + formID + "/" + userID + "/" + questionID
  //   // );

  //   file.path =
  //     "D:\\Licenta\\60abe7604504a157b00f1dc2\\60abe75f4504a157b00f1dbf\\60abe7604504a157b00f1de1";
  // });

  if (!fs.existsSync(formFormidable.uploadDir)) {
    fs.mkdirSync(formFormidable.uploadDir);
  }

  // formFormidable.onPart = async part => {
  //   if (!part.filename) return;

  //   const [formID, userID, questionID, fileName] = part.filename.split("_");
  //   console.log(JSON.stringify(part.filename.split("_")));
  //   console.log("File name " + part.filename);
  //   console.log("formID " + formID);
  //   console.log("userID " + userID);
  //   console.log("questionID " + questionID);
  //   console.log("fileName " + fileName);

  //   if (!formID || !mongoose.Types.ObjectId.isValid(formID)) {
  //     formFormidable.emit("error", new Error("Formularul nu exista"));
  //     return;
  //   }

  //   if (!questionID) {
  //     formFormidable.emit("error", new Error("Intrebarea nu a fost gasita"));
  //     return;
  //   }

  //   if (!userID || !mongoose.Types.ObjectId.isValid(userID)) {
  //     formFormidable.emit("error", new Error("Utilizatorul nu a fost gasit"));
  //     return;
  //   }

  //   const form = await Form.findById(formID);

  //   if (!form) {
  //     formFormidable.emit("error", new Error("Formularul nu exista"));
  //     return;
  //   }

  //   const intrebareObj = form.intrebari.filter(
  //     intrebare => intrebare._id.toString() === questionID
  //   );

  //   if (!intrebareObj) {
  //     formFormidable.emit("error", new Error("Intrebarea nu a fost gasita"));
  //     return;
  //   }

  //   const user = await User.findById(userID);

  //   if (!user) {
  //     formFormidable.emit("error", new Error("Utilizatorul nu a fost gasit"));
  //     return;
  //   }

  //   const directory = path.join(
  //     __dirname,
  //     "../" + form._id + "/" + user._id.toString() + "/" + questionID
  //   );

  //   formFormidable.uploadDir = directory;

  //   console.log("A \n");

  //   if (!fs.existsSync(directory)) {
  //     fs.mkdirSync(directory, { recursive: true });
  //   }

  //   // Validate allowed file ext
  //   if (
  //     !["mp4", "m4v", "vtt", "pdf"].includes(part.filename.split(".").pop())
  //   ) {
  //     // video or caption file
  //     this.emit(
  //       "error",
  //       new Error(`File extension for [ ${part.filename} ] is not supported.`)
  //     );
  //     return;
  //   }
  //   // Guard multiple files
  //   // Guard file size
  //   // formidable default form handling
  //   formFormidable.handlePart(part);
  // };

  console.log("UserID " + request.user._id);

  formFormidable.on("file", function (field, file) {});

  formFormidable.parse(request, (err, fields, files) => {
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

    console.log("newPath " + newPath);

    if (!fs.existsSync(newPath)) {
      fs.mkdirSync(newPath, { recursive: true });
    }

    fs.writeFile(
      newPath + "/" + files.file.name,
      fs.readFileSync(oldPath),
      error => {
        if (error) {
          console.log("error " + error);
          formFormidable.emit(
            "error",
            new Error("Fisierul nu a putut fi incarcat")
          );
          return;
        }

        response
          .status(201)
          .json({ message: "Fisierul a fost încărcat cu success" });
      }
    );

    // Object.keys(files).forEach(prop => console.log(prop + "\n"));
    // console.log("fields " + JSON.stringify(fields, null, 4));
    // console.log("Files " + JSON.stringify(files, null, 4));
    // console.log("Uploaded file " + JSON.stringify(uploadedFile));

    // if (files.profilePic.type === "application/pdf") {
    //   formFormidable.emit("error", new Error("Formularul nu exista"));
    //   return;
    // }
  });

  // formFormidable.once("end", () => {
  //   if (response.writableEnded) return;
  //   response
  //     .status(201)
  //     .json({ message: "Fisierul a fost încărcat cu success" });
  // });
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
};
