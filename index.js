const express = require('express');
const app = express();
const mongoose = require('mongoose');
const authRoutes = require('./routes/userRoutes');
const dotenv = require('dotenv').config();
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bodyParser = require('body-parser');
const cors = require('cors');
const { JsonWebTokenError } = require('jsonwebtoken');

const {json, urlencoded} = express
// middlewares
app.use(cors({
    origin: ['http://localhost:3000'],
    credentials: true,
}))
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 60000*60
    }
}))
app.use(json({limit: '100mb'}));
app.use(urlencoded({limit: '100mb', extended: true}));
app.use(passport.initialize());
app.use(passport.session());



mongoose.connect(process.env.CONNECTION_STRING, {dbName: 'MFA'}).then(()=>{
    console.log('mongodb connected');
});
const {PORT} = process.env || 8000

app.use('/api/auth', authRoutes)
app.listen(PORT , ()=>{
    console.log(`Serveris running on port ${PORT}`);
})