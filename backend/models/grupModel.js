import mongoose from "mongoose";

const grupSchema = mongoose.Schema(
  {
    nume: {
      type: String,
      required: true,
    },
    utilizatori: [
      {
        utilizator: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Utilizator",
        },
        administrator: {
          type: Boolean,
          required: true,
          default: false,
        },
      },
    ],
    formulare: [
      {
        formular: {
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
