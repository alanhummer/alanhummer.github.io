//And so we begin....
document.addEventListener("DOMContentLoaded", onDOMContentLoaded, false);

var gFieldArray = [];
var lFieldArray = [];
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
    gFieldArray = [];

    gFieldArray.push(new RetirementField("yearBorn", "2001", "YEAR BORN", "year"));
    gFieldArray.push(new RetirementField("yearRetire", "2001", "YEAR RETIRE", "year"));
    gFieldArray.push(new RetirementField("yearIRA", "2001", "YEAR IRA WD", "year"));
    gFieldArray.push(new RetirementField("yearSocSec", "2001", "YEAR SOCSEC", "year"));
    gFieldArray.push(new RetirementField("yearMedicare", "2001", "YEAR MEDICARE", "year"));
    gFieldArray.push(new RetirementField("yearDie", "2001", "YEAR DIE", "year"));
    gFieldArray.push(new RetirementField("BREAK", "", "", ""));
    gFieldArray.push(new RetirementField("medicalExpense", "10000", "PRE-MEDCARE/MTH", "money", "expense", "monthly", "inflation", "yearRetire", "yearMedicare", "", "cash"));
    gFieldArray.push(new RetirementField("livingExpense", "10000", "LIVING EXP/MTH", "money", "expense", "monthly", "inflation", "yearRetire", "yearDie", "", "cash"));
    gFieldArray.push(new RetirementField("inflation", "2", "INFLATION/YR", "rate"));   
    gFieldArray.push(new RetirementField("BREAK", "", "", ""));
    gFieldArray.push(new RetirementField("cash", "0", "CASH", "money", "investment", "yearly", "cash-return"));
    gFieldArray.push(new RetirementField("cash-return", "0", "CASH RETURN", "rate"));
    gFieldArray.push(new RetirementField("socSec", "1000", "SOC SEC NOW", "money", "income", "monthly", "secsec-inflation", "yearSocSec", "yearDie", "cash"));
    gFieldArray.push(new RetirementField("secsec-inflation", "3", "SOC SEC INFLATION", "rate"));
    gFieldArray.push(new RetirementField("rothIRAAl", "10000", "IRA 1 BAL", "money", "investment", "yearly", "rothIRAAl-return", "yearIRA", "yearDie"));
    gFieldArray.push(new RetirementField("rothIRAAl-return", "3", "IRA 1 RET/YR", "rate"));
    gFieldArray.push(new RetirementField("rothIRAA2", "10000", "IRA 2 BAL", "money", "investment", "yearly", "rothIRAA2-return", "yearIRA", "yearDie"));
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
    var investmentReturnAmount = 0;
    var incomeAmount = 0;
    var expenseAmount = 0;
    var endAmount = 0;
    var expenseToWithdraw = 0;
    lFieldArray = [];

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

    onDOMContentLoaded();

    //Data is good, lets rip thru it and apply our time algorithm..since updating, make a copy
    lFieldArray = gFieldArray;

    resultReport = "<table class='output-report' border='1px' width='100%' cellpadding='10' cellspacing='10'><tr><td align='center'>YEAR</td><td align='center'>START</td><td align='center'>RETURN</td><td align='center'>INCOME</td><td align='center'>EXPENSE</td><td align='center'>END</td></tr>"
    for (let i = currentDate.getFullYear(); i < getValue(lFieldArray, "yearDie"); i++) {

        startAmount = 0;
        incomeAmount = 0;
        investmentReturnAmount = 0;
        expenseAmount = 0;
        endAmount = 0;
        expenseToWithdraw = 0;

        lFieldArray.forEach((fieldObject) => {

            fieldObject.cycleYear(i); 
            switch(fieldObject.moneyType) {
                case "investment":
                    startAmount = startAmount + fieldObject.yearStartAmount;
                    investmentReturnAmount = investmentReturnAmount + fieldObject.yearInvestmentReturnAmount;
                    endAmount = endAmount + fieldObject.yearEndAmount;
                  break;
                case "income":
                    //collect the income, deposit it into cash
                    incomeAmount = incomeAmount + fieldObject.yearIncome;
                    endAmount = endAmount + fieldObject.yearIncome;
                  break;
                case "expense":
                    //collect the income, deposit it into cash
                    expenseAmount = expenseAmount + fieldObject.yearExpense;
                    endAmount = endAmount - fieldObject.yearExpense;
                    break;
                default:
                  // else, do nothing
            }
        });     
        
        //Deposit income into account
        lFieldArray.forEach((fieldObject) => {
            if (fieldObject.yearIncome > 0) {
                console.log("We have some income", fieldObject);
                lFieldArray.forEach((fieldObject2) => {
                    if (fieldObject2.fieldName == fieldObject.depositAccount) {
                        fieldObject2.fieldValue = fieldObject2.fieldValue + fieldObject.yearIncome;
                        fieldObject2.yearEndAmount = fieldObject2.fieldValue;
                        console.log("Put income in here", fieldObject2);
                    }
                });
            }
        });

        //Withdraw expenses from account
        lFieldArray.forEach((fieldObject) => {
            expenseToWithdraw = expenseToWithdraw + fieldObject.yearExpense;
            if (expenseToWithdraw > 0) {
                console.log("We have some expense", fieldObject);
                var blnDidWithdrawAccount = false;
                lFieldArray.forEach((fieldObject2) => {
                    if (expenseToWithdraw > 0) {
                        if (blnDidWithdrawAccount) {
                            //All ready emptied the withdraw account and still have money we need
                            //so hang on
                        }
                        else {
                            if (fieldObject2.fieldName == fieldObject.withdrawAccount) {
                                if (fieldObject2.fieldValue >= expenseToWithdraw) {
                                    fieldObject2.fieldValue = fieldObject2.fieldValue - expenseToWithdraw;
                                    fieldObject2.yearEndAmount = fieldObject2.fieldValue;
                                    expenseToWithdraw = 0;
                                    console.log("Put income in here", fieldObject2);
                                }
                                else {
                                    expenseToWithdraw = expenseToWithdraw - fieldObject2.fieldValue;
                                    fieldObject2.fieldValue = 0;
                                }
                                blnDidWithdrawAccount = true;
                            }
                        }
                    }
                });
            }
        });

        //We got here, we drained whatever funds we could for expenses via withdrawal account
        //If we still owe money, start to empty investments in sequence
        if (expenseToWithdraw > 0) {
            console.log("We have some expenses yet to fill " + expenseToWithdraw);
            lFieldArray.forEach((fieldObject) => {
                if (expenseToWithdraw > 0) {
                    //Still more to go
                    if (fieldObject.moneyType == "investment") {

                        //Should pull from IRA's based on IRA year...   .
                        var blnHandleMoney = false
                        if (fieldObject.startYear && fieldObject.endYear) {
                            if (fieldObject.startYear != "" && fieldObject.endYear != "") {
                                if (i >= getValue(gFieldArray, fieldObject.startYear) && inputYear <= getValue(gFieldArray, fieldObject.endYear)) {
                                    blnHandleMoney = true;
                                }              
                            }
                            else {
                                blnHandleMoney = true; 
                            }
                        }
                        else {
                            blnHandleMoney = true;
                        }

                        //Pull from here if it is open

                        if (blnHandleMoney) {
                            if (fieldObject.fieldValue >= expenseToWithdraw) {
                                fieldObject.fieldValue = fieldObject.fieldValue - expenseToWithdraw;
                                expenseToWithdraw = 0;
                                fieldObject.yearEndAmount = fieldObject.fieldValue;
                                console.log("Pulled money from here", fieldObject);
                            }
                            else {
                                expenseToWithdraw = expenseToWithdraw - fieldObject.fieldValue;
                                fieldObject.fieldValue = 0;
                            }
                        }
                    }
                }
            });
        }

        resultReport = resultReport + "<tr><td align='center' width='10%'>" + i + "</td><td width='20%' align='right'>" + currency(startAmount) + "&nbsp;</td><td width='20%' align='right'>" + currency(investmentReturnAmount) + "</td><td width='15%' align='right'>" + currency(incomeAmount) + "</td>";
        if (expenseAmount > 0) {
            resultReport = resultReport + "<td width='15%' align='right'><font color='red'>-" + currency(expenseAmount) + "</font></td>";
        } 
        else {
            resultReport = resultReport + "<td width='15%' align='right'>" + currency(expenseAmount) + "</td>";
        }
        resultReport = resultReport + "<td width='20%' align='right'>" + currency(endAmount) + "</td></tr>";
    };

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

    constructor(fieldName, fieldValue, fieldDescription, fieldType = "", moneyType = "", timePeriod = "", rateField = "", startYear = "", endYear = "", depositAccount ="", withdrawAccount = "") {
        this.fieldName = fieldName;
        if (isNumber(fieldValue)) {
            this.fieldValue = Number(trimNumber(fieldValue));
        }
        else {
            this.fieldValue = fieldValue;
        }

        this.fieldDescription = fieldDescription;
        this.fieldType = fieldType;
        this.moneyType = moneyType; //income, expense, investment
        this.timePeriod = timePeriod;
        this.rateField = rateField;
        this.startYear = startYear;
        this.endYear = endYear;
        this.netChange = 0;
        this.yearStartAmount = 0;
        this.yearIncome = 0;
        this.yearInvestmentReturnAmount = 0;
        this.yearExpense = 0;
        this.yearEndAmount = 0;
        this.depositAccount = depositAccount;
        this.withdrawAccount = withdrawAccount;

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

    /****************
    cycleYear
    ****************/
    cycleYear(inputYear) {

        var myRate = 0;
        var blnHandleMoney = false;

        this.netChange = 0;
        this.yearStartAmount = 0;
        this.yearIncome = 0;
        this.yearInvestmentReturnAmount = 0;
        this.yearExpense = 0;
        this.yearEndAmount = 0;

        //Increase by rate of growth 
        if (this.fieldType == "money" && Number(this.fieldValue) > 0) {

            //Everything rolls forward by interest rate
            myRate = getValue(gFieldArray, this.rateField);
            this.fieldNetChange = (Number(this.fieldValue) * Number(myRate)/100);

            //See if this money is in play for this year range
            if (this.startYear && this.endYear) {
                if (this.startYear != "" && this.endYear != "") {
                    if (inputYear >= getValue(gFieldArray, this.startYear) && inputYear <= getValue(gFieldArray, this.endYear)) {
                        blnHandleMoney = true;
                    }              
                }
                else {
                    blnHandleMoney = true; 
                }
            }
            else {
                blnHandleMoney = true;
            }
 
            //We've add interest and figured out if in play...lets handle it
            if (blnHandleMoney) {

                if (this.moneyType == "income") { //like investment gains, ss, other income

                    if (this.timePeriod == "monthly") {
                        this.yearIncome = Number(Number(this.fieldValue) * 12);
                    }
                    else {
                        this.yearIncome = Number(this.fieldNetChange);
                    }
                    
                }
                else {
                    if (this.moneyType == "expense") { //like COL, med insurance

                        if (this.timePeriod == "monthly") {
                            this.yearExpense = Number(Number(this.fieldValue) * 12);
                        }
                        else {
                            this.yearExpense = Number(this.fieldNetChange);
                        }
                    }
                    else {
                        //Do nothing...
                    }
                }
            }

            //For investments, they will always grow.
            if (this.moneyType == "investment") {
                this.yearStartAmount = Number(this.fieldValue);
                this.yearInvestmentReturnAmount = Number(this.fieldNetChange);
                this.yearEndAmount = Number(this.fieldValue) + Number(this.fieldNetChange);
            }

            //End of yaer, cycled up by net change amount
            this.fieldValue = Number(this.fieldValue) + Number(this.fieldNetChange);

            //console.log("END YEAR CYCLE ", this);

        } 
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