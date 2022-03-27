import express  from 'express';
const routerSubir = express.Router();
import upload from "./uploadFile.js";

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

routerSubir.post("/", upload.single("myFile"), (req, res, next) => {
    const file = req.file;
    if (!file) {
      const error = new Error("File not found");
      return next(error);
    }
    res.status(200).send(file);
});

routerSubir.get("/:nombre", (req, res) => {
  const nombre = req.params.nombre;
  //res.status(200).download(__dirname+'/subidas/'+nombre);
  res.status(200).sendFile(__dirname+'/subidas/'+nombre);
});

export default routerSubir;