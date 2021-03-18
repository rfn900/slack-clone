const multer = require("multer");
const path = require("path");

const uploadPath = "public/uploads/";

const storage = multer.diskStorage({
  destination: (request, file, callback) => {
    callback(null, uploadPath);
  },
  filename: (request, file, callback) => {
    callback(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  limits: {
    files: 3,
    fieldSize: 2 * 1024 * 1024,
  },
  storage: storage,
  fileFilter: (request, file, callback) => {
    if (!file.originalname.match(/\.(jpg|png|gif)$/)) {
      callback(
        new Error("This file format is not accepted. Only images allowed."),
        false
      );
    }
    callback(null, true);
  },
});

module.exports = { uploadPath, upload, storage };
