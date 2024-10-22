const express = require('express');
const app = express();
const mongoose = require('mongoose');
const router = require('./routes/userRoutes');
const dotenv = require('dotenv').config();


app.use(express.json());

mongoose.connect(process.env.CONNECTION_STRING, {dbName: 'MFA'}).then(()=>{
    console.log('mongodb connected');
});
const {PORT} = process.env || 8000

app.use('/api', router)
app.listen(PORT , ()=>{
    console.log(`Serveris running on port ${PORT}`);
})