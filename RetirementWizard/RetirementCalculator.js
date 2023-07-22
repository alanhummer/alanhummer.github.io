//And so we begin....
document.addEventListener("DOMContentLoaded", onDOMContentLoaded, false);

var gFieldArray = [];
var formatter;
var currentDate = new Date();

/*What left?

- X Handle year starts/stops - retire year, medicare kicks in, etc
- X START YEAR< END YERA? Medical leive
- handl ss
- handle other incodme
- IRA's need to be an age...handle that


*/

/****************
When Page loads we start
****************/
function onDOMContentLoaded() {

    var outputTable = "<table border='0' cellpadding='0' cellspacing='0' width='100%'>_RETIREMENTFIELDS_</table>";
    var outputRows = "";

    gFieldArray.push(new RetirementField("yearBorn", "2001", "YEAR BORN", "year"));
    gFieldArray.push(new RetirementField("yearRetire", "2001", "YEAR RETIRE", "year"));
    gFieldArray.push(new RetirementField("yearSocSec", "2001", "YEAR SOCSEC", "year"));
    gFieldArray.push(new RetirementField("yearMedicare", "2001", "YEAR MEDICARE", "year"));
    gFieldArray.push(new RetirementField("yearDie", "2001", "YEAR DIE", "year"));
    gFieldArray.push(new RetirementField("BREAK", "", "", ""));
    gFieldArray.push(new RetirementField("medicalExpense", "10000", "PRE-MEDCARE/MTH", "money", "expense", "monthly", "inflation", "yearRetire", "yearMedicare"));
    gFieldArray.push(new RetirementField("livingExpense", "10000", "LIVING EXP/MTH", "money", "expense", "monthly", "inflation", "yearRetire", "yearDie"));
    gFieldArray.push(new RetirementField("inflation", "2", "INFLATION/YR", "rate"));   
    gFieldArray.push(new RetirementField("BREAK", "", "", ""));
    gFieldArray.push(new RetirementField("socSec", "1000", "SOC SEC", "money", "income", "monthly", "secsec-inflation", "yearSocSec", "yearDie"));
    gFieldArray.push(new RetirementField("secsec-inflation", "3", "SOC SEC INFLATION", "rate"));
    gFieldArray.push(new RetirementField("rothIRAAl", "10000", "IRA 1 BAL", "money", "income", "yearly", "rothIRAAl-return"));
    gFieldArray.push(new RetirementField("rothIRAAl-return", "3", "IRA 1 RET/YR", "rate"));
    gFieldArray.push(new RetirementField("rothIRAA2", "10000", "IRA 2 BAL", "money", "income", "yearly", "rothIRAA2-return"));
    gFieldArray.push(new RetirementField("rothIRAA2-return", "3", "IRA 2 RET/YR", "rate"));



    //Build our display
    gFieldArray.forEach((fieldObject) => {
        outputRows = outputRows + fieldObject.fieldDisplayRow();
        //console.log("ROW IS: " + outputRows);
    });

    outputTable = outputTable.replace("_RETIREMENTFIELDS_", outputRows);
    document.getElementById("input-fields").innerHTML = outputTable;

    showPageView("inputs");
}



