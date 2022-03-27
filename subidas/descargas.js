import express  from 'express';
const DescargaRouter = express.Router();

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

DescargaRouter.get("/:nombre", (req, res) => {
  const nombre = req.params.nombre;
  res.status(200).download(__dirname+'/'+nombre, nombre, (err) => {
      if (err) {
          console.log(err);
      }
  });
});

export default DescargaRouter;