import express from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from "dotenv"
import { dbConfig } from'./config/database.config.js';

import { categoriesRoute } from'./routes/categories.js';
import { productRoute } from'./routes/products.js';
import { userRoute } from'./routes/users.js';
import { orderRoute } from'./routes/orders.js';

dotenv.config()
const PORT = process.env.PORT || 3000
const app = express();

import { authJwt } from './helpers/jwt.js';
import { errorHandler } from './helpers/error-handler.js';

app.use(cors());
app.options('*',cors());

// Middlewares
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }))
app.use(morgan('tiny'));
app.use(authJwt());
app.use('/public/uploads', express.static('/public/uploads'));
app.use(errorHandler);

const api = process.env.API_URL;

// Routes
app.use(`${api}/products`, productRoute);
app.use(`${api}/categories`, categoriesRoute);
app.use(`${api}/users`, userRoute);
app.use(`${api}/orders`, orderRoute);

mongoose.Promise = global.Promise;

// Connecting to the database
mongoose.connect(dbConfig.url, {
    dbName: dbConfig.dbName,
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
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
