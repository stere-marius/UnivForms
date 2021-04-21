import mongoose from "mongoose";

const raspunsuriUtilizatorSchema = mongoose.Schema(
  {
    utilizator: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Utilizator",
    },
    formular: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Formular",
      required: true,
    },
    intrebare: {
      type: String,
      required: true,
    },
    punctaj: {
      type: Number,
      required: true,
      default: 0,
    },
    raspunsuri: [
      {
        titlu: {
          type: String,
          required: true,
        },
        esteCorect: {
          type: String,
          required: true,
        },
      },
    ],
  },
  {
    timeStamps: true,
  }
);
