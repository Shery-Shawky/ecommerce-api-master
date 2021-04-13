const config ={
    mongoURL:process.env.MONGO_DB || 'mongodb://localhost:27017/amnesia-ecommerce'
}

module.exports  = config;