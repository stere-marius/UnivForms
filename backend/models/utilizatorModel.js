import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const utilizatorSchema = mongoose.Schema(
  {
    nume: {
      type: String,
      required: true,
    },
    prenume: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    parola: {
      type: String,
      required: true,
    },
    tokenResetareParola: {
      type: String,
      required: false,
    },

    expirareResetareParola: {
      type: Date,
      required: false,
    },

    tokenConfirmareCont: {
      type: String,
      required: false,
    },

    tokenSchimbareEmail: {
      type: String,
      required: false,
    },

    expirareSchimbareEmail: {
      type: Date,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

utilizatorSchema.methods.matchPassword = async function (parolaIntrodusa) {
  return await bcrypt.compare(parolaIntrodusa, this.parola);
};

utilizatorSchema.pre("save", async function (next) {
  if (!this.isModified("parola")) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.parola = await bcrypt.hash(this.parola, salt);
});

const Utilizator = mongoose.model(
  "Utilizator",
  utilizatorSchema,
  "utilizatori"
);
export default Utilizator;
