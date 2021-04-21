import mongoose from "mongoose";

const raspunsuriSchema = mongoose.Schema({
  utilizator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Utilizator",
  },
  formular: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Formular",
  },
  intrebare: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Formular.intrebari",
  },
  raspunsuri: [
    {
      raspuns: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Formular.raspunsuri",
      },
    },
  ],
});

const RaspunsuriFormular = mongoose.model(
  "RaspunsuriFormular",
  raspunsuriSchema
);
export default RaspunsuriFormular;
