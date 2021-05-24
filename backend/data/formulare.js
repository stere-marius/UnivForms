const formulare = [
  {
    intrebari: [
      {
        tip: "Caseta de selectare",
        titlu: "Selectati tarile membre UE",
        imagine: "C://Imagini//imagine.jpg",
        obligatoriu: true,
        atribute: {
          descriere: "Descriere",
          afisareOrdineDescrescatoare: false,
          punctaj: 100,
          validareRaspuns: {
            selectareExact: 2,
            textEroare: "Selectati exact doua raspunsuri",
          },
        },
        raspunsuri: [
          {
            titlu: "Ucraina",
            imagine: "C://Imagini//ucraina.jpg",
          },
          {
            titlu: "Rusia",
            imagine: "C://Imagini//rusia.jpg",
          },
          {
            titlu: "Romania",
            imagine: "C://Imagini//romania.jpg",
            atribute: {
              raspunsCorect: true,
            },
          },
          {
            titlu: "Germania",
            imagine: "C://Imagini//germania.jpg",
            atribute: {
              raspunsCorect: true,
            },
          },
          {
            titlu: "Spania",
            imagine: "C://Imagini//spania.jpg",
            atribute: {
              raspunsCorect: true,
            },
          },
        ],
      },

      {
        tip: "Caseta de selectare",
        titlu: "Selectati vecinii României",
        imagine: "C://Imagini//imagine.jpg",
        obligatoriu: true,
        atribute: {
          descriere: "Descriere",
          afisareOrdineDescrescatoare: false,
          punctaj: 100,
          validareRaspuns: {
            selectareExact: 2,
            textEroare: "Selectati exact doua raspunsuri",
          },
        },
        raspunsuri: [
          {
            titlu: "Ucraina",
            imagine: "C://Imagini//ucraina.jpg",
            atribute: {
              raspunsCorect: true,
            },
          },
          {
            titlu: "Rusia",
            imagine: "C://Imagini//rusia.jpg",
          },
          {
            titlu: "Moldova",
            imagine: "C://Imagini//Moldova.jpg",
            atribute: {
              raspunsCorect: true,
            },
          },
          {
            titlu: "Germania",
            imagine: "C://Imagini//germania.jpg",
          },
          {
            titlu: "Serbia",
            imagine: "C://Imagini//serbia.jpg",
            atribute: {
              raspunsCorect: true,
            },
          },
          {
            titlu: "Bulgaria",
            imagine: "C://Imagini//bulgaria.jpg",
            atribute: {
              raspunsCorect: true,
            },
          },
          {
            titlu: "Ungaria",
            imagine: "C://Imagini//ungaria.jpg",
            atribute: {
              raspunsCorect: true,
            },
          },
        ],
      },

      {
        tip: "Caseta de selectare",
        titlu: "Bifati raspunsurile corecte",
        obligatoriu: true,
        raspunsuri: [
          {
            titlu: "MD5 returneaza un string de 32 caractere",
            atribute: {
              raspunsCorect: true,
            },
          },
          {
            titlu: "MD5 returneaza un string de 64 caractere",
            imagine: "C://Imagini//rusia.jpg",
          },
          {
            titlu: "SHA256 returneaza un string de 64 caractere",
            imagine: "C://Imagini//Moldova.jpg",
            atribute: {
              raspunsCorect: true,
            },
          },
          {
            titlu: "SHA256 returneaza un string de 32 caractere",
          },
        ],
      },

      {
        tip: "Caseta de selectare",
        titlu: "Selectati tipurile de date primitive din JAVA",
        obligatoriu: true,
        raspunsuri: [
          {
            titlu: "byte",
            atribute: {
              raspunsCorect: true,
            },
          },
          {
            titlu: "short",
            atribute: {
              raspunsCorect: true,
            },
          },
          {
            titlu: "char",
            atribute: {
              raspunsCorect: true,
            },
          },
          {
            titlu: "Integer",
          },

          {
            titlu: "String",
          },
          {
            titlu: "int",
            atribute: {
              raspunsCorect: true,
            },
          },
        ],
      },

      {
        tip: "Raspuns text",
        titlu: "Tipurile de date primitive din JAVA",
        obligatoriu: true,
        atribute: {
          validareRaspuns: "",
          textRaspunsInvalid: "Introduceti un raspuns valid",
          punctaj: 10,
        },
        raspunsuri: [
          {
            raspunsExact:
              "byte, short, int, long, float, double, boolean, char",
          },
          {
            contineRaspuns: "byte",
          },
          {
            raspunsRegex: "byte|short|int|long|float|double|boolean|char/i",
          },
        ],
      },

      {
        tip: "Incarcare fisier",
        titlu: "Introduceti tema numarul 5",
        obligatoriu: true,
        atribute: {
          tipuriFisierPermise: ["pdf", "docx", "csv"],
          textRaspunsInvalid: "Introduceti un fisier valid",
          dimensiuneMaximaFisier: 1,
          punctajTrimitere: 10,
        },
      },
    ],
  },
];

export default formulare;
