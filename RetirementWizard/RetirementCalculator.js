//And so we begin....
document.addEventListener("DOMContentLoaded", onDOMContentLoaded, false);

/****************
When Page loads we start
****************/
function onDOMContentLoaded() {

    initField("yearBorn");
    initField("yearRetire");    
    initField("yearSocSec");
    initField("yearMedicare");
    initField("rothIRAAl");
    initField("rothIRAAl-return");

    showPageView("inputs");
}

/****************
Initialize data field
****************/
function initField(inputField) {

    var defaultValue = "2000";

    if (getDataValue(inputField)) {
        defaultValue = getDataValue(inputField);
    }
    document.getElementById(inputField).value = defaultValue;

}

/****************
doCalc
****************/
function doCalc() {

    var myValue;
    var i = 0;
    resultReport = "";

    //Save off our data
    setDataValue("yearBorn", document.getElementById("yearBorn").value);
    setDataValue("yearRetire", document.getElementById("yearRetire").value);    
    setDataValue("yearSocSec", document.getElementById("yearSocSec").value);
    setDataValue("yearMedicare", document.getElementById("yearMedicare").value);
    setDataValue("rothIRAAl", document.getElementById("rothIRAAl").value);
    setDataValue("rothIRAAl-return", document.getElementById("rothIRAAl-return").value);

    //And write out results
    
    resultReport = "<table class='output-report' border='1px'><tr><td>YEAR</td><td>START</td><td>ADD</td><td>SUBT</td><td>END</td></tr>"
    for (let i = 2025; i < 2060; i++) {
        resultReport = resultReport + "<tr><td>" + i + "</td><td>$5.5M</td><td>$100K</td><td>$150K</td><td>$5.5M</td></tr>";
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
setDataValue
****************/
function setDataValue(inputField, inputValue) {

    localStorage.setItem(inputField, inputValue);
    console.log("Retirement Calculator Set " + inputField + " to " + inputValue);

}

/****************
getDataValue
****************/
function getDataValue(inputField) {

    var outputValue;

    outputValue = localStorage.getItem(inputField);

    console.log("Retirement Calculator Got " + inputField + " = " + outputValue);

    return outputValue;

}

/****************
clearAllDataValues
****************/
function clearAllDataValues() {

    localStorage.clear();
    console.log("Retirement Calculator Cleared All ");

}

/****************
removeDataValue
****************/
function removeDataValue(inputField) {

    localStorage.removeItem(inputField);
    console.log("Retirement Calculator Removed " + inputField);

}

/*

Year Born
Year Retire
Year Start Social Security
Year Medicare/Medicaid
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