const chestionarSchema =
  ({
    nume: {
      type: String,
      required: true,
    },
    parola: {
      type: String,
    },

    subformulare: [chestionarSchema],
    raspunsuri: [
      {
        utilizator: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: "Utilizator",
        },
        punctajTotal: {
          type: Number,
          default: 0,
        },
        optiuniAlese: [
          {
            numeInterebare: {
              type: String,
              required: true,
            },
            raspunsuri: [
              {
                titlu: {
                  type: String,
                  required: true,
                },
              },
            ],
          },
        ],
      },
    ],
  },
  { timestamps: true });

const chestionarSchema = {
  nume: {
    type: String,
    required: true,
  },
  tip: {
    type: String,
    required: true,
    enum: [
      "Raspunsuri multiple",
      "Completare utilizator",
      "Raspunsuri",
      "Incarcare fisier",
    ],
  },
  imagine: {
    type: String,
  },
  obligatoriu: {
    type: Boolean,
    required: true,
    default: false,
  },
  optiuni: [
    {
      titlu: {
        type: String,
        required: true,
      },
      raspunsCorect: {
        type: Boolean,
        default: false,
      },
      punctaj: {
        type: Number,
        default: 0,
      },
    },
  ],
};
