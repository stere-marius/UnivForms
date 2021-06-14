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

    tokenStergereCont: {
      type: String,
      required: false,
    },

    expirareStergereCont: {
      type: Date,
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

// utilizatorSchema.methods.generatePasswordResetToken = () => {
//   this.tokenResetareParola = crypto.randomBytes(20).toString("hex");
//   this.expirareResetareParola = Date.now() + 600000;
// };

// utilizatorSchema.methods.generateDeleteAccountToken = () => {
//   this.tokenStergereCont = crypto.randomBytes(20).toString("hex");
//   this.expirareStergereCont = Date.now() + 600000;
// };

// utilizatorSchema.methods.generateChangeEmailToken = () => {
//   this.tokenSchimbareEmail = crypto.randomBytes(20).toString("hex");
//   this.expirareSchimbareEmail = Date.now() + 600000;
// };

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
