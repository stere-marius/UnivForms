function formatBytes(bytes) {
  var marker = 1024; // Change to 1000 if required
  var decimal = 3; // Change as required
  var kiloBytes = marker; // One Kilobyte is 1024 bytes
  var megaBytes = marker * marker; // One MB is 1024 KB
  var gigaBytes = marker * marker * marker; // One GB is 1024 MB
  // var teraBytes = marker * marker * marker * marker; // One TB is 1024 GB

  // return bytes if less than a KB
  if (bytes < kiloBytes) return bytes + " Bytes";
  // return KB if less than a MB
  if (bytes < megaBytes) return (bytes / kiloBytes).toFixed(decimal) + " KB";
  // return MB if less than a GB
  if (bytes < gigaBytes) return (bytes / megaBytes).toFixed(decimal) + " MB";
  // return GB if less than a TB
  return (bytes / gigaBytes).toFixed(decimal) + " GB";
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
    const secondRange = validationBD.split("-")[1];

    return +number >= +firstRange && +number <= +secondRange;
  }
}

const formatToHHMMSS = seconds => {
  let hours = Math.floor(seconds / 3600);
  let minutes = Math.floor((seconds - hours * 3600) / 60);
  seconds = seconds - hours * 3600 - minutes * 60;

  if (hours < 10) {
    hours = "0" + hours;
  }
  if (minutes < 10) {
    minutes = "0" + minutes;
  }
  if (seconds < 10) {
    seconds = "0" + seconds;
  }

  return hours + ":" + minutes + ":" + seconds;
};

const getDifferenceInDays = (a, b) => {
  a = new Date(a);
  b = new Date(b);
  const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

  return Math.floor((utc2 - utc1) / (1000 * 60 * 60 * 24));
};

export {
  formatBytes,
  validateStringLength,
  validateNumberRange,
  formatToHHMMSS,
  getDifferenceInDays,
};
