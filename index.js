const express = require('express');
const http = require('http');
const mongoose = require('mongoose');

const app = express();
const server = http.createServer(app);

app.use(express.json());
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

const MONGO_URI = "mongodb+srv://garciavalenzuelajoel_db_user:o7rzS3fzjfVtIeaB@newt.pifb1t5.mongodb.net/GremioDB?retryWrites=true&w=majority";
const SHEETDB_URL = "https://sheetdb.io/api/v1/dzln6qkj7w4on?sheet=Halloween";

// --- ESQUEMA DE JUGADORES ---
const jugadorSchema = new mongoose.Schema({
    idSocket: String,
    nombre: String,
    foto: String,
    poder: Number,
    ultimaConexion: { type: Date, default: Date.now }
});
const Jugador = mongoose.model('JugadorRuleta', jugadorSchema);

// --- ESQUEMA DE RETOS ---
const retoSchema = new mongoose.Schema({
    retadorId: String,
    retadorNombre: String,
    oponenteId: String,
    oponenteNombre: String,
    apuesta: Number,
    estado: { type: String, default: 'pendiente' } 
});
const Reto = mongoose.model('Reto', retoSchema);

// --- ESQUEMA DE LA MESA COMPARTIDA ---
const partidaSchema = new mongoose.Schema({
    jugador1Id: String,
    jugador1Nombre: String,
    jugador2Id: String,
    jugador2Nombre: String,
    apuesta: Number,
    estadoMesa: Object
});
const Partida = mongoose.model('Partida', partidaSchema);

