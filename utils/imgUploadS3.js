const aws = require("aws-sdk");
const multer = require("multer");
const multerS3 = require("multer-s3");
const dotenv = require("dotenv");

dotenv.config();
const s3 = new aws.S3({
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
  accessKeyId: process.env.ACCESS_KEY_ID,
});

const upload = multer({
  storage: multerS3({
    s3,
    acl: "public-read",
    bucket: process.env.BUCKET,
    metadata: function (req, file, cb) {
      cb(null, { fieldName: "TESTING_METADATA" });
    },
    key: function (req, file, cb) {
      cb(null, Date.now().toString() + "-" + file.originalname);
    },
  }),
});

module.exports = upload;
