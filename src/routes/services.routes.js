import express from 'express';
import {check} from 'express-validator';
import {createServiceReport} from '../controllers/services.controllers'
import {validate,validDate} from '../middlewares/validations';
import moment from 'moment'


const router = express.Router();


router.post('/report',validate([
    check('idTechnician','La identificación del técnico es requerida').notEmpty(),
    check('idService','La identificación del servicio es requerida').notEmpty(),
    check('startService','La fecha de inicio del servicio es requerida').notEmpty(),
    check('endService','La fecha fin del servicio es requerida').notEmpty(),
    check(['startService','endService']).custom((value,{req})=>validDate(value,req)) // fecha valida
]),createServiceReport);


export default router;