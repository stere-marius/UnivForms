import mongoose from "mongoose";

const formularSchema = mongoose.Schema(
  {
    utilizator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Utilizator",
    },
    titlu: {
      type: String,
      required: true,
      default: "Formular",
    },
    dataValiditate: {
      type: Date,
    },
    dataExpirare: {
      type: Date,
    },
    timpTransmitere: {
      type: Number,
    },
    raspunsuriMultipleUtilizator: {
      type: Boolean,
      default: true,
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
        punctaj: {
          type: Number,
          default: 0,
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
