import express from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import mongoose from 'mongoose';
import cors from 'cors';

const app = express();

import 'dotenv/config';

import authJwt from './helpers/jwt.js';
import errorHandler from './helpers/error-handler.js';

app.use(cors());
app.options('*',cors());

// Middlewares
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }))
app.use(morgan('tiny'));
app.use(authJwt());
app.use('/public/uploads', express.static( __dirname + '/public/uploads'));
app.use(errorHandler);

const api = process.env.API_URL;
import categoriesRoute from'./routes/categories';
import productRoute from'./routes/products';
import userRoute from'./routes/users';
import orderRoute from'./routes/orders';

// Routes

app.use(`${api}/products`, productRoute);
app.use(`${api}/categories`, categoriesRoute);
app.use(`${api}/users`, userRoute);
app.use(`${api}/orders`, orderRoute);

import dbConfig from'./config/database.config.js';

mongoose.Promise = global.Promise;

// Connecting to the database
mongoose.connect(dbConfig.url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false

}).then(() => {
    console.log("Successfully connected to the database");
}).catch(err => {
    console.log('Could not connect to the database. Exiting now...', err);
    process.exit();
});

// listen for requests
app.listen(3000, () => {
    console.log("Server is listening on port 3000");
});
