var express = require('express');

var app = express();

var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');

// =====================================
// Busqueda por collecion
// =====================================
app.get('/coleccion/:tabla/:busqueda', (req, res) => {

    var tabla = req.params.tabla;
    var busqueda = req.params.busqueda;
    var regex = new RegExp(busqueda, 'i');


    if (tabla == 'usuarios') {
        buscarUsuarios(busqueda, regex)
            .then(respuestas => {
                res.status(200).json({
                    ok: true,
                    usuarios: respuestas
                });
            });
    } else if (tabla == 'medicos') {
        buscarMedicos(busqueda, regex)
            .then(respuestas => {
                res.status(200).json({
                    ok: true,
                    medicos: respuestas
                });
            });
    } else if (tabla == 'hospitales') {
        buscarHospitales(busqueda, regex)
            .then(respuestas => {
                res.status(200).json({
                    ok: true,
                    hospitales: respuestas
                });
            });
    } else {
        return res.status(400).json({
            ok: false,
            mensaje: 'Los tipos de busqueda solo son: usuario, medico y hospitales'
        });
    }


});

// =====================================
// Busqueda general
// =====================================
app.get('/todo/:busqueda', (req, res, next) => {

    var busqueda = req.params.busqueda;
    var regex = new RegExp(busqueda, 'i');


    Promise.all([
            buscarHospitales(busqueda, regex),
            buscarMedicos(busqueda, regex),
            buscarUsuarios(busqueda, regex)
        ])
        .then(respuestas => {
            res.status(200).json({
                ok: true,
                hospitales: respuestas[0],
                medicos: respuestas[1],
                usuarios: respuestas[2]
            });
        });


});

function buscarHospitales(busqueda, regex) {

    return new Promise((resolve, reject) => {

        Hospital.find({ nombre: regex })
            .populate('usuario', 'nombre email')
            .exec((err, hospitales) => {

                if (err) {
                    reject('Error al cargar hospitales');
                } else {
                    resolve(hospitales);
                }

            });

    });

}

function buscarMedicos(busqueda, regex) {

    return new Promise((resolve, reject) => {

        Medico.find({ nombre: regex })
            .populate('usuario', 'nombre email')
            .populate('hospital')
            .exec((err, medicos) => {

                if (err) {
                    reject('Error al cargar hospitales');
                } else {
                    resolve(medicos);
                }

            });

    });

}

function buscarUsuarios(busqueda, regex) {

    return new Promise((resolve, reject) => {

        Usuario.find({}, 'nombre email role')
            .or([{ 'nombre': regex }, { 'email': regex }])
            .exec((err, usuarios) => {
                if (err) {
                    reject('error al cargar los usuarios', err);
                } else {
                    resolve(usuarios);
                }
            });

    });

}

module.exports = app;