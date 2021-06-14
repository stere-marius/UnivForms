import mongoose from "mongoose";
import path from "path";

const raspunsuriSchema = mongoose.Schema(
  {
    utilizator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Utilizator",
    },
    formular: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Formular",
    },
    raspunsuri: [{}],
  },
  {
    timestamps: { createdAt: "createdAt" },
  }
);

const RaspunsuriFormular = mongoose.model(
  "RaspunsuriFormular",
  raspunsuriSchema,
  "raspunsuri_formular"
);
export default RaspunsuriFormular;
