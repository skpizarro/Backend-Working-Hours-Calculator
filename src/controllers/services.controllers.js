import ServiceReport from '../models/serviceReport';


const createServiceReport = async(req,res)=>{
    // Despues de pasar todas la validaciones
    try{
        const{idTechnician,idService,startService,endService} = req.body;
        
        const newStartService = new Date(startService),
            newEndService = new Date(endService)

        const serviceReportDb =new ServiceReport({
            idTechnician,
            idService,
            startService: newStartService,
            endService: newEndService,
        });

        await serviceReportDb.save();

        res.status(200).json({
            ok:true,
            message: `Reporte de servicio técnico fue realizado con éxito`
        })

    }catch(err){
        res.status(500).json({
            ok:false,
            err
        })
    }
}


export {createServiceReport}