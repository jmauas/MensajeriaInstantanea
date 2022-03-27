const socket = io();
socket.on('Bienvenida', (data) => {
    let usuario = '';
    $('#titulo').text(data.titulo);
    usuario = data.us;
    if(usuario.trim()=='') {
        usuario = localStorage.getItem('us');
        socket.emit('envioUsuario', usuario)
    }
    if(usuario.trim()!='') {
        localStorage.setItem('us', usuario);
        $('#usuario').val(usuario);
        $('#idUsuario').hide();
    } else {
        $('#usuario').val('');
        $('#idUsuario').show();
    }
    $('#status').text(`👍 Bienvenido ${usuario}. Conectado.😎`);
    $('#alertType').hide();
});

socket.on('mensajes', (data) => {
    $('#alertType').hide();
    let cont = 1;
    const limite = 4;
    if (data!= null) {
        let html = '';
        let usUltimoMsg = '';
        if (data.length>0 && Array.isArray(data)) {
            usUltimoMsg = data[0]['us'];
        }
        const sl = $('#sinLeer').prop('checked');
        data.map( m => {
            if (sl==false || leido(m.uid, $('#usuario').val())==false || cont<=limite) {
                if ($('#usuario').val()==m.us) {
                    html += `<div class="card text-white text-end bg-success my-2 ms-5" style="width: 75%;">
                        <div class="card-header">de: <span class="nombre">${m.us}</span> el ${m.fh}☑☑</div>
                        <div class="card-body">
                            <span class="card-text">${mensaje(m.msg, m.link, 'white', m.mini)}</span>`
                    if (m.adj) {
                        html += btnDesc(m.nombre, 'white');
                    }
                    html += `</div>`
                } else {
                    html += `<div class="card text-dark bg-info my-2 ms-1" style="width: 75%;">
                        <div class="card-header">✔✔de: <span class="nombre">${m.us}</span> el ${m.fh}</div>
                        <div class="card-body">
                            <span class="card-text">${mensaje(m.msg, m.link, 'dark', m.mini)}</span>`;
                        if (m.adj) {
                            html += btnDesc(m.nombre, 'dark');
                        }
                        html += `</div>`
                }
                html += '</div>';
                cont ++;
            }
        })
        $('#msgs').html(html);
        if (usUltimoMsg!=$('#usuario').val()) {
            sonido('nuevo');
        }
    }
});

const btnDesc = (nombre, color) => {
    return `<a href="/descarga/${nombre}" class="btn btn-sm btn-primary text-${color} ms-2"><i class="bi bi-cloud-download-fill"></i> Descargar</a>`
}

const mensaje = (msg, link, color, mini) => {
    if (link!=null && link!=undefined && link!='') {
        return link;
    } else {
        if (mini!='' && mini!=null) {
            msg = mini;
        } else {
            if (msg.length>=4) {
                const txt = msg.toLowerCase();
                if (txt.indexOf('http')>-1 || txt.indexOf('.com')>-1 || txt.indexOf('www')>-1) {
                    if (txt.indexOf('http')==-1) msg = 'http://'+msg;
                    msg = `<a href="${msg}" target="_blank" class="btn btn-lg btn-primary text-${color} m-3">
                            <i class="bi bi-arrow-right-square"></i> Visitar Link
                        </a><hr>${msg}`;
                }
            }
        }
        return msg;
    }
}

const leido = (uid, us) => {  
    let leidos = [];
    try {
        leidos = JSON.parse(localStorage.getItem('leidos'));
    } catch {};
    if (Array.isArray(leidos)==false) leidos = [];
    try {
        if (leidos.length>0) {
            const msg = leidos.filter(m => {return  ((m.uid==uid && m.us==us) || (m.uid==uid && m.uid==undefined))})
            if (msg.length>0 && Array.isArray(msg)) {
                return true;
            } else {
                agregarUid(uid, leidos, us);
                return false;
            }
        } else {
            agregarUid(uid, leidos, us);
        }
    } catch (err) {
        console.error(err)
        agregarUid(uid, [], us);
        return false;
    }
}

const agregarUid = (uid, leidos, us) => {
    leidos.push({uid: uid, us: us});
    //leidos = leidos.filter(m => m.uid!=null)
    localStorage.setItem('leidos', JSON.stringify(leidos));
}

const pedirMsgs = () =>{
    socket.emit('pedirMsgs')
}


const enviar = () => {
    const usuario = document.getElementById('usuario');    
    if (usuario.value=='') {
        alert('INGRESÁ USUARIO');
        return;
    }
    const mensaje = document.getElementById('mensaje');
    if (mensaje.value=='') {
        alert('INGRESÁ UN MENSAJE');
        return;
    }  
    socket.emit('mensajeFront', [{us: usuario.value, msg: mensaje.value, adj: false, nombre:''}]);  
    sonido('envio');  
    mensaje.value = '';
}

const regUsuario = () => {
    const usuario = document.getElementById('usuario');
    if (usuario.value=='') {
        alert('INGRESÁ USUARIO');
        $('#idUsuario').show();
        return;
    } else {
        $('#idUsuario').hide();
        $('#status').text(`👍 Bienvenido ${$usuario.value}. Conectado.😎`);
        localStorage.setItem('us', usuario.value);
    }
}

document.querySelector('#myFile').addEventListener('change', event => {
    handleImageUpload(event)
})

const handleImageUpload = async (event) => {
    const files = event.target.files
    const mensajes = [];
    for await (let f of files) {
        const formData = new FormData()
        formData.append('myFile', f)
        await fetch('/subir', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            const usuario = document.getElementById('usuario');    
            mensajes.push({us: usuario.value, msg: `Envío de Archivo: ${data.filename}`, adj: true, nombre: data.filename})
        })
        .catch(error => {
            console.error(error)
        })
    }
    socket.emit('mensajeFront', mensajes)
    sonido('envio');  
}

const descargarAdj = (nombre) => {
    fetch(`/descarga/${nombre}`, {
        method: 'GET',
    })
    .then(response => response.json())
    .then(data => {
        console.log(data)
    })
    .catch(error => {
        console.error(error)
    })
}

document.querySelector('#mensaje').addEventListener('keypress', event => {
    const usuario = document.getElementById('usuario');    
    socket.emit('typingFront', {us: usuario.value});      
})

socket.on('typingBack', (data) => {
    if (data!= null) {
        $('#alertType').show();
        let html = `<span><strong>${data.us}</strong> está escribiendo ... <strong>${data.fh}</strong></span>` ;
        $('#textoAlertType').html(html);
    }
});

soundManager.debugMode = false;
soundManager.onload = () => {
    soundManager.createSound({ 
       id:'nuevo',
       url: './media/nuevoMsg.wav',
       useHTML5Audio: true,
       preferFlash: false
    });
    soundManager.createSound({ 
        id:'envio',
        url: './media/envioMsg.wav',
        useHTML5Audio: true,
        preferFlash: false
     });
} 

function sonido(nombre) {
    if ($('#sonido').prop('checked')) {
        soundManager.play(nombre)
    }
};

function activarSonido() {
    $('#activar').hide();
}

const verConectados = () => {
    socket.emit('verConectadosFront');
}

socket.on('VerConectadosBack', (data) => {
    $('#alertType').hide();
    if (data!= null) {
        let html = '';
        data.map(u => {
            html += `<tr>
                        <td>${u.us}</td>
                        <td>${u.fh}</td>
                    </tr>`
        })
        $('#tablaConectados').html(html);
    }
    $('#conectados').modal('show');
});

