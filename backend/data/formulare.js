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
    ],
  },
];

export default formulare;
