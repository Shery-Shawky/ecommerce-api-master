const express = require('express');
const cors = require('cors');
const methodOverride = require('method-override');
const app = express();
const port = 3000;
app.use(cors()) // enable it for all routes
const bodyParser = require('body-parser')
require('./db-connection');
app.use(bodyParser.json({
    limit:'50mb'
}));

app.use(bodyParser.urlencoded({
    limit: '50mb',
    parameterLimit: 100000,
    extended: true
}));
app.use(express.json());

app.use(methodOverride('_method'))

app.use(express.static('public'))


const users = require('./routes/users');
const uploads = require('./routes/uploads');
const products = require('./routes/products');
const orders = require('./routes/orders');


app.use((req, res, next) => {
    const requestDate = Date.now();
    console.log({ method: req.method, URL: req.url, Time: requestDate });
    next()
})
// ------------ Routes -------------------------------------------------------------------------------

app.use('/api/users', users);
app.use('/api/images', uploads);
app.use('/api/products', products);
app.use('/api/orders', orders);

//----------------------------------------------------------------------------------------------------

app.use(function (err, req, res, next) {
    console.error(err.stack)
    res.status(500).send('Something broke!')
})

app.listen(process.env.PORT || port, () => {
    console.log(`Server is listening on http://localhost:${port}/`);
})
