import bcrypt from "bcryptjs";

const utilizatori = [
  {
    nume: "Stere",
    prenume: "Marius-Nicusor",
    email: "stere.marius99@gmail.com",
    parola: bcrypt.hashSync("123456", 10),
    administrator: true,
  },
  {
    nume: "Stere",
    prenume: "Silviu",
    email: "stere.silviu@gmail.com",
    parola: bcrypt.hashSync("123456", 10),
  },
  {
    nume: "Stere",
    prenume: "Nicusor",
    email: "stere.nicusor@gmail.com",
    parola: bcrypt.hashSync("123456", 10),
  },
];

export default utilizatori;
