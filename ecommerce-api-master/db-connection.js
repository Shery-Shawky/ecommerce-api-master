const config = require('./config/config');
const mongoose = require('mongoose');

mongoose.connect(config.mongoURL, {
    useUnifiedTopology: true,
    useNewUrlParser: true, 
    useFindAndModify:false,
    useCreateIndex:true,
});
const connection = mongoose.connection;

module.exports = connection;


