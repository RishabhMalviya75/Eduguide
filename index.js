const express = require('express');

const app = express();


app.get("/" , (req , res) =>{
    res.send("welcome to eduguide");
})

const PORT = 3000;


app.listen(PORT, () => {
    console.log(`server running on http://localhost:${PORT}`)
})