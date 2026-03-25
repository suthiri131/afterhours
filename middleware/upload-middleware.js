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
      cb(new Error("Invalid file format. Please upload a JPEG, JPG, PNG or WEBP image."));
    }

  },

});

const handleUpload = (req, res, next) => {

  upload.single("movieImage")(req, res, (err) => {

    if (err) {

      if (err.code === "LIMIT_FILE_SIZE") {
        req.uploadError = "File size too large. Maximum allowed size is 5MB. Also ensure your file is JPEG, JPG, PNG or WEBP.";
      } else {
        req.uploadError = err.message;
      }

    }

    next();

  });
  
};

module.exports = { handleUpload };