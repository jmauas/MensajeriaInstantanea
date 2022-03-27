import fs from 'fs';
import Base64BufferThumbnail from 'base64-buffer-thumbnail';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import thumbler from 'video-thumb';
import pdf from 'pdf-poppler';
import util from 'util';

export const crearMini = async (mensaje) => {
    if (mensaje.adj) {
        let tipo = esImagen(mensaje.nombre);
        if (tipo!='') {
            try {
                let file = './subidas/'+mensaje.nombre;
                if (tipo=='pdf') {
                    const outputFile = await convertImage(file, `${__dirname}\\images\\`);
                    file = `./src/auxi/images/${outputFile}.png` ;
                    tipo = 'data:image/png;base64,';
                    const imageBuffer = fs.readFileSync(file);
                    const thumbnail = await Base64BufferThumbnail(imageBuffer, {
                                                responseType: 'base64' })
                    fs.unlinkSync(file);
                    return contenedorImg(mensaje.nombre, thumbnail, tipo);
                } else if (tipo=='vid') {
                    tipo = 'data:image/png;base64,';
                    const crearSnap = util.promisify(thumbler.extract);
                    try {
                        await crearSnap(file, `${__dirname}\\images\\snapshot.png`, '00:00:02', '2000x1250');
                        file = `./src/auxi/images/snapshot.png`;   
                        const imageBuffer = fs.readFileSync(file);
                        const thumbnail = await Base64BufferThumbnail(imageBuffer, {
                                                        responseType: 'base64' })
                        fs.unlinkSync(file);
                        return contenedorImg(mensaje.nombre, thumbnail, tipo);    
                    } catch (err) {
                        console.error(err);
                    }
                } else {
                    const imageBuffer = fs.readFileSync(file);
                    const thumbnail = await Base64BufferThumbnail(imageBuffer, {
                                                responseType: 'base64' })
                    return contenedorImg(mensaje.nombre, thumbnail, tipo);
                }         
            } catch (err) {
                console.log('ERROR: '+err);
                return '';
            }
        } else {
            return '';
        }
    } else {
        return '';
    }
}

const convertImage = async (file, outputFile) => {
    try {
        let page = '1'
        const info = await pdf.info(file);
        if (Number(info.pages)>9) page = '01'
        const nombre = 'subida';
        let opts = {
            format: 'png',
            out_dir: outputFile,
            scale: 2048,
            out_prefix: nombre,
            page: 1
        }         
        await pdf.convert(file, opts);
        return nombre+'-'+page;
    } catch (err) {
        console.log(err)
    }
}

const esImagen = (nombre) => {
    const ext = nombre.substring(nombre.lastIndexOf('.')+1).toLowerCase();
    if (ext.indexOf('jpg')>-1 || ext.indexOf('jpeg')>-1 || ext.indexOf('png')>-1 || ext.indexOf('bmp')>-1 || ext.indexOf('gif')>-1) {
        return `data:image/${ext};base64,`;
    } else if (ext.indexOf('pdf')>-1) {
         return `pdf`;
    } else if (ext.indexOf('avi')>-1 || ext.indexOf('mov')>-1 || ext.indexOf('mp4')>-1 || ext.indexOf('wmv')>-1 || ext.indexOf('flv')>-1) {
            return `vid`;
    } else {
        return '';
    }
}

const contenedorImg = (nombre, thumbnail, tipo) => {        
    let html = `
    <div class="mini-container">
        <div class="mini-data">
            <div class="img-mini-container">
                <a href="/descarga/${nombre}" target="_blank">`;
                html += `<img class="img-mini" src="${tipo+thumbnail}"/>`;
                html += `</a>
            </div>
            <div class="text-mini-container">
                ${nombre}
            </div>
        </div>
    </div>
    `;
    return html;
}