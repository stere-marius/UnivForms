function formatBytes(bytes) {
  var marker = 1024; // Change to 1000 if required
  var decimal = 3; // Change as required
  var kiloBytes = marker; // One Kilobyte is 1024 bytes
  var megaBytes = marker * marker; // One MB is 1024 KB
  var gigaBytes = marker * marker * marker; // One GB is 1024 MB
  var teraBytes = marker * marker * marker * marker; // One TB is 1024 GB

  // return bytes if less than a KB
  if (bytes < kiloBytes) return bytes + " Bytes";
  // return KB if less than a MB
  if (bytes < megaBytes) return (bytes / kiloBytes).toFixed(decimal) + " KB";
  // return MB if less than a GB
  if (bytes < gigaBytes) return (bytes / megaBytes).toFixed(decimal) + " MB";
  // return GB if less than a TB
  return (bytes / gigaBytes).toFixed(decimal) + " GB";
}

export { formatBytes };
