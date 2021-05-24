import mongoose from "mongoose";

const formularSchema = mongoose.Schema(
  {
    utilizator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Utilizator",
    },
    nume: {
      type: String,
      required: true,
      default: "Formular",
    },
    intrebari: [
      {
        tip: {
          type: String,
          required: true,
        },
        titlu: {
          type: String,
          required: true,
        },
        imagine: {
          type: String,
        },
        obligatoriu: {
          type: Boolean,
          default: false,
        },
        atribute: {},
        raspunsuri: [
          {
            _id: {
              type: mongoose.Schema.Types.ObjectId,
              auto: true,
            },
          },
        ],
      },
    ],
  },
  {
    timeStamps: true,
    strict: false,
  }
);

const Formular = mongoose.model("Formular", formularSchema, "formulare");
export default Formular;
