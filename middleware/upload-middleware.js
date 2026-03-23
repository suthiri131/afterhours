const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({

  destination: function (req, file, cb) {
    cb(null, "public/uploads/");
  },

  filename: function (req, file, cb) {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },

});

const upload = multer({

  storage: storage,

  limits: { fileSize: 5 * 1024 * 1024 },

  fileFilter: function (req, file, cb) {

    const allowedTypes = /jpeg|jpg|png|webp/;

    const isValid = allowedTypes.test(path.extname(file.originalname).toLowerCase());

    if (isValid) {
      cb(null, true);
      
    } else {
      cb(new Error("Only jpeg, jpg, png, webp images are allowed."));
    }

  },

});

module.exports = upload;