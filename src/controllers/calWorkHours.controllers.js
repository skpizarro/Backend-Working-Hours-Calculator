import {DateTime} from 'luxon'
import ServiceReport from '../models/serviceReport'

const getWorkingHours = async(req,res)=>{
    try{
        const {idTechnician,weekNumber}=req.body;
        
        //console.log(DateTime.fromJSDate(new Date('2020-10-05T20:12:30.000Z')).weekNumber)
        // Consultamos todos los servicios realizados por el técnico
        const services = await ServiceReport.find({idTechnician});
        
        // hallamos los servicios de la semana objetivo de consulta
        
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


const calculate = (services,weekNumber)=>{
            
    let weekH=0,
    normalH=0,
    nightH=0,
    sundayH=0,
    normalExtraH= 0,
    nightExtraH=0,
    sundayExtraH=0,
    auxNormal=0,
    auxNight=0,
    auxSun=0


    services.forEach(s=>{
        let startS = new Date(s.startService);
        let endS = new Date(s.endService);

        // hallamos la cantidad de dias
        
        if(DateTime.fromJSDate(startS).weekNumber == weekNumber && DateTime.fromJSDate(endS).weekNumber == weekNumber){
            let resp;
            // condición para las horas semanasles
            if(weekH < 48){ // se calculan las horas normales
                resp = calculateWorkingH(startS,endS,normalH,nightH,sundayH,auxNormal,auxNight,auxSun,weekH)
                weekH = resp.normalH + resp.nightH + resp.sundayH
                normalH = resp.normalH;
                nightH = resp.nightH;
                sundayH = resp.sundayH; 
            }else{
                console.log("Extraaas")
                // Se calculan las horas extras
                resp = calculateWorkingH(startS,endS,normalExtraH,nightExtraH,sundayExtraH,auxNormal,auxNight,auxSun,weekH)
                weekH = resp.normalH + resp.nightH + resp.sundayH + normalH + nightH + sundayH
                normalExtraH = resp.normalH;
                nightExtraH = resp.nightH;
                sundayExtraH = resp.sundayH;
            }

        }
        else if(DateTime.fromJSDate(startS).weekNumber == weekNumber && DateTime.fromJSDate(endS).weekNumber > weekNumber){
            if(weekH < 48){
                sundayH = sundayH + (24-startS.getHours()); // No tenemos en cuenta las horas de fin si termina el lunes
                weekH = weekH + (24-startS.getHours())
            }else{
                sundayExtraH = sundayExtraH + (24-startS.getHours());
                weekH = weekH + (24-startS.getHours());
            }
            
        }
    });

    return {
        weekH,
        normalH,
        nightH,
        sundayH,
        normalExtraH,
        nightExtraH,
        sundayExtraH,
    }
}


const calculateWorkingH = (startS,endS,normalH,nightH,sundayH,auxNormal,auxNight,auxSun,weekH)=>{
    // Definimos horarios
    let normI = new Date('10-05-2020 07:00:00'),
     normF= new Date('10-05-2020 20:00:00'),
     nightI = new Date('10-05-2020 20:00:00'),
     nightF= new Date('10-05-2020 07:00:00');

     const formatToH=(date)=>{
         return date.getHours() + (date.getMinutes()/(1000 *60 *60)) + (date.getSeconds()/(1000 *60 *60))
     }

     normI = formatToH(normI);
     normF = formatToH(normF);
     nightI = formatToH(nightI);
     nightF = formatToH(nightF);



    ////////////////////////////////
    // Transformamos la fecha de inicio y fin en horas
    let startH = formatToH(startS),
        endH = formatToH(endS);

    /////////////////////////////////////////////////////
    
    let hours = endH - startH; // Horas de trabajo en cada servicio
    

    let days=(endS-startS)/(1000* 60* 60* 24); // dias que trabajo


    // Funciones para  las horas extras
    const extraType1 =()=>{
        
    }

    const extraType2=()=>
    {}


    //let hours = ms / (1000 * 60 * 60);
    if(startS.getDay() > 0 && endS.getDay() > 0){ // Lunes a Sabado
        
        //Horario normal
        if((startH >= normI && startH < normF) && (endH > normI && endH <= normF)){ /// 7AM a 8 PM
            console.log("Horario normal  7AM a 8 PM")
            normalH=normalH + hours;
        
        }else if((startH >= normI && startH < normF) && endH >= nightI){ // // empezó hora normal y termino en nocturna del mismo dia (como atienden emergencias, se puede dar el caso)
            
            // 7AM a 8PM + 8pm a 11pm
            console.log("Horario 7AM a 8PM + 8pm a 11pm")

            // separamos las horas normales de las nocturnas
            normalH = normalH + (nightI - startH)
            //Normal Nocturnas
            nightH= nightH + (endH - nightI)
        }
        else if((startH >= normI && startH < normF) && endH <= nightF){ // empezó hora hormal y terminó hora nocturna del dia siguiente de la misma semana
            console.log("7AM a 8PM + 8pm a 12am + 12am a 7am")
            // 7AM a 8PM + 8pm a 12am + 12am a 7am

            // separamos las horas normales de las nocturnas
            normalH = normalH + (nightI - startH) // normales
            //Normal Nocturnas
            nightH= nightH + (4 + endH) // se suman las primeras nocturnas (8pm hasta las 12pm) y de 12am hasta las 7am
        }

        else if((startH >= nightI && endH > nightI) || (startH >= nightI && endH == 0)){ // Hora nocturna
            // de 8pm a 12am
            console.log("8pm a 12am")
            
            if(hours<0){
                nightH = nightH + (24+hours)
            }else{
                nightH = nightH + hours
            } 
        
        }else if(startH >= nightI && endH <= nightF ){
            console.log("de 8pm a 7 am");
            // de 8pm a 7am
            nightH = nightH + (24 - startH) +(endH) // de 8pm a 12am + de 12am a 7am
        }

        else if(startH >= nightI && (endH >= normI && endH <= nightI )){
            // de 8pm a 8pm del dia sig
            console.log("de 8pm a 8pm del dia sig")
            nightH = nightH + (24 - startH) + 7 // horas nocturnas del dia anterior mas todas del siguiente dia
            normalH = normalH + (endH - 7) // las horas normales del dia siguiente
        }
        else if((startH >= 0 && startH <= normI) && (endH > 0 && endH <= normI)){ // inició y termino de 12 am a 7 am del mismo dia
            //Nocturnas de 12am a 7am
            console.log("de 12am a 7am")
            nightH = nightH + hours;
        }
        else if((startH >= 0 && startH <= normI) && (endH > normI && endH <= normF)){ //inició de 12 am y terminó al dia siguiente en hora normal
            console.log("12 am a 8pm")
            // nocturnas
            nightH = nightH + (nightF - startH)
            // normales
            normalH = normalH + (endH-normI);
        }
        else if((startH >= 0 && startH <= normI) && (endH >=nightI || endH == 0 )){
            console.log("12am a 12am del sig dia")
            nightH = nightH + (nightF - startH);// nocturnas de 12am hasta 7am
            normalH = normalH + (nightI - normI); // 7am a 8pm
            
            // las nocturnas de 8pm a 12am
            if(endH == 0){
                nightH = nightH + 4
            }else{
                nightH = nightH + (endH-nightI);
            }
            
        }

    }else{
        //Domingos cuando la hora fin no finaliza ,(misma semana)
        console.log("Domingos")
        sundayH= sundayH + hours;
    }

    if(days >= 1){
        // trabajo mas de 1 dia

    }

    return {
        normalH,
        nightH,
        sundayH,
        auxNormal,
        auxNight,
        auxSun
    }
    

} 



export {getWorkingHours};