/****************
doCalc
****************/
function doCalc() {

    var myValue;
    var i = 0;
    var blnBogus = false;
    var startAmount = 0;
    var addAmount = 0;
    var subtractAmount = 0;
    var endAmount = 0;
    var lFieldArray;

    resultReport = "";

    document.getElementById("errormessage").innerHTML = "&nbsp;";

    gFieldArray.forEach((fieldObject) => {

        if (fieldObject.fieldName != "BREAK") {

            if (!isNumber(document.getElementById(fieldObject.fieldName).value)) {
                //bogus
                blnBogus = true;
            }
            else {
                fieldObject.fieldValue = trimNumber(document.getElementById(fieldObject.fieldName).value);
                fieldObject.setDataValue();
                //console.log("FIELD VALUE SET " + fieldObject.fieldName + " = " + fieldObject.fieldValue);
            }
        }
    });

    if (blnBogus) {
        document.getElementById("errormessage").innerHTML = "Numbers Only";
        return;
    }

    //Data is good, lets rip thru it and apply our time algorithm..since updating, make a copy
    lFieldArray = gFieldArray;

    resultReport = "<table class='output-report' border='1px' width='100%' cellpadding='10' cellspacing='10'><tr><td align='center'>YEAR</td><td align='center'>START</td><td align='center'>INCOME</td><td align='center'>EXPENSE</td><td align='center'>END</td></tr>"
    for (let i = currentDate.getFullYear(); i < getValue(lFieldArray, "yearDie"); i++) {

        startAmount = currency(calcYearStartAmounts(lFieldArray, i));
        addAmount = currency(calcAddAmounts(lFieldArray,  i));
        subtractAmount = currency(calcSubtractAmounts(lFieldArray, i));
        endAmount = currency(calcEndYearAmounts(lFieldArray, i));

        resultReport = resultReport + "<tr><td align='center' width='20%'>" + i + "</td><td width='20%' align='right'>" + startAmount + "&nbsp;</td><td width='20%' align='right'>" + addAmount + "</td><td width='20%' align='right'>" + subtractAmount + "</td><td width='20%' align='right'>" + endAmount + "</td></tr>";
    }
    resultReport = resultReport + "</table>";

    document.getElementById("outputReport").innerHTML = "<center>" + resultReport + "</center>";
    showPageView("output");
}

/****************
doClose
****************/
function doClose(inputValue) {

    showPageView("inputs");

}


/****************
showPageView
****************/
function showPageView(inputView) {
    //document.getElementById("inputs").style.display = "none";
    document.getElementById("output").style.display = "none";
    document.getElementById(inputView).style.display = "block";
}

/****************
calcYearStartAmounts
****************/
function calcYearStartAmounts(inputArray, inputYear) {

    var myValue = 0;
    var blnHandleIncome = false;

    //Build our amount set
    inputArray.forEach((fieldObject) => {
        if (fieldObject.fieldType == "money" && fieldObject.incomeOrExpense == "income") {

            if (fieldObject.startYear && fieldObject.endYear) {
                if (fieldObject.startYear != "" && fieldObject.endYear != "") {
                    if (inputYear >= getValue(inputArray, fieldObject.startYear) && inputYear <= getValue(inputArray, fieldObject.endYear)) {
                        blnHandleIncome = true;
                    }              
                }
                else {
                    blnHandleIncome = true; 
                }
            }
            else {
                blnHandleIncome = true;
            }

            if (blnHandleIncome) {
                console.log("START OBJECT", fieldObject);
                if (fieldObject.timePeriod == "monthly") {
                    myValue = Number(myValue) + Number(Number(fieldObject.fieldValue) * 12);
                }
                else {
                    myValue = Number(myValue) + Number(fieldObject.fieldValue);
                }
            }

        }
    });

    return myValue;

}

/****************
calcAddAmounts
****************/
function calcAddAmounts(inputArray, inputYear) {

    var myRate = 0;
    var totalIncome = 0;
    var blnHandleIncome = false;

    //Build our amount set
    inputArray.forEach((fieldObject) => {
        if (fieldObject.fieldType == "money" && fieldObject.incomeOrExpense == "income") {

            blnHandleIncome = false;

            //Only if in range

            if (fieldObject.startYear && fieldObject.endYear) {
                if (fieldObject.startYear != "" && fieldObject.endYear != "") {
                    if (inputYear >= getValue(inputArray, fieldObject.startYear) && inputYear <= getValue(inputArray, fieldObject.endYear)) {
                        blnHandleIncome = true;
                    }              
                }
                else {
                    blnHandleIncome = true; 
                }
            }
            else {
                blnHandleIncome = true;
            }

            console.log("TESTING INCOME " + inputYear + " HANDLE IT IS " + blnHandleIncome, fieldObject);

            myRate = getValue(inputArray, fieldObject.rateField);
            fieldObject.fieldNetChange = (Number(fieldObject.fieldValue) * Number(myRate)/100);
            fieldObject.fieldValue = Number(fieldObject.fieldValue) + Number(fieldObject.fieldNetChange);

            //Handle monthly vs yearly
            if (blnHandleIncome) {
                
                if (fieldObject.timePeriod == "monthly") {
                    totalIncome = Number(totalIncome) + Number(Number(fieldObject.fieldValue) * 12);
                }
                else {
                    totalIncome = Number(totalIncome) + Number(fieldObject.fieldNetChange);
                }
                
            }

        }
    });

    return totalIncome;

}

