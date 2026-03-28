const multer = require("multer");
const path = require("path");

const allowedFormats = /jpeg|jpg|png|webp/;
const maxFileSize = 5 * 1024 * 1024;

const storage = multer.diskStorage({

  destination: function (req, file, cb) {
    cb(null, "public/uploads/");
  },

  filename: function (req, file, cb) {
    const uniqueFilename = Date.now() + "-" + file.originalname;
    cb(null, uniqueFilename);
  },

});

const fileFilter = function (req, file, cb) {

  const fileExtension = path.extname(file.originalname).toLowerCase();
  const isValidFormat = allowedFormats.test(fileExtension);

  if (isValidFormat) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file format. Please upload a JPEG, JPG, PNG or WEBP image."));
  }

};

const upload = multer({
  storage: storage,
  limits: { fileSize: maxFileSize },
  fileFilter: fileFilter,
});

const handleUpload = (req, res, next) => {

  const uploadSingle = upload.single("movieImage");

  uploadSingle(req, res, (err) => {

    if (err) {
      if (err.code === "LIMIT_FILE_SIZE") {
        req.uploadError = "File size too large. Please ensure your file is 5MB or smaller and is one of our accepted formats: JPEG, JPG, PNG or WEBP.";
      } else {
        req.uploadError = err.message;
      }
    }

    next();

  });

};

module.exports = { handleUpload };