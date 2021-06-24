exports.urlFormat = (URL) => {
  URL = URL.split("ref=")[0];
  return URL.split("?")[0];
};
