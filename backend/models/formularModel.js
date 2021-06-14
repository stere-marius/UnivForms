import mongoose from "mongoose";
import Group from "../models/grupModel.js";
import User from "../models/utilizatorModel.js";
import FormResponses from "../models/raspunsuriModel.js";
import path from "path";
import fs from "fs";

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
    timestamps: {
      createdAt: "createdAt",
      updatedAt: "modifiedAt",
    },
    strict: false,
  }
);

formularSchema.pre("deleteOne", { document: true }, function (next) {
  console.log(`Formular schema remove id = ${this._id}`);
  FormResponses.deleteMany({ formular: this._id }).exec();
  const __dirname = path.resolve();
  const filePath = path.join(__dirname, `../uploads/${this._id.toString()}`);
  console.log(`File path = ${filePath}`);
  fs.rmSync(filePath, { recursive: true });
  Group.find({ "formulare._id": this._id }).exec((err, groups) => {
    if (err) {
      console.log(err);
      return;
    }

    groups.map(group => {
      const removeIndex = group
        .toObject()
        .formulare.find(form => form._id.toString() === this._id.toString());
      console.log(`removeIndex = ${removeIndex}`);

      if (removeIndex === -1) return;

      group.formulare.splice(removeIndex, 1);
      group.save();
    });
  });
  next();
});

const Formular = mongoose.model("Formular", formularSchema, "formulare");
export default Formular;
