//And so we begin....
document.addEventListener("DOMContentLoaded", onDOMContentLoaded, false);

/****************
When Page loads we start
****************/
function onDOMContentLoaded() {
    showPageView("inputs");
}


/****************
doCalc
****************/
function doCalc() {
    showPageView("output");
}

/****************
doClose
****************/
function doClose() {
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