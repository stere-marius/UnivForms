function isNumeric(str) {
  if (typeof str != "string") return false;
  return !isNaN(str) && !isNaN(parseFloat(str));
}

function validateStringLength(text, length, validationType) {
  if (validationType === "SIR DE LUNGIME MAI MARE DECAT") {
    return text.length() > length;
  }
}

function validateNumberRange(number, validationBD, validationType) {
  if (validationType === "NUMAR MAI MARE DECAT") {
    return +number > +validationBD;
  }

  if (validationType === "NUMAR MAI MIC DECAT") {
    return +number < +validationBD;
  }

  if (validationType === "NUMAR EGAL CU") {
    return +number === +validationBD;
  }

  if (validationType === "NUMAR IN INTERVAL") {
    const firstRange = validationBD.split("-")[0];
    const secondRange = validationBD.split("-")[0];

    return +number >= +firstRange && +number <= +secondRange;
  }
}

export { isNumeric, validateStringLength, validateNumberRange };
