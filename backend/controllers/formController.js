import Form from "../models/formularModel.js";
import Group from "../models/grupModel.js";
import asyncHandler from "express-async-handler";
import { isNumeric } from "../utils/validators.js";

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

export {
  getFormByID,
  createForm,
  deleteForm,
  createQuestion,
  updateQuestion,
  deleteQuestion,
};
