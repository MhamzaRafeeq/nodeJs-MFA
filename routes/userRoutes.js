const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../Schema/userSchema');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const speakeasy = require('speakeasy');
const qrCode = require('qrcode');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv').config();
// most important use of passport.js is that if user is logged in successfully
// then it returns user object with request and this req.user can be
// used to check that user is logged in or not

passport.use(new LocalStrategy(async (username, password, done) => {
    try {
        const user = await User.findOne({ username });
        if (!user) {
            //done is similar as next in middlewares
            //done(error, userObject, {message})
            return done(null, false, { message: "user not found" })
        }
        const matchPassword = await bcrypt.compare(password, user.password);
        if (!matchPassword) {
            return done(null, false, { message: " password is incorrect" })
        }
        return done(null, user);
    } catch (error) {
        done(error, false);
    }
}))

passport.serializeUser((user, done) => {
    console.log('we are inside serialize user');
    done(null, user._id);
});

passport.deserializeUser(async (_id, done) => {
    try {
        console.log('we are inside deserialize user');
        const user = await User.findById(_id);
        done(null, user)

    } catch (error) {
        done(error)

    }

});

// Route for register
router.post('/register', async (req, res) => {

    try {
        const { username, email, password } = req.body;
        const existingUser = await User.findOne({ email })
        if (!existingUser) {
            const hashedPassword = await bcrypt.hash(password, 10)
            const createdUser = { username, email, password: hashedPassword }
            const newUser = User(createdUser);
            const userInMongoDB = await newUser.save();
            res.status(201).json({ message: 'User Authenticated', user: userInMongoDB });
        } else {
            res.send('User already present')
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'User could not be created' })
    }

})
// Route for login

router.post('/login', passport.authenticate('local'), async (req, res) => {
    console.log('The authenticated user is : ', req.user);

    if (req.user) {
        res.status(200).json({
            message: "User Aunthenticated",
            username: req.user.username,
            isMfaActive: req.user.isMfaActive
        });
    } else {
        res.status(401).json('Unauthorized User');
    }
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

router.get('/status', async (req, res) => {
    if (req.user) {
        res.status(200).json({
            message: "User Aunthenticated",
            username: req.user.username,
            isMfaActive: req.user.isMfaActive
        })
    } else {
        res.status(201).json({ message: 'Unauthorized user' })
    }

})
// Route for logout
router.post('/logout', async (req, res) => {
    if (!req.user) {
        res.status(201).json({ message: 'Unauthorized user' })
    }
    req.logout((err) => {
        if (err) {
            return res.status(400).json({
                message: 'user not logged in'
            })
        }
        res.status(200).json({
            message: 'user logged out successfully'
        })
    })

})
// Route for 2fa setup
router.post('/2fa/setup', (req, res, next) => {
    if (req.isAuthenticated) {
        res.json({ message: 'user is authenticated' })
    } else {
        res.status(404).json({ message: 'User Unauthenticated' })
    }
}, async (req, res) => {
    try {
        console.log('req.user is', req.user);
        const user = req.user;
        var secret = speakeasy.generateSecret();
        console.log('secret object is stored in', secret)
        user.twoFactorSecret = secret.base32;
        user.isMfaActive = true
        await user.save();
        const url = speakeasy.otpauthURL({
            secret: secret.base32,
            label: `${req.user.username}`,
            issuer: 'hamza.com',
            encoding: 'base32'

        })
        const qrImageUrl = await qrCode.toDataURl(url);


        res.status(200).json({
            secret: secret.base32,
            qrCode: qrImageUrl
        })

    } catch (error) {
        res.status(500).json({ message: "Error while setting up 2fa" })
    }

})
// Route for 2fa verify
router.post('/2fa/verify', async (req, res) => {
const {token} = req.body;
const user = req.user;
const verified = speakeasy.totp.verify({
    secret: user.twoFactorSecret,
    encoding: 'base32',
    token,
});
if(verified){
    const jwtToken = jwt.sign(
        {username: user.username},
        process.env.JWT_SECRET,
        {expiresIn: '1hr'}
    )
    res.status(200).json({message: '2FA successful', token: jwtToken,})
}else{
    res.status(400).json({message: 'invalid token'})
}

})
// Route for 2fa reset
router.post('/2fa/reset', async (req, res) => {
try {
    const user = req.user;
    user.twoFactorSecret = '';
    user.isMfaActive = false;
    await user.save();
    console.log('2FA reset is  successful')
} catch (error) {
    
}
})


module.exports = router;