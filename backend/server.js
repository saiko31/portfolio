const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
    next();
});

app.get('/files/resume' ,(req,res)=>{
    const filePath = path.join(__dirname, './private/resume.pdf');
    const fileName = 'Alexander San Agustin Melendez_Resume.pdf'

    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.sendFile(filePath);
});

app.listen(port, () => {
    console.log("Server initialized at port 3000.");
});