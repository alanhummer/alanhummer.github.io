//And so we begin....
document.addEventListener("DOMContentLoaded", onDOMContentLoaded, false);

var gFieldArray = [];

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
    gFieldArray.push(new RetirementField("rothIRAAl", "2001", "IRA BAL", "money", "start", "rothIRAAl-return"));
    gFieldArray.push(new RetirementField("rothIRAAl-return", "2001", "IRA RETURN", "rate"));

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
        if (isNaN(document.getElementById(fieldObject.fieldName).value)) {
            //bogus
            blnBogus = true;
        }
        else {
            fieldObject.fieldValue = document.getElementById(fieldObject.fieldName).value;
            fieldObject.setDataValue();
            console.log("FIELD VALUE SET " + fieldObject.fieldName + " = " + fieldObject.fieldValue);
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
        startAmount = calcStartAmounts(lFieldArray);
        addAmount = calcAddAmounts(lFieldArray);
        subtractAmount = calcSubtractAmounts(lFieldArray);
        endAmount = calcEndAmounts(lFieldArray);

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
calcStartAmounts
****************/
function calcStartAmounts(inputArray) {

    myValue = 0;

    //Build our amount set
    inputArray.forEach((fieldObject) => {
        if (fieldObject.fieldType == "money" && fieldObject.startOrEnd == "start") {
            myValue = myValue + fieldObject.fieldValue;
        }
    });

    return myValue;

}

/****************
calcAddAmounts
****************/
function calcAddAmounts(inputArray) {

    myValue = 55;

    return myValue;

}

/****************
calcSubtractAmounts
****************/
function calcSubtractAmounts(inputArray) {

    myValue = 33;

    return myValue;

}

/****************
calcEndAmounts
****************/
function calcEndAmounts(inputArray) {

    myValue = 0;
    myRate = 0;

    //Build our amount set
    inputArray.forEach((fieldObject) => {
        if (fieldObject.fieldType == "money" && fieldObject.startOrEnd == "start") {
            myRate = getValue(inputArray, fieldObject.rateField)
            myValue = Number(myValue) + Number(fieldObject.fieldValue) + (Number(fieldObject.fieldValue) * Number(myRate)/100);
        }
    });

    return myValue;

}

/****************
getValue
****************/
function getValue(inputArray, inputFieldName) {

    myValue = "";

    //Build our display
    inputArray.forEach((fieldObject) => {
        if (fieldObject.fieldName == inputFieldName) {
            if (!isNaN(fieldObject.fieldValue)) {
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
Retirement Field Object
****************/
class RetirementField {

    constructor(fieldName, fieldValue, fieldDescription, fieldType = "", startOrEnd = "", rateField = "") {
        this.fieldName = fieldName;
        if (!isNaN(fieldValue)) {
            this.fieldValue = Number(fieldValue);
        }
        else {
            this.fieldValue = fieldValue;
        }

        this.fieldDescription = fieldDescription;
        this.fieldType = fieldType;
        this.startOrEnd = startOrEnd;
        this.rateField = rateField;
        this.initField();
    }

    /****************
    fieldDisplayRow
    ****************/
    fieldDisplayRow() {

        var myResponse = "";

        myResponse = myResponse + "<tr>";
        myResponse = myResponse + "<td width='50%'><p align='right' valign='top'>_FIELDDESCRIPTION_:&nbsp;&nbsp;</p></td>";
        myResponse = myResponse + "<td width='50%'><textarea rows='1' cols='15' id='_FIELDNAME_'>_FIELDVALUE_</textarea></td>";
        myResponse = myResponse + "</tr>";

        myResponse = myResponse.replace("_FIELDNAME_", this.fieldName);
        myResponse = myResponse.replace("_FIELDVALUE_", this.fieldValue);
        myResponse = myResponse.replace("_FIELDDESCRIPTION_", this.fieldDescription);

        return myResponse;

    }

    /****************
    Initialize data field
    ****************/
    initField() {

        if (this.getDataValue()) {
            this.fieldValue = this.getDataValue();
        }


    }

    /****************
    setDataValue
    ****************/
    setDataValue() {

        localStorage.setItem(this.fieldName, this.fieldValue);
        console.log("Retirement Calculator Set " + this.fieldName + " to " + this.fieldValue);

    }


    /****************
    getDataValue
    ****************/
    getDataValue() {

        this.fieldValue = localStorage.getItem(this.fieldName);

        console.log("Retirement Calculator Got " + this.fieldName + " = " + this.fieldValue);

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