import ServiceReport from '../models/serviceReport';


const createServiceReport = async(req,res)=>{
    // Despues de pasar todas la validaciones
    try{
        const{idTechnician,idService,startService,endService} = req.body;
        
        //convertimos a fecha para porder operar con los datos
        let newStartService = new Date(startService),
            newEndService = new Date(endService);

       
        // funcion para agregar ceros
        let hourLeadingZero = num=>('0'+num).slice(-2);

        let srtStart =`${hourLeadingZero(newStartService.getMonth()+1)}/${hourLeadingZero(newStartService.getDate())}/${hourLeadingZero(newStartService.getFullYear())} ${hourLeadingZero(newStartService.getHours())}:${hourLeadingZero(newStartService.getMinutes())}:${hourLeadingZero(newStartService.getSeconds())}`;
        let srtEnd =`${hourLeadingZero(newEndService.getMonth()+1)}/${hourLeadingZero(newEndService.getDate())}/${hourLeadingZero(newEndService.getFullYear())} ${hourLeadingZero(newEndService.getHours())}:${hourLeadingZero(newEndService.getMinutes())}:${hourLeadingZero(newEndService.getSeconds())}`;
        
        // let srtStart =`${newStartService.getMonth()+1}/${newStartService.getDate()}/${newStartService.getFullYear()} ${newStartService.getHours()}:${newStartService.getMinutes()}:${newStartService.getSeconds()}`;
        // let srtEnd =`${newEndService.getMonth()+1}/${newEndService.getDate()}/${newEndService.getFullYear()} ${newEndService.getHours()}:${newEndService.getMinutes()}:${newEndService.getSeconds()}`;
        // console.log(strStart);

        // Cambiamos el formato a MM/dd/yyyy Hh:Mm:Ss antes de insertar en la bd
        
        newStartService = new Date(srtStart);
        newEndService = new Date(srtEnd);

        console.log(`Start ${newStartService}`);
        console.log(`End ${newEndService}`);
        
        const serviceReportDb =new ServiceReport({
            idTechnician,
            idService,
            startService: newStartService,
            endService: newEndService,
        });

        // primero revisamos si ya existe el reporte para ese servicio
        let resp = await ServiceReport.findOne({idTechnician,idService,startService:newStartService,endService:newEndService})
        
        if(resp){
            return res.status(400).json({
                ok:false,
                message: `El servicio ya se había reportado anteriormente`,
                service:resp
            })
        }
            
        // consultamos todos los servicios que ha hecho el tecnico
        
        resp = await ServiceReport.find({idTechnician});
        let flag = false;
        
        // en cada servicio miramos si la fecha
        resp.forEach(s => {
            if((newStartService > s.startService && newStartService < s.endService)||(newEndService > s.startService && newEndService < s.endService)){
                console.log("Ya habias trabajado en ese rango de tiempo")
                flag = true;
                return false;
            }
        });

        if(flag){
            return res.status(400).json({
                ok:false,
                message: `No es posible reportar un servicio en un mismo rango de tiempo en que ya ha trabajado`,
            })
        }
        
        
        await serviceReportDb.save();

        return res.status(200).json({
            ok:true,
            message: `Reporte de servicio técnico fue realizado con éxito`
        })

    }catch(err){
        return res.status(500).json({
            ok:false,
            err
        })
    }
}



export {createServiceReport}