
const formatoFecha = (fh) => {
    let fhtxt = `${zfill(parseInt(fh.getDate()), 2)}/${zfill((parseInt(fh.getMonth())+1), 2)}/${parseInt(fh.getFullYear())}`;
    fhtxt +=  ` ${zfill(parseInt(fh.getHours()), 2)}:${zfill(parseInt(fh.getMinutes()), 2)}:${zfill(parseInt(fh.getSeconds()), 2)}`;
    return fhtxt;
}

const zfill = (number, width, deci) => {
    let numberOutput = Math.abs(number); /* Valor absoluto del n�mero */
    if (deci!=undefined|| deci>0) {
        numberOutput = Number.parseFloat(numberOutput).toFixed(deci).toString();
    }
    let length = numberOutput.toString().length; /* Largo del n�mero */
    let zero = "0"; /* String de cero */
    if (width <= length) {
        if (number < 0) {			
            return ("-" + numberOutput.toString());
        } else {
            return numberOutput.toString();
        }
    } else {
        if (number < 0) {
            return ("-" + (zero.repeat(width - length - 1)) + numberOutput.toString());
        } else {
            return zero.repeat(width - length) + numberOutput.toString();
        }
    }
}

export default formatoFecha;