import express from 'express';
import { check } from 'express-validator';
import {createServiceReport} from '../controllers/services.controllers'
import {validate} from '../middlewares/validations';

const router = express.Router();


router.post('/report',validate([
    check('idTechnician','La identificación del técnico es requerida').notEmpty(),
    check('idService','La identificación del servicio es requerida').notEmpty(),
    check(['startService','endService']).notEmpty().custom((value)=>{
        // dd/MM/yyyy HH:mm:ss
        // dd-MM-yyyy HH:mm:ss
        const newDate = new Date(value);
        if(value != undefined && value != ''){
            const matchDate = value.match(/^((\d{2}|\d{4})[\/|\.|-](\d{2})[\/|\.|-](\d{4}|\d{2}) (\d{2}):(\d{2}):(\d{2}))$/);
            if(!matchDate) throw new Error('Fecha invalida');
        }
        return true;
    })
]),createServiceReport);


export default router;