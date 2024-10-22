const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../Schema/userSchema');


router.post('/register', async (req, res) => {

    try {
        const { userName, email, password } = req.body;
        const existingUser = await User.findOne({email})
        if (existingUser) {
            res.send('user already present')
        } else {

            const hashedPassword = await bcrypt.hash(password, 10)
            const createdUser = { userName, email, password: hashedPassword }
            const newUser = User(createdUser);
            const userInMongoDB = await newUser.save();
            res.status(201).json({ message: 'user created successfully', user: userInMongoDB });
        }




    } catch (error) {
        console.error(error);
        res.status(400).json({ error: 'user could not created' })
    }

})

router.post('/login', async (req, res) => {

    try {
        const { email, password } = req.body;
        const existingUser = await User.findOne({email})
        if (existingUser) {
            const decyptedPassword = await bcrypt.compare(password, existingUser.password)
            if (decyptedPassword) {
                res.status(200).json({
                    message: 'user logged in succesfully',
                    loggedInUser: existingUser
                })

            } else {
                res.send('password incorrect')
            }
        } else {

            res.send('user is not registered')





        }




    } catch (error) {
        console.error(error);
        res.status(400).json({ error: 'user could not created' })
    }

})

module.exports = router;