const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const mongoose = require('mongoose')
module.exports.authenticate = (req, res, next) => {
    try {
        let { authorization } = req.headers;

        authorization = authorization.split(' ');
        if(authorization.length == 2){
            authorization = authorization[1];
        } else {
            authorization = authorization[0];
        }
        const signData = jwt.verify(authorization, 'the-attack-titan');
        req.signData = signData;
        next();
    } catch (error) {
        res.status(401).send({ success: false, error: "User Authorization failed" });
    }
}
module.exports.adminAuthenticate = async (req, res, next) => {
    try {
        let _id = req.signData._id;

        _id = mongoose.Types.ObjectId(_id)

        let user = await User.findById({ _id });
        if(!user){
            return res.status(404).send({message:"no user found", success:false})
        }
        if (!user.isAdmin) {
            return res.status(401).send({ success: false, message: "Admin Authentication failed" })
        } 
        next()
    } catch (error) {
        res.status(404).send({ success: false, error, message: "Admin Authentication failed" })
    }
}