// Entrar al lobby
app.post('/api/entrar', async (req, res) => {
    try {
        const { idSocket, nombre, foto, poder } = req.body;
        await Jugador.findOneAndUpdate(
            { idSocket },
            { nombre, foto, poder, ultimaConexion: Date.now() },
            { upsert: true, returnDocument: 'after' } 
        );
        await Jugador.deleteMany({ ultimaConexion: { $lt: new Date(Date.now() - 10000) } });
        const todos = await Jugador.find({});
        res.json(todos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Enviar un desafío inicial
app.post('/api/retar', async (req, res) => {
    try {
        const { retadorId, retadorNombre, oponenteId, oponenteNombre, apuesta } = req.body;
        await Reto.deleteMany({ retadorId, oponenteId });
        await Reto.deleteMany({ retadorId: oponenteId, oponenteId: retadorId }); 
        
        const nuevoReto = new Reto({ retadorId, retadorNombre, oponenteId, oponenteNombre, apuesta });
        await nuevoReto.save();
        res.json({ success: true, reto: nuevoReto });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Revisar mis retos
app.get('/api/retos/:id', async (req, res) => {
    try {
        const miId = req.params.id;
        const retoEntrante = await Reto.findOne({ oponenteId: miId, estado: 'pendiente' });
        const miReto = await Reto.findOne({ retadorId: miId });
        res.json({ entrante: retoEntrante, miReto: miReto });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Aceptar, rechazar o mandar CONTRAOFERTA
app.post('/api/responder-reto', async (req, res) => {
    try {
        const { retoId, respuesta, nuevaApuesta, nuevoRetadorId, nuevoRetadorNombre, nuevoOponenteId, nuevoOponenteNombre } = req.body; 
        
        if (respuesta === 'borrado') {
            await Reto.findByIdAndDelete(retoId);
        } else if (respuesta === 'contraoferta') {
            await Reto.findByIdAndUpdate(retoId, { 
                retadorId: nuevoRetadorId, 
                retadorNombre: nuevoRetadorNombre,
                oponenteId: nuevoOponenteId,
                oponenteNombre: nuevoOponenteNombre,
                apuesta: nuevaApuesta,
                estado: 'pendiente' 
            });
        } else if (respuesta === 'aceptado') {
            const reto = await Reto.findById(retoId);
            if (reto) {
                await Partida.deleteMany({ $or: [{jugador1Id: reto.retadorId}, {jugador2Id: reto.retadorId}, {jugador1Id: reto.oponenteId}, {jugador2Id: reto.oponenteId}] });
                
                const estadoInicial = {
                    turnoDe: reto.retadorId,
                    vidasJ1: 5,
                    vidasJ2: 5,
                    platillosAbiertos: [],
                    platilloVeneno: Math.floor(Math.random() * 5),
                    ultimoClic: -1
                };

                const nuevaPartida = new Partida({
                    jugador1Id: reto.retadorId,
                    jugador1Nombre: reto.retadorNombre,
                    jugador2Id: reto.oponenteId,
                    jugador2Nombre: reto.oponenteNombre,
                    apuesta: reto.apuesta,
                    estadoMesa: estadoInicial
                });
                await nuevaPartida.save();
                await Reto.findByIdAndUpdate(retoId, { estado: 'aceptado' });
            }
        } else {
            await Reto.findByIdAndUpdate(retoId, { estado: respuesta });
        }
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- ENDPOINTS DE LA MESA COMPARTIDA ---
app.get('/api/partida/:id', async (req, res) => {
    try {
        const p = await Partida.findOne({ $or: [{jugador1Id: req.params.id}, {jugador2Id: req.params.id}] });
        res.json(p);
    } catch(e) { res.status(500).json({error: e.message}); }
});

app.post('/api/actualizar-partida', async (req, res) => {
    try {
        const { partidaId, estadoMesa } = req.body;
        await Partida.findByIdAndUpdate(partidaId, { estadoMesa });
        res.json({ success: true });
    } catch(e) { res.status(500).json({error: e.message}); }
});

// TERMINAR PARTIDA Y ACTUALIZAR LA COLUMNA "Apuesta" EN GOOGLE SHEETS
app.post('/api/terminar-partida', async (req, res) => {
    try {
        const { partidaId, ganadorId } = req.body;
        const partida = await Partida.findById(partidaId);

        if (partida) {
            const esJ1Ganador = (partida.jugador1Id === ganadorId);
            const ganadorNombre = esJ1Ganador ? partida.jugador1Nombre : partida.jugador2Nombre;
            const perdedorNombre = esJ1Ganador ? partida.jugador2Nombre : partida.jugador1Nombre;
            const apuesta = partida.apuesta || 0;

            console.log(`🎮 Finalizando partida. Ganador: ${ganedorNombre} (+${apuesta}), Perdedor: ${perdedorNombre} (-${apuesta})`);

            // 1. Obtener todos los datos de SheetDB
            const response = await fetch(SHEETDB_URL);
            const rows = await response.json();

            // 2. Buscar las filas correspondientes
            let idxGanador = rows.findIndex(r => r.Nombre && r.Nombre.toLowerCase().trim() === ganadorNombre.toLowerCase().trim());
            let idxPerdedor = rows.findIndex(r => r.Nombre && r.Nombre.toLowerCase().trim() === perdedorNombre.toLowerCase().trim());

            if (idxGanador !== -1 && idxPerdedor !== -1) {
                let filaG = rows[idxGanador];
                let filaP = rows[idxPerdedor];

                let nuevaApuestaGanador = parseInt(filaG.Apuesta || 0) + apuesta;
                let nuevaApuestaPerdedor = Math.max(0, parseInt(filaP.Apuesta || 0) - apuesta);

                // 3. Actualizar al Ganador en la columna Apuesta
                await fetch(`${SHEETDB_URL}/Nombre/${encodeURIComponent(filaG.Nombre)}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ Apuesta: nuevaApuestaGanador })
                });

                // 4. Actualizar al Perdedor en la columna Apuesta
                await fetch(`${SHEETDB_URL}/Nombre/${encodeURIComponent(filaP.Nombre)}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ Apuesta: nuevaApuestaPerdedor })
                });

                console.log(`✅ Google Sheets actualizado en la columna Apuesta para ${filaG.Nombre} y ${filaP.Nombre}`);
            } else {
                console.log("⚠️ No se encontraron los nombres exactos en la hoja de Google Sheets.");
            }

            await Partida.findByIdAndDelete(partidaId);
        }
        res.json({ success: true });
    } catch(e) { 
        console.error("🔴 Error en /api/terminar-partida:", e.message);
        res.status(500).json({error: e.message}); 
    }
});

const PORT = process.env.PORT || 4000;

mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 })
.then(() => {
    console.log('🟢 Conectado a MongoDB Atlas exitosamente.');
    server.listen(PORT, '127.0.0.1', () => {
        console.log(`🚀 Servidor API activo en el puerto ${PORT}`);
    });
})
.catch(err => {
    console.error('🔴 Error conectando a MongoDB:', err.message);
});