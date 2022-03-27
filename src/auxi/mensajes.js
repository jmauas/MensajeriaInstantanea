import fs from 'fs';
import Base64BufferThumbnail from 'base64-buffer-thumbnail';

class Mensajes {
    constructor (json) {
        this.archivo = json;
    }
    guardarMensajes(mensajes, rsp) {
        fs.writeFile(this.archivo, JSON.stringify(mensajes), error =>{
            if (error) {
                console.log(`Error al Guardar el Archivo. ${error}`);
                rsp(false)
            } else {
                rsp(true);
            }
        })
    }
    getAll(all) {
        let mensajes = []; 
        mensajes = fs.readFile(this.archivo, 'utf-8', (error, contenido)  => {
            if (error) {
                console.log('No existen mensajes.')
                all(mensajes);
            } else {
                mensajes = JSON.parse(contenido);
                if (mensajes == undefined) {
                    all([]);
                } else {
                    all(mensajes);
                }
            }
        });
    }    
}

export default Mensajes;