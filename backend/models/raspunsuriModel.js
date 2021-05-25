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
  data: [{}],
});

const RaspunsuriFormular = mongoose.model(
  "RaspunsuriFormular",
  raspunsuriSchema,
  "raspunsuri_formular"
);
export default RaspunsuriFormular;
