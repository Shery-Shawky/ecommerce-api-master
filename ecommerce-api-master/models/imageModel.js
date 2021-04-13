const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const imageSchema = Schema({
    length:{
        type:Number,
    },
    chunkSize:{
        type:Number
    },
    uploadDate:{
        type:Date
    },
    filename:{
        type:String
    },
    md5:{
        type:String
    },
    contentType:{
        type:String
    }
},
{collection:'uploads.files'}
)

const Image = mongoose.model('Image', imageSchema);

module.exports = Image
