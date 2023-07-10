//And so we begin....
document.addEventListener("DOMContentLoaded", onDOMContentLoaded, false);

/****************
When Page loads we start
****************/
function onDOMContentLoaded() {

    var yearBorn = "2000";

    if (getDataValue("yearBorn")) {
        yearBorn = getDataValue("yearBorn");
    }
    document.getElementById("yearBorn").value = yearBorn;

    showPageView("inputs");
}


/****************
doCalc
****************/
function doCalc() {

    var myValue;

    setDataValue("yearBorn", document.getElementById("yearBorn").value);

    document.getElementById("outputReport").innerHTML = "<p>YEAR BORN: " + getDataValue("yearBorn") + "</p>";
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