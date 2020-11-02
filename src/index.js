import express from 'express';
import logger from 'morgan'
import config from './config/config';
import mongo from './config/db/index'
import routes from './routes/index.routes'
import cors from 'cors'

const app = express();

// Settings
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(cors());
//Routes
app.use(routes);


app.listen(process.env.PORT,()=>{
    console.log(`Server on port ${process.env.PORT}`)
})