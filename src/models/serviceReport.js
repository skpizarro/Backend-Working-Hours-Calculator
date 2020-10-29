import mongoose, { Schema } from 'mongoose';


let serviceReportSchema= new Schema({
    idTechnician: {
        type: String,
        required :[true,`The technician's id is required`]
    },
    idService:{
        type: String,
        required: [true, `The service id is required`]
    },
    startService:{
        type: Date,
        required: [true,`Start date is required`]
    },
    endService:{
        type: Date,
        required: [true,`End date is required`]
    }
    // startService:{
    //     date:{
    //         type:String,
    //         required : [true, `Start date is required`]
    //     },
    //     time:{
    //         type:String,
    //         required:[true, `Start time is required`]
    //     }
    // },
    // endService:{
    //     date:{
    //         type:String,
    //         required : [true, `End date is required`]
    //     },
    //     time:{
    //         type:String,
    //         required:[true, `End time is required`]
    //     }
    // },
})

export default mongoose.model('ServiceReport',serviceReportSchema);

