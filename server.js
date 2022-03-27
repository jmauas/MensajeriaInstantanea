import express from 'express';
import http from 'http';
import formatoFecha from './src/auxi/auxiliares.js';
import Mensajes from './src/auxi/mensajes.js';
import SubirRoutes from "./multer/subirFile.js";
import DescargaRoutes from "./subidas/descargas.js";
import config from "./db/config.js";
import uniqid from 'uniqid';
import { getLink } from './src/auxi/link-preview.js';
import { crearMini } from './src/auxi/miniaturas.js';


const app = express();
import { Server }  from 'socket.io';

import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
let us = '';
let conectados = [];


const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: '*'}
});

app.use(express.json());
app.use(express.urlencoded({ extended: true}));
app.use(express.static('src'));
app.use(express.static(path.join(__dirname, 'subidas')));
app.use("/subir", SubirRoutes);
app.use("/descarga", DescargaRoutes);

app.get('/:us', (req, res) => {
    us = req.params.us;
    if (us=='favicon.ico') us = '';
    res.status(200).sendFile('src/index.html', {root: __dirname});
})


const PORT = 3080;

server.listen(PORT, () => console.log(`Servidor Escuchando en http://localhost:${PORT}`));

io.on('connection', (socket) => {
    console.log(`Usuario: ${us} Conectado`);
    const fh = formatoFecha(new Date()); 
    conectados.push({id: socket.id, us: us, fh: fh});
    socket.emit('Bienvenida', {
        us: us,
        titulo: config.titulo
    });
    us = '';
    const claseMsg = new Mensajes('./db/mensajes.json');
    claseMsg.getAll(async msgs => {
        socket.emit('mensajes', msgs);
    })

    socket.on('disconnect', () => {
        conectados = conectados.filter((con) => con.id !== socket.id);
        console.log('Usuario Desconectado');
    });
    

    socket.on('mensajeFront', async (data) =>{
        const fh = formatoFecha(new Date());
        let mensajes = [];
        for await (let m of data) {
            const link = await getLink(m.msg);
            const mini =  await crearMini(m);
            mensajes.push({
                id: socket.id,
                fh: fh,
                uid: uniqid(),
                link: link,
                mini: mini,
                ...m
            });
         }
        claseMsg.getAll(async msgs => {
            if (msgs != undefined && msgs != null){
                mensajes.push(...msgs);
            }
            claseMsg.guardarMensajes(mensajes, async () => {
                io.sockets.emit('mensajes', mensajes);
            });            
        })
    })

    socket.on('pedirMsgs', () => {
        claseMsg.getAll(async msgs => {
            io.sockets.emit('mensajes', msgs);
        })
    })

    socket.on('envioUsuario', (us) =>{
        conectados = conectados.map(con => {
            return (
                con.id == socket.id
                    ?  {...con, us: us}
                    : con
            )
        })
    })

    socket.on('verConectadosFront', () =>{
        socket.emit('VerConectadosBack', conectados);
    })

    socket.on('typingFront', (data) =>{
        const fh = formatoFecha(new Date());        
        socket.broadcast.emit('typingBack', {fh: fh, us: data.us});
    })
})
