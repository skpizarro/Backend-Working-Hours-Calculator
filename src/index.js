import express from 'express';
import logger from 'morgan'
import config from './config/config';
import routes from './routes/index.routes'


const app = express();

// Settings
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


//Routes
app.use(routes);




app.listen(process.env.PORT,()=>{
    console.log(`Server on port ${process.env.PORT}`)
})