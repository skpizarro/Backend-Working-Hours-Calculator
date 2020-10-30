import {DateTime} from 'luxon'
import ServiceReport from '../models/serviceReport'

const getWorkingHours = async(req,res)=>{
    try{
        const {idTechnician,weekNumber}=req.body;
        
        //console.log(DateTime.fromJSDate(new Date('2020-10-05T20:12:30.000Z')).weekNumber)
        // Consultamos todos los servicios realizados por el técnico
        const services = await ServiceReport.find({idTechnician});
        
        // hallamos los servicios de la semana objetivo de consulta
        
        
        let normalH=0,
            normalHN=0,
            sundayH=0;
        
        services.forEach(s=>{
            // acaba el mismo dia y la misma semana
            let startS = new Date(s.startService);
            let endS = new Date(s.endService);
            if(DateTime.fromJSDate(startS).weekNumber == weekNumber && DateTime.fromJSDate(endS).weekNumber == weekNumber){
                let ms =(endS - startS)
                let hours = Math.floor(ms / (1000 * 60 * 60)); // Horas de trabajo en cada servicio
                
                if(startS.getDay() > 0 && endS.getDay() > 0){ // Lunes a Sabado
                    //Horario normal
                    if(endS.getHours() > 6 && endS.getHours() < 21){ /// 7AM a 8 PM
                        
                        normalH=normalH + hours;
                    }else if(startS.getHours() > 6 && startS.getHours() < 21 && endS.getHours() > 20){ // // empezó hora normal y termino en nocturna del mismo dia (como atienden emergencias, se puede dar el caso)
                        
                        // 7AM a 8PM + 8pm a 11pm

                        // separamos las horas normales de las nocturnas
                        normalH = normalH + (20 - startS.getHours())
                        //Normal Nocturnas
                        normalHN= normalHN + (endS.getHours() - 20)

                    }else if(startS.getHours() > 6 && startS.getHours() < 21 && endS.getHours() < 8){ // empezó hora hormal y termino hora nocturna del dia siguiente de la misma semana
                        
                        // 7AM a 8PM + 8pm a 12am + 12am a 7am

                        // separamos las horas normales de las nocturnas
                        normalH = normalH + (20 - startS.getHours())

                        //Normal Nocturnas
                        normalHN= normalHN + (4 + endS.getHours()) // se suman las primeras nocturnas (8pm hasta las 12pm) y de 12am hasta las 7am
                    }else if(startS.getHours() > 19 && endS.getHours() > 19){ // Hora nocturna
                        // de 8pm a 11pm

                        normalHN = normalHN + hours

                    }else if(startS.getHours() > 19 && endS.getHours() < 8){
                        // si es sábado
                        if(endS.getDay() == 6){ // Las horas nocturnas correspondientes a la semana sig no se tienen en cuenta
                            // de 8pm a 12am
                            normlaHN = normalHN + (24 - startS.getHours())
                        }else{
                            // de 8pm a 7am
                            normlaHN = normalHN + (24 - startS.getHours()) +(endS.getHours) // de 8pm a 12am + de 12am a 7am
                        }
                        
                    }
                    else if(startS.getHours() < 8 && endS.getHours()<8){ // inició y termino de 12 am a 7 am
                        normalHN = normalHN + hours;
                    }
                    else if(startS.getHours() < 8 && endS.getHours() > 6){ //inició de 12 am y terminó al dia siguiente
                        // nocturnas
                        normalHN = normalHN + (7 - startS.getHour())
                        // normales
                        normalH = normalH + (endS.getHours()-7);
                    }

                }else{
                    //Domingos
                    
                    // de 12am a 7am
                    if(startS.getHours() < 8 && endS.getHours() <8 ){
                        sundayH= sundayH + hours;
                    }
                    else if(startS.getHours() < 8 && endS.getHours() > 6){ // de 12 am a 8PM
                        // sumamos las primeras horas 
                        sundayH = sundayH + (7 - startS.getHours()) // 12am a 7am
                        sundayH = sundayH + (endS.getHours()-7) // 7 a 11pm
                    }
                    
                    
                }
                
            }
        });

        
        res.status(200).json({
            ok:true,
            workingH:{
                normalH,
                normalHN,
                sundayH
            }
        })
    }catch(err){
        res.status(500).json({
            ok:false,
            err
        })
    }
}

export {getWorkingHours};