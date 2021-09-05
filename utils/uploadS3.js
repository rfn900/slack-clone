const express = require("express");
const multer = require("multer");
const fs = require("fs");
const AWS = require("aws-sdk");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

const uploadPath = "public/uploads/";
const s3 = new AWS.S3({
  region: process.env.BUCKET_REGION,
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
});

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

function uploadFileS3(file) {
  const fileStream = fs.createReadStream(file.path);

  console.log(file, process.env.BUCKET);
  const uploadParams = {
    Bucket: process.env.BUCKET,
    Body: fileStream,
    Key: file.filename,
  };

  return s3.upload(uploadParams).promise();
}

//router.post("/", upload.single("file"), async function (req, res, next) {
//const file = req.file;
//const result = await uploadFile(file);
//console.log(result);
//res.send("ok");
//});
//

module.exports = { upload, uploadFileS3, uploadPath };
