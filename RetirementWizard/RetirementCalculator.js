//And so we begin....
document.addEventListener("DOMContentLoaded", onDOMContentLoaded, false);

var gFieldArray = [];
var formatter;

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
    gFieldArray.push(new RetirementField("medicalExpense", "10000", "PRE-MEDICARE EXP", "money", "expense", "inflation", "yearRetire", "yearMedicar"));
    gFieldArray.push(new RetirementField("livingExpense", "10000", "LIVING EXP", "money", "expense", "inflation", "yearRetire", "yearDie"));
    gFieldArray.push(new RetirementField("inflation", "2", "INFLATION", "rate"));   
    gFieldArray.push(new RetirementField("BREAK", "", "", ""));
    gFieldArray.push(new RetirementField("rothIRAAl", "10000", "IRA BAL 1", "money", "income", "rothIRAAl-return"));
    gFieldArray.push(new RetirementField("rothIRAAl-return", "3", "IRA RETURN 1", "rate"));
    gFieldArray.push(new RetirementField("rothIRAA2", "10000", "IRA BAL 2", "money", "income", "rothIRAA2-return"));
    gFieldArray.push(new RetirementField("rothIRAA2-return", "3", "IRA RETURN 2", "rate"));



    //Build our display
    gFieldArray.forEach((fieldObject) => {
        console.log("FIELD OBJECT", fieldObject);
        outputRows = outputRows + fieldObject.fieldDisplayRow();
        console.log("ROW IS: " + outputRows);
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
                console.log("FIELD VALUE SET " + fieldObject.fieldName + " = " + fieldObject.fieldValue);
            }
        }
    });

    if (blnBogus) {
        document.getElementById("errormessage").innerHTML = "Numbers Only";
        return;
    }

    //Data is good, lets rip thru it and apply our time algorithm..since updating, make a copy
    lFieldArray = gFieldArray;

    resultReport = "<table class='output-report' border='1px' width='100%' cellpadding='10' cellspacing='10'><tr><td align='center'>YEAR</td><td align='center'>START</td><td align='center'>ADD</td><td align='center'>SUBT</td><td align='center'>END</td></tr>"
    for (let i = getValue(lFieldArray, "yearRetire"); i < getValue(lFieldArray, "yearDie"); i++) {
        startAmount = currency(calcYearStartAmounts(lFieldArray));
        addAmount = currency(calcAddAmounts(lFieldArray));
        subtractAmount = currency(calcSubtractAmounts(lFieldArray));
        endAmount = currency(calcEndYearAmounts(lFieldArray));

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
    document.getElementById("inputs").style.display = "none";
    document.getElementById("output").style.display = "none";
    document.getElementById(inputView).style.display = "block";
}

/****************
calcYearStartAmounts
****************/
function calcYearStartAmounts(inputArray) {

    myValue = 0;

    //Build our amount set
    inputArray.forEach((fieldObject) => {
        if (fieldObject.fieldType == "money" && fieldObject.incomeOrExpense == "income") {
            myValue = myValue + Number(fieldObject.fieldValue);
        }
    });

    return myValue;

}

/****************
calcAddAmounts
****************/
function calcAddAmounts(inputArray) {

    var myRate = 0;
    var totalValue = 0;

    //Build our amount set
    inputArray.forEach((fieldObject) => {
        if (fieldObject.fieldType == "money" && fieldObject.incomeOrExpense == "income") {
            myRate = getValue(inputArray, fieldObject.rateField)
            fieldObject.netChange = Number(fieldObject.fieldValue) * Number(myRate)/100;
            totalValue = totalValue + fieldObject.netChange;
        }
    });

    return totalValue;

}

/****************
calcSubtractAmounts
****************/
function calcSubtractAmounts(inputArray) {

    var myRate = 0;
    var totalValue = 0;

    //Build our amount set
    inputArray.forEach((fieldObject) => {
        if (fieldObject.fieldType == "money" && fieldObject.incomeOrExpense == "expense") {
            myRate = getValue(inputArray, fieldObject.rateField)
            fieldObject.netChange = (Number(fieldObject.fieldValue) * Number(myRate)/100);
            totalValue = totalValue + Number(fieldObject.fieldValue) + fieldObject.netChange;
        }
    });

    return totalValue;

}

/****************
calcEndYearAmounts
****************/
function calcEndYearAmounts(inputArray) {

    var myRate = 0;
    var totalValue = 0;

    //Build our amount set
    inputArray.forEach((fieldObject) => {
        if (fieldObject.fieldType == "money" && (fieldObject.incomeOrExpense == "income" || fieldObject.incomeOrExpense == "expense")) {
            fieldObject.fieldValue = Number(fieldObject.fieldValue) + Number(fieldObject.netChange);
            totalValue = Number(totalValue) + Number(fieldObject.fieldValue);
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

    console.log("IS NUMBER FOR " + inputNumber + " = " + myResponse);
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

    console.log("TRIMMED # " + myResponse);
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

    constructor(fieldName, fieldValue, fieldDescription, fieldType = "", incomeOrExpense = "", rateField = "", startYear = "", endYear = "") {
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
                console.log("SHOW THIS: " + currency(this.fieldValue));
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
            console.log("DID A VALUE: " + this.fieldValue);
        }

        console.log("Retirement Calculator Got Value " + this.fieldName + " = " + this.fieldValue);

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