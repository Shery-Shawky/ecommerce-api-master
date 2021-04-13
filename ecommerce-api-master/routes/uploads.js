const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const config = require('../config/config');
const crypto = require('crypto');
const path = require('path')
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const User = require('../models/userModel')
const Image = require('../models/imageModel')
const ImageChunk = require('../models/imageChunkModel')
const Product = require('../models/productModel')
const connection = require('../db-connection');
const { authenticate, adminAuthenticate } = require('../auth/user');

// Preparing a gridFS Storage to store files (images) in MongoDB
const storage = new GridFsStorage({
    url: config.mongoURL,
    file: (req, file) => {
        return new Promise((resolve, reject) => {
            crypto.randomBytes(16, (err, buf) => {
                if (err) {
                    return reject(err);
                }
                const filename = buf.toString('hex') + path.extname(file.originalname);
                const fileInfo = {
                    filename: filename,
                    bucketName: 'uploads'
                };
                resolve(fileInfo);
            });
        });
    }
})
const upload = multer({ storage });
let gfs;
connection.once('open', () => {
    gfs = Grid(connection.db, mongoose.mongo)
    gfs.collection('uploads')
});

// POST the profile image
router.post('/user', authenticate, upload.single('image'), async (req, res) => {
    try {
        let { _id } = req.signData;
        let image = await Image.findOne({ filename: req.file.filename });
        let user = await User.findOneAndUpdate({ _id }, { profileImage: image.filename }, {
            new: true
        }).exec();
        res.status(200).send({ user, image, message: "Uploaded successfully", success: true })
    } catch (error) {
        res.status(404).send({ error, message: "Unable to upload", success: false })
    }
})

// POST the product image
router.post('/product/:productId', authenticate, adminAuthenticate, upload.single('image'), async (req, res) => {
    try {
        let { filename } = req.file;
        let { productId } = req.params;
        let image = await Image.findOne({ filename: req.file.filename });
        let date = new Date(image.uploadDate)
        let product = await Product.findOneAndUpdate({ _id:productId }, { image: image.filename }, {
            new: true
        }).exec()
        res.status(200).send({ product, image, message: "Uploaded successfully", success: true })
    } catch (error) {
        res.status(404).send({ error, message: "Unable to upload", success: false })
    }
})

//To get and show any image
router.get('/show/:filename', (req, res) => {
    gfs.files.find({ filename: req.params.filename }).toArray((err, file) => {
        if (!file[0] || file[0].length === 0) {
            return res.status(404).send({ err: 'No file exists' })
        }
        if (file[0].contentType === 'image/jpeg' || file[0].contentType === 'img/png') {
            // read output
            const readstream = gfs.createReadStream(file[0].filename);
            readstream.pipe(res)
        } else {
            res.status(404).send({ err: 'No and image' })
        }
    })
})

router.delete('/delete/:_id', authenticate, (req, res) => {
    let { _id } = req.params;
    gfs.remove({ _id, root: 'uploads' }, (err, gridStore) => {
        if (err) {
            return res.status(404).send({ err })
        }
        res.status(200).send({ success: true, message: "Image was deleted successfully" })
    })
})





module.exports = router;