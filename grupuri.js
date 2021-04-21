const grupSchema =
  ({
    formulare: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Formulare",
    },
    chestionare: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Chestionare",
    },
  },
  {
    timestamps: true,
  });
