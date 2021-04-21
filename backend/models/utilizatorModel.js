import mongoose from "mongoose";
import bcrypt from "bcryptjs";

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
    administrator: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

utilizatorSchema.methods.matchPassword = async function (parolaIntrodusa) {
  return await bcrypt.compare(parolaIntrodusa, this.parola);
};

userSchema.pre("save", async function (next) {
  if (!this.isModified("parola")) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.parola = await bcrypt.hash(this.parola, salt);
});

const Utilizator = mongoose.model("Utilizator", utilizatorSchema);
export default Utilizator;
