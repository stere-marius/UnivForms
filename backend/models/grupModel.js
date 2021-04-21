import mongoose from "mongoose";

const utilizatoriGrupSchema = mongoose.Schema({
  utilizator: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Utilizator",
  },
  admistrator: {
    type: Boolean,
    required: true,
    default: false,
  },
  abonat: {
    type: Boolean,
    required: true,
    default: false,
  },
});

const grupSchema = mongoose.Schema({
  nume: {
    type: String,
    required: true,
  },
  utilizatori: [utilizatoriGrupSchema],
  formulare: [
    {
      formular: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Formular",
      },
    },
  ],
  chestionare: [
    {
      chestionar: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Chestionar",
      },
    },
  ],
});

const Grup = mongoose.model("Grup", grupSchema);
export default Grup;
