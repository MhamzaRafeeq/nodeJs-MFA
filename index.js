const express = require('express');
const app = express();
const mongoose = require('mongoose');
const dotenv = require('dotenv').config();

mongoose.connect(process.env.CONNECTION_STRING, {dbName: 'MFA'}).then(()=>{
    console.log('mongodb connected');
});
const {PORT} = process.env || 8000
app.listen(PORT , ()=>{
    console.log(`Serveris running on port ${PORT}`);
})