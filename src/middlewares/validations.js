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



export {validate}