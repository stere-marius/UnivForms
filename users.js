const userSchema =
  ({
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
    isSiteAdmin: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  {
    timestamps: true,
  });
