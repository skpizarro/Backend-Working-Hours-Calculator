import ServiceReport from '../models/serviceReport';


const createServiceReport = async(req,res)=>{
    // Despues de pasar todas la validaciones
    try{
        const{idTechnician,idService,startService,endService} = req.body;
        
        const newStartService = new Date(startService),
            newEndService = new Date(endService)

        const serviceReportDb ={
            idTechnician,
            idService,
            startService: newStartService,
            endService: newEndService
        }

        await ServiceReport.create(serviceReportDb);

        res.status(200).json({
            ok:true,
            message: `Reporte de servicio fue realizado con exito`
        })

    }catch(err){
        res.status(500).json({
            ok:false,
            err
        })
    }
}


export {createServiceReport}