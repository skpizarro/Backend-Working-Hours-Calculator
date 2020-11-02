import ServiceReport from '../models/serviceReport'
import {calculate} from './calculateMethods'

const getWorkingHours = async(req,res)=>{
    try{
        const {idTechnician,weekNumber}=req.query;

        // Consultamos todos los servicios realizados por el técnico
        const services = await ServiceReport.find({idTechnician});
        
        // Ejecuta los calculos
        const workingH = calculate(services,weekNumber);
        
        res.status(200).json({
            ok:true,
            workingH
        })
    }catch(err){
        res.status(500).json({
            ok:false,
            err
        })
    }
}

export {getWorkingHours};