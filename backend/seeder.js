import mongoose from "mongoose";
import dotenv from "dotenv";
import colors from "colors";
import utilizatori from "./data/utilizatori.js";
import formulare from "./data/formulare.js";
import grupuri from "./data/grupuri.js";
import raspunsuri from "./data/raspunsuri.js";
import Utilizator from "./models/utilizatorModel.js";
import Formular from "./models/formularModel.js";
import Grup from "./models/grupModel.js";
import RaspunsuriFormular from "./models/raspunsuriModel.js";
import connectDB from "./config/db.js";

dotenv.config();
connectDB();

const importData = async () => {
  try {
    destroyData();
    console.log("Inserez utilizatorii");
    const createdUsers = await Utilizator.insertMany(utilizatori);
    const userID = createdUsers[0]._id;
    const formulareMerged = formulare.map(formular => {
      return { ...formular, utilizator: userID };
    });
    const createdForms = await Formular.insertMany(formulareMerged);

    const grupuriMerged = grupuri.map(grup => {
      return {
        ...grup,
        utilizatori: [userID],
        formulare: [createdForms[0]._id],
      };
    });

    await Grup.insertMany(grupuriMerged);

    const firstForm = createdForms[0];
    const questionsForm = firstForm.intrebari;

    const raspunsuri = [
      {
        utilizator: userID,
        formular: firstForm._id,
        intrebare: questionsForm[0]._id,
        raspunsuri: [
          questionsForm[0].raspunsuri[0]._id,
          questionsForm[0].raspunsuri[2]._id,
          questionsForm[0].raspunsuri[3]._id,
        ],
      },
    ];

    await RaspunsuriFormular.insertMany(raspunsuri);

    console.log("Data Imported".green.inverse);
    process.exit();
  } catch (error) {
    console.error(`${error}`.red.inverse);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await Utilizator.deleteMany();
    await Formular.deleteMany();
    await Grup.deleteMany();
    await RaspunsuriFormular.deleteMany();
    console.log("Data Destroyed!".red.inverse);
    process.exit();
  } catch (error) {
    console.error(`${error}`.red.inverse);
    process.exit(1);
  }
};

if (process.argv[2] === "-d") {
  destroyData();
} else {
  importData();
}
