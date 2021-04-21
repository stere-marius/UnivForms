import mongoose, { mongo } from "mongoose";

const raspunsuriSchema = mongoose.Schema({
  titlu: {
    type: String,
    required: true,
  },
  corect: {
    type: Boolean,
    default: false,
  },
  punctaj: {
    type: Boolean,
    default: false,
  },
});

const intrebariSchema = mongoose.Schema({
  titlu: {
    type: String,
    required: true,
  },
  tip: {
    type: String,
    required: true,
    enum: [
      "Raspunsuri multiple",
      "Completare utilizator",
      "Raspunsuri paragraf",
      //   "Incarcare fisier",
    ],
  },
  punctaj: {
    type: Number,
    required: true,
    default: 0,
  },
  raspunsuri: [raspunsuriSchema],
});

const chestionarSchema = mongoose.Schema(
  {
    titlu: {
      type: String,
      required: true,
    },
    timp: {
      type: String,
      default: 0,
    },
    utilizator: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Utilizator",
    },
    intrebari: [intrebariSchema],
  },
  {
    timestamps: true,
  }
);

const Chestionar = mongoose.model("Chestionar", chestionarSchema);
export default Chestionar;
