//And so we begin....
document.addEventListener("DOMContentLoaded", onDOMContentLoaded, false);

var gFieldArray = [];

/****************
When Page loads we start
****************/
function onDOMContentLoaded() {

    var outputTable = "<table border='0' cellpadding='0' cellspacing='0' width='100%'>_RETIREMENTFIELDS_</table>";
    var outputRows = "";

    gFieldArray.push(new RetirementField("yearBorn", "2001", "YEAR BORN"));
    gFieldArray.push(new RetirementField("yearRetire", "2001", "YEAR RETIRE"));
    gFieldArray.push(new RetirementField("yearSocSec", "2001", "YEAR SOCSEC"));
    gFieldArray.push(new RetirementField("yearMedicare", "2001", "YEAR MEDICARE"));
    gFieldArray.push(new RetirementField("yearDie", "2001", "YEAR DIE"));
    gFieldArray.push(new RetirementField("rothIRAAl", "2001", "IRA BAL"));
    gFieldArray.push(new RetirementField("rothIRAAl-return", "2001", "IRA RETURN"));

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
        }
    });

    if (blnBogus) {
        document.getElementById("errormessage").innerHTML = "Numbers Only";
        return;
    }

    //And write out results
    
    resultReport = "<table class='output-report' border='1px' width='100%' cellpadding='10' cellspacing='10'><tr><td align='center'>YEAR</td><td align='center'>START</td><td align='center'>ADD</td><td align='center'>SUBT</td><td align='center'>END</td></tr>"
    for (let i = document.getElementById("yearRetire").value; i < document.getElementById("yearDie").value; i++) {
        resultReport = resultReport + "<tr><td align='center' width='20%'>" + i + "</td><td width='20%' align='right'>$5.5M&nbsp;</td><td width='20%' align='right'>$100K</td><td width='20%' align='right'>$150K</td><td width='20%' align='right'>$5.5M</td></tr>";
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
Retirement Field Object
****************/
class RetirementField {

    constructor(fieldName, fieldValue, fieldDescription) {
        this.fieldName = fieldName;
        this.fieldValue = fieldValue;
        this.fieldDescription = fieldDescription;
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
        myResponse =  myResponse.replace("_FIELDDESCRIPTION_", this.fieldDescription);

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