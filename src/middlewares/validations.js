const { validationResult } = require("express-validator");

const validate = validations =>{
    return async (req,res,next) =>{
        await Promise.all(validations.map(v => v.run(req)));
        
        const errors = validationResult(req);

        if(errors.isEmpty()){
            return next(); // Continue
        }

        res.status(400).json({
            ok:false,
            errors: errors.array()
        })
    }
}

const validDate = (value,req) =>{
    return validFormat(value,req);
    
}

const validFormat =(value,req)=>{
    if(value != undefined && value != ''){
        console.log(value)
        const matchDate = value.match(/^((\d{2}|\d{4})[\/|\.|-](\d{2})[\/|\.|-](\d{4}|\d{2}) (\d{2}):(\d{2}):(\d{2}))$/);
        if(!matchDate) throw new Error('Formato de Fecha invalida -> dd/MM/yyyy HH:mm:ss  o dd-MM-yyyy HH:mm:ss');
        
        if(value === req.body.startService)startEndDateValidation(req);
    }
    return true;
}

const startEndDateValidation = req =>{
    const {startService,endService} = req.body,
        startS = new Date(startService),
        endS = new Date(endService);
    if(startS >= endS) throw new Error('La fecha de inicio del servicio no puede ser mayor que la fecha fin del servicio');
    return true;
}


export {validate,validDate}