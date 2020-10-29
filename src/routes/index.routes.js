import express from 'express';
import servicesRoutes from './services.routes';


const app = express();

app.use('/services',servicesRoutes);


export default app;