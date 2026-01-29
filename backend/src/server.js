const express = require('express');
const path = require('path');
const cors = require('cors');
const db = require('./database');
const crypto = require('crypto');

const app = express();

app.use((req, res, next) => {
    console.log(`📢 Petición recibida: ${req.method} ${req.url}`);
    next();
});

app.set('trust proxy', true);

const serverStartTime = Date.now();



app.use(cors({
    origin: 'https://asanagus.me' 
}));

app.use(express.static(path.join(__dirname, "..","..","/site")));

app.get('/api/stats', async (req,res) =>{
    const ipHash = getHashedIP(req);
    const today = new Date().toISOString().split('T')[0];

    try {
        // 1. Registrar la visita (si es nueva hoy)
        await db.execute(`
            INSERT INTO log_visits (ip_hash, visit_date) 
            VALUES (?, ?) 
            ON DUPLICATE KEY UPDATE id=id
        `, [ipHash, today]);

        // 2. Obtener los conteos (Total y Hoy)
        const [[totalRes]] = await db.execute('SELECT COUNT(*) as count FROM log_visits');
        const [[todayRes]] = await db.execute('SELECT COUNT(*) as count FROM log_visits WHERE visit_date = ?', [today]);

        // 3. Respuesta completa para el frontend
        res.json({
            success: true,
            status: "online",
            uptime: serverStartTime, // Mantenemos el uptime que tenías en stats
            totalVisits: totalRes.count,
            todayVisits: todayRes.count
        });
        //console.log("json enviado");
    }catch(Err){
        res.status(500).json({error: "Database connection failed"});
    }

});

// Resume logic

app.get('/files/resume' ,(req,res)=>{
    const filePath = path.join(__dirname, "..", './private/resume.pdf');
    res.download(filePath, 'Alexander San Agustin - Resume.pdf', (err) => {
        if(err){
            console.error("Error getting archive:", err);
            res.status(404).send("file not found");
        }
    })
});

// IP retreive logic
function getHashedIP(req){
    const rawIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    const salt = 'm0015d09613cb';

    return crypto.createHash('sha256').update(rawIP + salt).digest('hex');
}



const port = 8080;
app.listen(port, () => {
    console.log(`Server initialized at port ${port}.`);
    console.log(`Local: http://localhost:${port}`);
});