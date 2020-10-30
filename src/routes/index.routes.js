import express from 'express';
import servicesRoutes from './services.routes';
import calculateRoutes from './calculateWorkingHours.routes';


const app = express();

app.use('/services',servicesRoutes);
app.use('/calculate',calculateRoutes);


export default app;