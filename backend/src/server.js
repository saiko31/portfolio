const express = require('express');
const path = require('path');
const app = express();
const serverStartTime = Date.now();



app.use(express.static(path.join(__dirname, "..","..","/site")));
//Database logic

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});


app.get('/stats', (req,res) =>{
    //Esto es temporal, somo como prueba, despues esta fecha se guardara en una base de datos junto con las otras estadisticas
    res.status(200).send(serverStartTime.toString());
})

app.get('/files/resume' ,(req,res)=>{
    const filePath = path.join(__dirname, "..", './private/resume.pdf');
    res.sendFile(filePath);
});



const port = 8080;
app.listen(port, () => {
    console.log(`Server initialized at port ${port}.`);
});