import mongoose from "mongoose";

const grupSchema = mongoose.Schema(
  {
    nume: {
      type: String,
      required: true,
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Utilizator",
    },
    utilizatori: [
      {
        utilizatorID: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Utilizator",
        },
        administrator: {
          type: Boolean,
          default: false,
        },
      },
    ],
    formulare: [
      {
        formularID: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Formular",
        },
      },
    ],
  },
  {
    timeStamps: true,
  }
);

const Grup = mongoose.model("Grup", grupSchema, "grupuri");
export default Grup;