/****************
calcSubtractAmounts
****************/
function calcSubtractAmounts(inputArray, inputYear) {

    var totalExpense = 0;
    var returnExpense = 0;
    var blnHandleExpense = false;

    //Build our amount set --> MOney comes outof which ccount?
    inputArray.forEach((fieldObject) => {
        if (fieldObject.fieldType == "money" && fieldObject.incomeOrExpense == "expense") {
            
            blnHandleExpense = false;
            //Only if in range
            if (fieldObject.startYear && fieldObject.endYear) {
                if (inputYear >= getValue(inputArray, fieldObject.startYear) && inputYear <= getValue(inputArray, fieldObject.endYear)) {
                    blnHandleExpense = true;
                }
            }
            else {
                blnHandleExpense = true;
            }

            //Handle monthly vs yearly
            if (blnHandleExpense) {
                if (fieldObject.timePeriod == "monthly") {
                    totalExpense = Number(totalExpense) + Number(Number(fieldObject.fieldValue) * 12);
                }
                else {
                    totalExpense = Number(totalExpense) + Number(Number(fieldObject.fieldValue));
                }
                
            }

            //Regardless of retired or not, expense go up by what rate defined
            myRate = getValue(inputArray, fieldObject.rateField);
            fieldObject.fieldValue = Number(fieldObject.fieldValue) + (Number(fieldObject.fieldValue) * Number(myRate)/100);

        }
    });

    //Save off total expense
    returnExpense = totalExpense;

    //Drain the money from accounts in order
    inputArray.forEach((fieldObject2) => {

        //Drain acount by expense cost
        if (totalExpense > 0 ) {
            if (fieldObject2.fieldType == "money" && fieldObject2.incomeOrExpense == "income" && fieldObject2.timePeriod != "monthly") {
                if (Number(fieldObject2.fieldValue > 0)) {
                    fieldObject2.fieldValue = fieldObject2.fieldValue - totalExpense;
                    if (Number(fieldObject2.fieldValue < 0)) {
                        totalExpense = -1 * fieldObject2.fieldValue;
                        fieldObject2.fieldValue = 0;
                    }
                }
            }
        }
    });

    return returnExpense;

}

/****************
calcEndYearAmounts
****************/
function calcEndYearAmounts(inputArray, inputYear) {

    var myRate = 0;
    var totalValue = 0;
    var blnHandleIncome = false;

    //Build our amount set
    inputArray.forEach((fieldObject) => {
        if (fieldObject.fieldType == "money" && (fieldObject.incomeOrExpense == "income")) {

            fieldObject.fieldValue = Number(fieldObject.fieldValue) + Number(fieldObject.netChange);


            if (fieldObject.startYear && fieldObject.endYear) {
                if (fieldObject.startYear != "" && fieldObject.endYear != "") {
                    if (inputYear >= getValue(inputArray, fieldObject.startYear) && inputYear <= getValue(inputArray, fieldObject.endYear)) {
                        blnHandleIncome = true;
                    }              
                }
                else {
                    blnHandleIncome = true; 
                }
            }
            else {
                blnHandleIncome = true;
            }

            if (blnHandleIncome) {
                if (fieldObject.timePeriod == "monthly") {
                    totalValue = Number(totalValue) + Number(Number(fieldObject.fieldValue) * 12);
                }
                else {
                    totalValue = Number(totalValue) + Number(fieldObject.fieldValue);
                }
            }

           
        }
    });

    return totalValue;

}

/****************
getValue
****************/
function getValue(inputArray, inputFieldName) {

    myValue = "";

    //Build our display
    inputArray.forEach((fieldObject) => {
        if (fieldObject.fieldName == inputFieldName) {
            if (!isNumber(fieldObject.fieldValue)) {
                myValue = Number(fieldObject.fieldValue);
            }
            else {
                myValue = fieldObject.fieldValue;
            }
        }
    });

    return myValue;

}

/****************
isNumber
****************/
function isNumber(inputNumber) {

    var myResponse = true;
    var validChars = "0123456789$,."

    if (inputNumber) {
        for (var i = 0; i < inputNumber.length; i++) {
            if (!validChars.includes(inputNumber.charAt(i))) {
                myResponse = false;
            }
        }
    }
    else {
        myResponse = false;
    }

    return myResponse;

}

