const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../Schema/userSchema');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

passport.use(new LocalStrategy( async (userName, password, done)=>{
    try {
        const user = await User.findOne({userName});
        if(!user){
            //done is similar as next in middlewares
            //done(error, userObject, {message})
            return done(null, false, {message: "user not found"})
        }
        const matchPassword = await bcrypt.compare(password, user.password);
        if(!matchPassword){
            return done(null, false, {message : " password is incorrect"})
        }
        return done(null, user);
    } catch (error) {
        done(error, false);
    }
}))

passport.serializeUser((user, done)=>{
    done(null, user._id);
});

// Route for register
router.post('/register', async (req, res) => {

    try {
        const { userName, email, password } = req.body;
        const existingUser = await User.findOne({ email })
        if (existingUser) {
            res.send('user already present')
        } else {

            const hashedPassword = await bcrypt.hash(password, 10)
            const createdUser = { userName, email, password: hashedPassword }
            const newUser = User(createdUser);
            const userInMongoDB = await newUser.save();
            res.status(201).json({ message: 'user created successfully', user: userInMongoDB, errMessage: error });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'user could not created' })
    }

})
// Route for login

router.post('/login', passport.authenticate('local') , async (req, res) => {
    console.log('The authenticated user is : ' , req.user);
    res.status(200).json({
        message: "user Logged in successfully",
        userName: req.user.userName,
        isMfaActive: req.user.isMfaActive
    }) 
// this part is done in passport.js local authentication
    // try {
    //     const { email, password } = req.body;
    //     const existingUser = await User.findOne({ email })
    //     if (existingUser) {
    //         const decyptedPassword = await bcrypt.compare(password, existingUser.password)
    //         if (decyptedPassword) {
    //             res.status(200).json({
    //                 message: 'user logged in succesfully',
    //                 loggedInUser: existingUser
    //             })

    //         } else {
    //             res.send('password incorrect')
    //         }
    //     } else {

    //         res.send('user is not registered')
    //     }




    // } catch (error) {
    //     console.error(error);
    //     res.status(400).json({ error: 'user could not created' })
    // }

})
// Route for Auth Status

router.get('/status', async(req, res)=>{

})
// Route for logout
router.post('/logout', async(req, res)=>{
    
})
// Route for 2fa setup
router.post('/2fa/setup', async(req, res)=>{

})
// Route for 2fa verify
router.post('/2fa/verify', async(req, res)=>{

})
// Route for 2fa reset
router.post('/2fa/reset', async(req, res)=>{

})


module.exports = router;