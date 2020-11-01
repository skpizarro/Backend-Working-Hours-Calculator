import express from 'express';
import {check} from 'express-validator';
import {getWorkingHours} from '../controllers/calWorkHours.controllers'
import {validate} from '../middlewares/validations'

const router = express.Router();

router.get('/',validate([
    check('idTechnician','La identificación del técnico es requerida').notEmpty(),
    check('weekNumber','El número de la semana del año es requerido, debe ser un número entero entre (1 y 53)').isInt({min:1 , max:53})
]), getWorkingHours);

export default router;