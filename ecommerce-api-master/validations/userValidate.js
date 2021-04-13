const User = require('../models/userModel')
const validate = (req, res, next) => {
    const { email } = req.body;
    if (typeof email !== "string") {
        res.status(401).send({ error: "invalid email or password" })
        return
    }
    next();
}
const userValidate = (req, res, next) => {
    const user = req.body
    console.log(user)
    const regex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g;
    const found = user.email.match(regex); 
    if (user.email && typeof user.email !== "string" && found) {
        res.status(400).send({ message: 'invalid email', valid: false })
        return
    }
    if (user.password && typeof user.password !== "string") {
        res.status(400).send({ message: 'invalid password', valid: false })
        return
    }
    if (user.fullName && typeof user.fullName !== "string") {
        res.status(400).send({ message: 'invalid full name', valid: false })
        return
    } else if (user.fullName) {
        if (user.fullName.length < 3 || user.fullName.length > 15) {
            res.status(400).send({ message: 'invalid full name', valid: false })
            return
        }
    }
    if (user.age && user.age < 13) {
        res.status(400).send({ message: 'invalid age', valid: false })
        return
    }
    next()
}
module.exports = { validate, userValidate }