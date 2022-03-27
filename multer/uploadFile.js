import multer from "multer";
import storage from "./storage.js";

const upload = multer({ storage });

export default upload;