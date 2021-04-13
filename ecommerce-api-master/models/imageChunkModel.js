const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const imageChunkSchema = Schema({
    
},
{collection:'uploads.chunks'}
)

const ImageChunk = mongoose.model('ImageChunk', imageChunkSchema);

module.exports = ImageChunk
