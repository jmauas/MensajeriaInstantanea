import multer from "multer";

const FILE_TYPE_MAP = {
  // mime type
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/jpg": "jpg",
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./subidas");
  },
  filename: (req, file, cb) => {
    let name = file.originalname;
    name = name.replace(/ /g, '-');
    const extension = name.substring(name.lastIndexOf('.')+1);
    name = name.substring(0, name.lastIndexOf('.'));
    cb(null, `${name}-${Date.now()}.${extension}`);
  },
});

export default storage;