/****************
trimNumber
****************/
function trimNumber(inputNumber) {

    var myResponse = "";
    var validChars = "0123456789."

    if (inputNumber) {
        if (isNumber(inputNumber)) {
            for (var i = 0; i < inputNumber.length; i++) {
                if (validChars.includes(inputNumber.charAt(i))) {
                    myResponse = myResponse + inputNumber.charAt(i);
                }
            }
        }
    }

    return myResponse;

}

/****************
currency
****************/
function currency(inputNumber) {

    // Create our number formatter.
    if (!formatter) {

        formatter = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0
        
            // These options are needed to round to whole numbers if that's what you want.
            //minimumFractionDigits: 0, // (this suffices for whole numbers, but will print 2500.10 as $2,500.1)
            //maximumFractionDigits: 0, // (causes 2500.99 to be printed as $2,501)
    
        });``
    }

    return formatter.format(inputNumber);

}


/****************
Retirement Field Object
****************/
class RetirementField {

    constructor(fieldName, fieldValue, fieldDescription, fieldType = "", incomeOrExpense = "", timePeriod = "", rateField = "", startYear = "", endYear = "") {
        this.fieldName = fieldName;
        if (isNumber(fieldValue)) {
            this.fieldValue = Number(trimNumber(fieldValue));
        }
        else {
            this.fieldValue = fieldValue;
        }

        this.fieldDescription = fieldDescription;
        this.fieldType = fieldType;
        this.incomeOrExpense = incomeOrExpense;
        this.timePeriod = timePeriod;
        this.rateField = rateField;
        this.startYear = startYear;
        this.endYear = endYear;
        this.netChange = 0;

        this.initField();
    }

    /****************
    fieldDisplayRow
    ****************/
    fieldDisplayRow() {

        var myResponse = "";

        if (this.fieldName != "BREAK") {

            myResponse = myResponse + "<tr>";
            myResponse = myResponse + "<td width='50%'><p align='right' valign='top'>_FIELDDESCRIPTION_:&nbsp;&nbsp;</p></td>";
            myResponse = myResponse + "<td width='50%'><textarea rows='1' cols='15' id='_FIELDNAME_'>_FIELDVALUE_</textarea></td>";
            myResponse = myResponse + "</tr>";
    
            myResponse = myResponse.replace("_FIELDNAME_", this.fieldName);
            if (this.fieldType == "money") {
                myResponse = myResponse.replace("_FIELDVALUE_", currency(this.fieldValue));
            }
            else {
                myResponse = myResponse.replace("_FIELDVALUE_", this.fieldValue);
            }
            myResponse = myResponse.replace("_FIELDDESCRIPTION_", this.fieldDescription);
        }
        else {
            myResponse = myResponse + "<tr><td colspan='2'><hr></td></tr>";
        }
        
        return myResponse;

    }

    /****************
    Initialize data field
    ****************/
    initField() {

        this.getDataValue();

    }

    /****************
    setDataValue
    ****************/
    setDataValue() {

        if (this.fieldName != "BREAK") {
            localStorage.setItem(this.fieldName, trimNumber(this.fieldValue));
            console.log("Retirement Calculator Set " + this.fieldName + " to " + this.fieldValue);
        }
    }


    /****************
    getDataValue
    ****************/
    getDataValue() {

        var dataValue = localStorage.getItem(this.fieldName);

        if (dataValue) {
            this.fieldValue = trimNumber(dataValue); 
        }

        //console.log("Retirement Calculator Got Value " + this.fieldName + " = " + this.fieldValue);

        return this.fieldValue;

    }

}



/*

Year Born
Year Retire
Year Start Social Security
Year Me
dicare/Medicaid
Year Death

Amount in 401ks
Amount in IRAs
Amount in Roths
Amount in Other Brokerage
Amount in BMO
Amount in Capital One

Social Security Monthly Payment Estimate
Health Insurance Cost before Medicare

Inflation Rate
Earnings on Investment Rate

College Costs Left Jacob
College Costs Left Elliot
Current Average Monthly Expenses (average over a year)

*/