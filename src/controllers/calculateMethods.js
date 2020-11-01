import {DateTime} from 'luxon'

// Basado en la norma ISO 8601

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
    auxSun=0,
    flag = true,
    maxH = 48;

    services.forEach(s=>{
        let startS = new Date(s.startService);
        let endS = new Date(s.endService);

        // hallamos la cantidad de dias
        
        // si la hora de inicio y hora fin están en la misma semana
        if(DateTime.fromJSDate(startS).weekNumber == weekNumber && DateTime.fromJSDate(endS).weekNumber == weekNumber){
            let resp;
            // condición para las horas semanasles
            if(weekH < 48){ // se calculan las horas normales
        
                resp = calculateWorkingH(startS,endS,normalH,nightH,sundayH,auxNormal,auxNight,auxSun,weekH,flag,maxH)
                weekH = resp.weekH;
                normalH = resp.normalH;
                nightH = resp.nightH;
                sundayH = resp.sundayH;
                normalExtraH = resp.auxNormal;
                nightExtraH= resp.auxNight;
                sundayExtraH = resp.auxSun;
                

            }else{
                flag = false
                console.log("Extraaas")
                // Se calculan solo las horas extras
                resp = calculateWorkingH(startS,endS,normalExtraH,nightExtraH,sundayExtraH,auxNormal,auxNight,auxSun,weekH,flag,maxH)
                weekH = resp.weekH;
                normalExtraH = resp.normalH;
                nightExtraH = resp.nightH;
                sundayExtraH = resp.sundayH;
            }

        }
        else if(DateTime.fromJSDate(startS).weekNumber == weekNumber && DateTime.fromJSDate(endS).weekNumber > weekNumber){ // creo que nunca se mete REVISAR
            console.log("si inicia domingo y finaliza lunes de otra semana")
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

const formatToH=(date)=>{
    return date.getHours() + (date.getMinutes()/(1000 *60 *60)) + (date.getSeconds()/(1000 *60 *60))
}


// Funciones para  las horas extras

// se asigna las horas extra si solo hay un turno (norma o nocturno)
const extraType1 =(weekH,aux,maxH,h)=>{
    // si las horas semanales > 48 en este caso
    if(weekH > maxH){
        aux = weekH - maxH // obtenemos las extras
        h = h - aux // le resto las extras a las normales
        return{
            h,
            aux,
        }
    }
    return{
        h,
        aux,
    }
}

// se usa cuando pasamos de normal a noctuno o al contrario. para asignar las horas extra donde correspondan
const extraType2=(weekH,aux,aux2,maxH,h)=>
{
    if((weekH > maxH) && aux == 0){
        aux2 = weekH - maxH // obtenemos las extras
        h = h - aux2 // le resto las extras a las normales

        return{
            h,
            aux2,
        }
    }else if((weekH > maxH) && aux > 0){
        //solo se tienen en cuenta las extras
        aux2 = weekH - aux - maxH; // las semanas menos las extras anteriores menos el tope(48)
        return{
            h,
            aux2
        }
    }

    // los devuelve como estaban
    return{
        h,
        aux2
    }
}



const calculateWorkingH = (startS,endS,normalH,nightH,sundayH,auxNormal,auxNight,auxSun,weekH,flag,maxH)=>{
    // Definimos horarios, solo me importa la hora
    let normI = new Date('10-05-2020 07:00:00'),
     normF= new Date('10-05-2020 20:00:00'),
     nightI = new Date('10-05-2020 20:00:00'),
     nightF= new Date('10-05-2020 07:00:00');

     //Formateamos todo a horas
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
    
    // Por si ingresa varios dias seguidos (NO SE IMPLEMENTÓ)
    let days=(endS-startS)/(1000* 60* 60* 24); // dias que trabajó

    if(startS.getDay() > 0 && endS.getDay() > 0){ // Lunes a Sabado
        
        //Horario normal
        if((startH >= normI && startH < normF) && (endH > normI && endH <= normF)){ /// 7AM a 8 PM
            console.log("Horario normal  7AM a 8 PM")
            normalH=normalH + hours;
            weekH = weekH + hours; // aumentamos las horas semanales
            
            if(flag){// significa que las semanas no habian llegado a 48 pero pudieron llegarlo en esta iteracion, entoces se confirma y si es positivo se efectua la operación de horas extras
                let resp = extraType1(weekH,auxNormal,maxH,normalH)
                auxNormal = resp.aux;
                normalH = resp.h;
            }
            
        
        }else if((startH >= normI && startH < normF) && endH >= nightI){ // // empezó hora normal y termino en nocturna del mismo dia (como atienden emergencias, se puede dar el caso)
            
            // 7AM a 8PM + 8pm a 11pm
            console.log("Horario 7AM a 8PM + 8pm a 11pm")

            // separamos las horas normales de las nocturnas
            normalH = normalH + (nightI - startH)
            weekH = weekH + (nightI - startH);

            if(flag){
                let resp = extraType1(weekH,auxNormal,maxH,normalH)
                auxNormal = resp.aux;
                normalH = resp.h;
            }

            //Normal Nocturnas
            nightH= nightH + (endH - nightI);
            weekH = weekH + (endH - nightI);

            if(flag){
                let resp = extraType2(weekH,auxNormal,auxNight,maxH,nightH);
                auxNight = resp.aux2;
                nightH = resp.h;
            }
            
        }
        else if((startH >= normI && startH < normF) && endH <= nightF){ // empezó hora hormal y terminó hora nocturna del dia siguiente de la misma semana
            console.log("7AM a 8PM + 8pm a 12am + 12am a 7am")
            // 7AM a 8PM + 8pm a 12am + 12am a 7am

            // separamos las horas normales de las nocturnas
            normalH = normalH + (nightI - startH) // normales
            weekH = weekH + (nightI - startH);
            
            if(flag){
                let resp = extraType1(weekH,auxNormal,maxH,normalH)
                auxNormal = resp.aux;
                normalH = resp.h;
            }

            //Normal Nocturnas
            nightH= nightH + (4 + endH) // se suman las primeras nocturnas (8pm hasta las 12pm) y de 12am hasta las 7am;
            weekH = weekH + (4 + endH)

            if(flag){
                let resp = extraType2(weekH,auxNormal,auxNight,maxH,nightH);
                auxNight = resp.aux2;
                nightH = resp.h;
            }
        }

        else if((startH >= nightI && endH > nightI) || (startH >= nightI && endH == 0)){ // Hora nocturna
            // de 8pm a 12am
            console.log("8pm a 12am")
            
            if(hours<0){
                nightH = nightH + (24+hours);
                weekH = weekH + (24+hours)

                if(flag){
                    let resp = extraType1(weekH,auxNight,maxH,nightH)
                    auxNight = resp.aux;
                    nightH = resp.h;
                }

            }else{
                nightH = nightH + hours;
                weekH = weekH + hours;
                if(flag){
                    let resp = extraType1(weekH,auxNight,maxH,nightH)
                    auxNight = resp.aux;
                    nightH = resp.h;
                }
            } 
        
        }else if(startH >= nightI && endH <= nightF ){
            console.log("de 8pm a 7 am");
            // de 8pm a 7am
            nightH = nightH + (24 - startH) +(endH) // de 8pm a 12am + de 12am a 7am
            weekH = weekH + (24 - startH) +(endH)
            if(flag){
                let resp = extraType1(weekH,auxNight,maxH,nightH)
                auxNight = resp.aux;
                nightH = resp.h;
            }
        }

        else if(startH >= nightI && (endH >= normI && endH <= nightI )){
            // de 8pm a 8pm del dia sig
            console.log("de 8pm a 8pm del dia sig")
            nightH = nightH + (24 - startH) + 7 // horas nocturnas del dia anterior mas todas del siguiente dia
            weekH = weekH + (24 - startH) + 7

            if(flag){
                let resp = extraType1(weekH,auxNight,maxH,nightH)
                auxNight = resp.aux;
                nightH = resp.h;
            }

            normalH = normalH + (endH - 7) // las horas normales del dia siguiente
            weekH = weekH + (endH - 7);
            if(flag){
                let resp = extraType2(weekH,auxNight,auxNormal,maxH,normalH);
                auxNormal = resp.aux2;
                normalH = resp.h;
            }
            
        }
        else if((startH >= 0 && startH <= normI) && (endH > 0 && endH <= normI)){ // inició y termino de 12 am a 7 am del mismo dia
            //Nocturnas de 12am a 7am
            console.log("de 12am a 7am")
            nightH = nightH + hours;
            weekH = weekH + hours;
            if(flag){
                let resp = extraType1(weekH,auxNight,maxH,nightH)
                auxNight = resp.aux;
                nightH = resp.h;
            }
        }
        else if((startH >= 0 && startH <= normI) && (endH > normI && endH <= normF)){ //inició de 12 am y terminó al dia siguiente en hora normal
            console.log("12 am a 8pm")
            // nocturnas
            nightH = nightH + (nightF - startH);
            weekH = weekH + (nightF - startH)

            if(flag){
                let resp = extraType1(weekH,auxNight,maxH,nightH)
                auxNight = resp.aux;
                nightH = resp.h;
            }

            // normales
            normalH = normalH + (endH-normI);
            weekH = weekH + (endH-normI);
            if(flag){
                let resp = extraType2(weekH,auxNight,auxNormal,maxH,normalH);
                auxNormal = resp.aux2;
                normalH = resp.h;
            }
            
        }
        else if((startH >= 0 && startH <= normI) && (endH >=nightI || endH == 0 )){
            console.log("12am a 12am del sig dia")
            nightH = nightH + (nightF - startH);// nocturnas de 12am hasta 7am
            weekH = weekH + (nightF - startH);

            if(flag){
                let resp = extraType1(weekH,auxNight,maxH,nightH)
                auxNight = resp.aux;
                nightH = resp.h;
            }

            normalH = normalH + (nightI - normI); // 7am a 8pm
            weekH = weekH + (nightI - normI);

            if(flag){
                let resp = extraType2(weekH,auxNight,auxNormal,maxH,normalH);
                auxNormal = resp.aux2;
                normalH = resp.h;
            }
            
            // las nocturnas de 8pm a 12am
            if(endH == 0){
                nightH = nightH + 4
                weekH = weekH + 4

                if(flag){
                    let resp = extraType1(weekH,auxNight,maxH,nightH)
                    auxNight = resp.aux;
                    nightH = resp.h;
                }

            }else{
                nightH = nightH + (endH-nightI);
                weekH = weekH + (endH-nightI);
                if(flag){
                    let resp = extraType1(weekH,auxNight,maxH,nightH)
                    auxNight = resp.aux;
                    nightH = resp.h;
                }
            }
            
        }

    }else{
        //Domingos cuando la hora fin finaliza ,(misma semana)
        sundayH= sundayH + hours;
        weekH = weekH + hours;
        
        if(flag){
            let resp = extraType1(weekH,auxSun,maxH,sundayH)
            auxSun = resp.aux;
            sundayH = resp.h;
            
        }
    }

    return {
        weekH,
        normalH,
        nightH,
        sundayH,
        auxNormal,
        auxNight,
        auxSun,
    }
    

}

export {calculate,calculateWorkingH,extraType1,extraType2,formatToH}
