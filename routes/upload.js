var express = require('express');
var fileUpload = require('express-fileupload');
var fs = require('fs');

var app = express();

var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');


// default options
app.use(fileUpload());

app.put('/:tipo/:id', (req, res, next) => {

    var tipo = req.params.tipo;
    var id = req.params.id;

    // Tipos de coleccion 
    var tiposPermitidos = ['hospitales', 'medicos', 'usuarios'];

    if (tiposPermitidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Tipos  no valida',
            errors: { message: 'Solo ' + tiposPermitidos.join(', ') }
        });
    }

    if (!req.files) {
        return res.status(400).json({
            ok: false,
            mensaje: 'No selecciono nada',
            errors: { message: 'Debe de seleccionar una imagen' }
        });
    }

    // Obtener nombre del archivo
    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split('.');
    var extensionArchivo = nombreCortado[nombreCortado.length - 1]

    // Solo estas extensiones aceptamos 
    var extensionesPermitidas = ['png', 'jpg', 'gif', 'jpeg'];

    if (extensionesPermitidas.indexOf(extensionArchivo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Extension no valida',
            errors: { message: 'Solo ' + extensionesPermitidas.join(', ') }
        });
    }

    // Nombre de archivo personalizado 
    var nombreArchivo = `${ id }-${ new Date().getMilliseconds() }.${extensionArchivo}`

    // Mover el archivo del temporal a un path
    var path = `./uploads/${ tipo }/${nombreArchivo}`;

    archivo.mv(path, (err) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al mover archivo',
                errors: err
            });
        }

        subirPorTipo(tipo, id, nombreArchivo, res);



    });



});


function subirPorTipo(tipo, id, nombreArchivo, res) {

    if (tipo === 'usuarios') {

        Usuario.findById(id, (err, usuario) => {

            var pathViejo = './uploads/usuarios/' + usuario.img;

            // Si existe elimina la imagen vieja
            if (fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo);
            }


            usuario.img = nombreArchivo;

            usuario.save((err, usuarioActualizado) => {

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de usuario actualizada',
                    usuarioActualizado: usuarioActualizado
                });

            });


        });

    }

    if (tipo === 'medicos') {

        Medico.findById(id, (err, medico) => {

            var pathViejo = './uploads/medicos/' + medico.img;

            // Si existe elimina la imagen vieja
            if (fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo);
            }


            medico.img = nombreArchivo;

            medico.save((err, medicoActualizado) => {

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de medico actualizada',
                    medicoActualizado: medicoActualizado
                });

            });


        });

    }

    if (tipo === 'hospitales') {

        Hospital.findById(id, (err, hospital) => {

            var pathViejo = './uploads/hospitales/' + hospital.img;

            // Si existe elimina la imagen vieja
            if (fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo);
            }


            hospital.img = nombreArchivo;

            hospital.save((err, hospitalActualizado) => {

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen del hospital actualizada',
                    hospitalActualizado: hospitalActualizado
                });

            });


        });

    }

}

module.exports = app;