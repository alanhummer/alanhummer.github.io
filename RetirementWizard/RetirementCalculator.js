//TO DO: Add fields via a wizard, so user can build their own retirement calcualtor
//Data entry for a field and all the settings --> stored and used then again

//And so we begin....
document.addEventListener("DOMContentLoaded", onDOMContentLoaded, false);

var gFieldArray = [];
var lFieldArray = [];
var gYearDetailsArray = [];
var formatter;
var currentDate = new Date();

/****************
When Page loads we start
****************/
function onDOMContentLoaded() {

    var outputTable = "<table border='0' cellpadding='0' cellspacing='0' width='100%'>_RETIREMENTFIELDS_</table>";
    var outputRows = "";
    gFieldArray = [];
    gYearDetailsArray = [];

    gFieldArray.push(new RetirementField("yearBorn", "2001", "YEAR BORN", "year"));
    gFieldArray.push(new RetirementField("yearRetire", "2001", "YEAR RETIRE", "year"));
    gFieldArray.push(new RetirementField("yearIRA", "2001", "YEAR IRA WD", "year"));
    gFieldArray.push(new RetirementField("yearSocSec", "2001", "YEAR SOCSEC", "year"));
    gFieldArray.push(new RetirementField("yearMedicare", "2001", "YEAR MEDICARE", "year"));
    gFieldArray.push(new RetirementField("yearDie", "2001", "YEAR DIE", "year"));
    gFieldArray.push(new RetirementField("---------", "", "", "break"));

    gFieldArray.push(new RetirementField("medicalExpense", "10000", "PRE-MEDCARE/MTH", "money", "expense", "monthly", "inflation", "yearRetire", "yearMedicare", true, "", "cash"));
    gFieldArray.push(new RetirementField("automotive", "10000", "AUTOMOTIVE/YR", "money", "expense", "yearly", "inflation", "yearRetire", "yearDie", true, "", "cash"));
    gFieldArray.push(new RetirementField("boat", "10000", "BOAT/YR", "money", "expense", "yearly", "inflation", "yearRetire", "yearDie", true, "", "cash"));
    gFieldArray.push(new RetirementField("christmas", "10000", "CHRISTMAS/YR", "money", "expense", "yearly", "inflation", "yearRetire", "yearDie", true, "", "cash"));
    gFieldArray.push(new RetirementField("donations", "10000", "donations/YR", "money", "expense", "yearly", "inflation", "yearRetire", "yearDie", true, "", "cash"));
    gFieldArray.push(new RetirementField("education", "10000", "education/YR", "money", "expense", "yearly", "inflation", "yearRetire", "yearDie", true, "", "cash"));
    gFieldArray.push(new RetirementField("food", "10000", "FOOD/YR", "money", "expense", "yearly", "inflation", "yearRetire", "yearDie", true, "", "cash"));
    gFieldArray.push(new RetirementField("home", "10000", "HOME IMP/YR", "money", "expense", "yearly", "inflation", "yearRetire", "yearDie", true, "", "cash"));
    gFieldArray.push(new RetirementField("inctax", "10000", "INCOME TAX/YR", "money", "expense", "yearly", "inflation", "yearRetire", "yearDie", true, "", "cash"));
    gFieldArray.push(new RetirementField("realestatetax", "10000", "REAL EST TAX/YR", "money", "expense", "yearly", "inflation", "yearRetire", "yearDie", true, "", "cash"));
    gFieldArray.push(new RetirementField("medicalservices", "10000", "MED SVCS/YR", "money", "expense", "yearly", "inflation", "yearRetire", "yearDie", true, "", "cash"));
    gFieldArray.push(new RetirementField("travel-ent-eatout", "10000", "TRAVEL/ENT/REST/YR", "money", "expense", "yearly", "inflation", "yearRetire", "yearDie", true, "", "cash"));
    gFieldArray.push(new RetirementField("utilities", "10000", "UTILITIES/YR", "money", "expense", "yearly", "inflation", "yearRetire", "yearDie", true, "", "cash"));
    gFieldArray.push(new RetirementField("merchandise", "10000", "OTHER MERCH/YR", "money", "expense", "yearly", "inflation", "yearRetire", "yearDie", true, "", "cash"));

    //gFieldArray.push(new RetirementField("livingExpense", "10000", "LIVING EXP/YR", "money", "expense", "yearly", "inflation", "yearRetire", "yearDie", true, "", "cash"));
    gFieldArray.push(new RetirementField("inflation", "2", "INFLATION/YR", "rate"));   
    gFieldArray.push(new RetirementField("---------", "", "", "break"));

    gFieldArray.push(new RetirementField("socSec", "1000", "SOC AT BENE TIME", "money", "income", "monthly", "secsec-inflation", "yearSocSec", "yearDie", false, "cash", ""));
    gFieldArray.push(new RetirementField("secsec-inflation", "3", "SOC SEC INFLATION", "rate"));
    gFieldArray.push(new RetirementField("pension", "1000", "PENSION NOW", "money", "income", "monthly", "pension-inflation", "yearRetire", "yearDie", true, "cash", ""));
    gFieldArray.push(new RetirementField("pension-inflation", "3", "PENSION INFLATION", "rate"));
    gFieldArray.push(new RetirementField("rental", "1000", "RENTAL INC", "money", "income", "monthly", "rental-inflation", "", "yearDie", true, "cash", ""));
    gFieldArray.push(new RetirementField("rental-inflation", "3", "RENTAL INFLATION", "rate"));
    gFieldArray.push(new RetirementField("---------", "", "", "break"));

    gFieldArray.push(new RetirementField("cash", "0", "CHECKING", "money", "investment", "yearly", "cash-return"));
    gFieldArray.push(new RetirementField("cash-return", "0", "CASH RETURN", "rate"));
    gFieldArray.push(new RetirementField("mmk1", "0", "MON MKT 1", "money", "investment", "yearly", "mmk1-return"));
    gFieldArray.push(new RetirementField("mmk1-return", "0", "MON MKT 1 RETURN", "rate"));
    gFieldArray.push(new RetirementField("mmk2", "0", "MON MKT 2", "money", "investment", "yearly", "mmk2-return"));
    gFieldArray.push(new RetirementField("mmk2-return", "0", "MON MKT 2 RETURN", "rate"));
    gFieldArray.push(new RetirementField("---------", "", "", "break"));

    gFieldArray.push(new RetirementField("rothIRAAl", "10000", "ROTH 1 BAL", "money", "investment", "yearly", "rothIRAAl-return", "yearIRA", "yearDie"));
    gFieldArray.push(new RetirementField("rothIRAAl-return", "3", "ROTH 1 RET/YR", "rate"));
    gFieldArray.push(new RetirementField("rothIRAA2", "10000", "ROTH 2 BAL", "money", "investment", "yearly", "rothIRAA2-return", "yearIRA", "yearDie"));
    gFieldArray.push(new RetirementField("rothIRAA2-return", "3", "ROTH 2 RET/YR", "rate"));
    gFieldArray.push(new RetirementField("regIRAA1", "10000", "REG IRA 1 BAL", "money", "investment", "yearly", "regIRAA1-return", "yearIRA", "yearDie"));
    gFieldArray.push(new RetirementField("regIRAA1-return", "3", "REG IRA 1 RET/YR", "rate"));
    gFieldArray.push(new RetirementField("regIRAA2", "10000", "REG IRA 2 BAL", "money", "investment", "yearly", "regIRAA2-return", "yearIRA", "yearDie"));
    gFieldArray.push(new RetirementField("regIRAA2-return", "3", "REG IRA 2 RET/YR", "rate"));
    gFieldArray.push(new RetirementField("regIRAA3", "10000", "REG IRA 3 BAL", "money", "investment", "yearly", "regIRAA3-return", "yearIRA", "yearDie"));
    gFieldArray.push(new RetirementField("regIRAA3-return", "3", "REG IRA 3 RET/YR", "rate"));    
    gFieldArray.push(new RetirementField("401K-1", "10000", "401K 1 BAL", "money", "investment", "yearly", "401K-1-return", "yearIRA", "yearDie"));
    gFieldArray.push(new RetirementField("401K-1-return", "3", "401K 1 RET/YR", "rate"));
    gFieldArray.push(new RetirementField("401K-2", "10000", "401K 2 BAL", "money", "investment", "yearly", "401K-2-return", "yearIRA", "yearDie"));
    gFieldArray.push(new RetirementField("401K-2-return", "3", "401K 2 RET/YR", "rate"));   
    gFieldArray.push(new RetirementField("---------", "", "", "break"));


    gFieldArray.push(new RetirementField("coverdell-1", "0", "COVERDELL 1", "money", "investment", "yearly", "coverdell-1-return"));
    gFieldArray.push(new RetirementField("coverdell-1-return", "0", "COVER 1 RETURN", "rate"));
    gFieldArray.push(new RetirementField("coverdell-2", "0", "COVERDELL 2", "money", "investment", "yearly", "coverdell-2-return"));
    gFieldArray.push(new RetirementField("coverdell-2-return", "0", "COVER 2 RETURN", "rate"));
    gFieldArray.push(new RetirementField("brokerage", "0", "BROKERAGE", "money", "investment", "yearly", "brokerage-return"));
    gFieldArray.push(new RetirementField("brokerage-return", "0", "BROKER RETURN", "rate"));
    gFieldArray.push(new RetirementField("---------", "", "", "break"));

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
    var incomeToDeposit = 0;
    var totalIncomeToDeposit = 0;
    var totalExpenseToWithdraw = 0;

    var errorMessages = "";

    lFieldArray = [];

    resultReport = "";

    document.getElementById("infomessage").innerHTML = "&nbsp;";

    gFieldArray.forEach((fieldObject) => {

        if (fieldObject.fieldType != "break") {

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
        document.getElementById("infomessage").innerHTML = "Numbers Only";
        return;
    }

    //Reset everything
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
        incomeToDeposit = 0;

        lFieldArray.forEach((fieldObject) => {

            //4 fields tracking: startAmount, investmentReturnAmount, incomeAmount, expenseAmount --> endAmount
            fieldObject.yearProcessed = i;
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
                
                //Track income total --> sum up all earnings
                incomeToDeposit = incomeToDeposit + fieldObject.yearIncome;

                //Deposit income into designated account
                lFieldArray.forEach((fieldObject2) => {
                    if (fieldObject2.fieldName == fieldObject.depositAccount) {
                        fieldObject2.fieldValue = fieldObject2.fieldValue + fieldObject.yearIncome;
                        fieldObject2.yearEndAmount = fieldObject2.fieldValue;

                        //Track income total --> dropped into account so decrement
                        incomeToDeposit = incomeToDeposit - fieldObject.yearIncome; 

                    }
                });
            }
        });

        //Withdraw expenses from account
        lFieldArray.forEach((fieldObject) => {
            
            if (fieldObject.yearExpense > 0) {

                //Track expense total --> sum up all expenses
                expenseToWithdraw = expenseToWithdraw + fieldObject.yearExpense;

                //Withdraw expense from designated account
                lFieldArray.forEach((fieldObject2) => {
                    if (fieldObject2.fieldName == fieldObject.withdrawAccount) {
                        if (fieldObject2.fieldValue >= fieldObject.yearExpense) {
                            fieldObject2.fieldValue = fieldObject2.fieldValue - fieldObject.yearExpense;
                            fieldObject2.yearEndAmount = fieldObject2.fieldValue;

                            //Track expense total --> pulled from account so decrement
                            expenseToWithdraw = expenseToWithdraw - fieldObject.yearExpense; 
                        }
                    }
                });
            }
        });

        //We got here, we drained whatever funds we could for expenses via withdrawal account
        //If we still owe money, start to empty investments in sequence
        if (expenseToWithdraw > 0) {

            lFieldArray.forEach((fieldObject) => {
                if (expenseToWithdraw > 0) {
                    //Still more to go
                    if (fieldObject.moneyType == "investment") {

                        //Should pull from IRA's based on IRA year...   .
                        var blnHandleMoney = false
                        if (fieldObject.startYear && fieldObject.endYear) {
                            if (fieldObject.startYear != "" && fieldObject.endYear != "") {
                                if (i >= getValue(gFieldArray, fieldObject.startYear) && i <= getValue(gFieldArray, fieldObject.endYear)) {
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
                                //console.log("Pulled money from here", fieldObject);
                            }
                            else {
                                expenseToWithdraw = expenseToWithdraw - fieldObject.fieldValue;
                                fieldObject.fieldValue = 0;
                            }
                            fieldObject.yearEndAmount = fieldObject.fieldValue;
                        }
                    }
                }
            });
        }

        totalIncomeToDeposit = totalIncomeToDeposit + incomeToDeposit;
        totalExpenseToWithdraw = totalExpenseToWithdraw + expenseToWithdraw;

        //Create clone of object and store it for reference
        var clonedArray = structuredClone(gFieldArray)
        gYearDetailsArray.push(clonedArray);

        var clickCode = "onclick='javascript:showYearDetail(" + i + ")'";
        resultReport = resultReport + "<tr " + clickCode + "><td align='center' width='10%'>" + i + "</td><td width='20%' align='right'>" + currency(startAmount) + "&nbsp;</td><td width='20%' align='right'>" + currency(investmentReturnAmount) + "</td><td width='15%' align='right'>" + currency(incomeAmount) + "</td>";
        if (expenseAmount > 0) {
            resultReport = resultReport + "<td width='15%' align='right'>" + currency(-1 * expenseAmount) + "</td>";
        } 
        else {
            resultReport = resultReport + "<td width='15%' align='right'>" + currency(expenseAmount) + "</td>";
        }
        resultReport = resultReport + "<td width='20%' align='right'>" + currency(endAmount) + "</td></tr>";
    };

    resultReport = resultReport + "</table>";

    //If we had problems with deposit or withdraw, lets let em know
    if (totalIncomeToDeposit > 0 && totalExpenseToWithdraw > 0) {
        errorMessages = errorMessages + "Mucked Up. INC: " + currency(totalIncomeToDeposit) + " vs EXP: " + currency(-1 * totalExpenseToWithdraw) + "<br>";
    }
    else {
        if (totalIncomeToDeposit > 0) {
            errorMessages = errorMessages + "Deposit failed for " + currency(totalIncomeToDeposit) + "<br>";
        }

        if (totalExpenseToWithdraw > 0) {
            errorMessages = errorMessages + "Expenses Over by " + currency(-1 * totalExpenseToWithdraw) + "<br>";
        }
    }   

    if (endAmount < 0 ) {
        errorMessages = errorMessages + "Not looking good for your heirs";
    }
    else {
        if (endAmount <= 100000 ) {
            errorMessages = errorMessages + "Very good. You've timed it right and can maybe take care of the service.";
        }
        else {
            if (endAmount <= 1000000 ) {
                errorMessages = errorMessages + "Nice little nest egg for your loved ones.";
            }
            else {
                if (endAmount <= 10000000 ) {
                    errorMessages = errorMessages + "Yer risking generational wealth and spoiling your heirs.";
                }
                else {
                    if (endAmount <= 50000000 ) {
                        errorMessages = errorMessages + "You should really spend this money and not save it all.";
                    }
                    else {
                        if (endAmount <= 50000000 ) {
                            errorMessages = errorMessages + "Ridiculous really.  Give your money away before you die. Or you will ruin your heirs.";
                        }
                        else {
                            errorMessages = errorMessages + "This is stupid. Yer Ebineazer Scrooge. Spend your money!";
                        }
                    }
                }
            }
        }
    }

    //If we have messages, show them
    if (errorMessages.length > 0) {
        document.getElementById("infomessage").innerHTML = errorMessages;
    }

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
    if (inputView != "output") {
        document.getElementById("inputs").style.display = "none";
    }
    else {
        document.getElementById("inputs").style.display = "block";
    }
    document.getElementById("output").style.display = "none";
    document.getElementById("yeardetail").style.display = "none";
    document.getElementById(inputView).style.display = "block";
}

/****************
showYearDetail
****************/
function showYearDetail(inputYear) {

    var totalStartAmount = 0
    var totalInvestmentReturnAmount = 0;
    var totalIncome = 0;
    var totalExpense = 0;
    var totalEndAmount = 0;

    var resultReport = "<p align='center'>Showing Results for " + inputYear + "</p>";
    resultReport = resultReport + "<table class='output-report' border='1px' width='100%' cellpadding='10' cellspacing='10'><tr><td align='center'>ACCT</td><td align='center'>STRT</td><td align='center'>RET</td><td align='center'>INC</td><td align='center'>EXP</td><td align='center'>END</td></tr>"
    
    gYearDetailsArray.forEach((arrayObjects) => {

        arrayObjects.forEach((fieldObject) => {

            if (fieldObject.yearProcessed == inputYear) {
                if (fieldObject.fieldType == "money") {
                    totalStartAmount = totalStartAmount + fieldObject.yearStartAmount;
                    totalInvestmentReturnAmount = totalInvestmentReturnAmount + fieldObject.yearInvestmentReturnAmount;
                    totalIncome = totalIncome + fieldObject.yearIncome;
                    totalExpense = totalExpense + fieldObject.yearExpense;
                    totalEndAmount = totalEndAmount + fieldObject.yearEndAmount;
                    resultReport = resultReport + "<tr><td width='30%'><div class='nowrap'>" + fieldObject.fieldDescription + "</div></td><td width='14%'>" + currency(fieldObject.yearStartAmount) + "</td><td width='14%'>" + currency(fieldObject.yearInvestmentReturnAmount) + "</td><td width='14%'>" + currency(fieldObject.yearIncome) + "</td><td width='14%'>" + currency(fieldObject.yearExpense, "expense") + "</td><td width='14%'>" + currency(fieldObject.yearEndAmount) + "</td></tr>";  
                }           
            }
        });        
    });
    
    //And a totals line
    resultReport = resultReport + "<tr><td width='30%'><div class='nowrap'>TOTAL:</div></td><td width='14%'>" + currency(totalStartAmount) + "</td><td width='14%'>" + currency(totalInvestmentReturnAmount) + "</td><td width='14%'>" + currency(totalIncome) + "</td><td width='14%'>" + currency(totalExpense, "expense") + "</td><td width='14%'>" + currency(totalEndAmount) + "</td></tr>";  
 
    resultReport = resultReport + "</table>";  
    document.getElementById("yeardetailReport").innerHTML = "<center>" + resultReport + "</center>";
    showPageView("yeardetail");
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
function currency(inputNumber, inputType="") {

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

    if (inputType == "expense") {
        if (inputNumber > 0) {
            return "<font color='red'>-" + formatter.format(inputNumber) + "</font>";
        }
        else {
            if (inputNumber == 0) {
                return formatter.format(inputNumber);
            }
            else {
                return "<font color='red'>" + formatter.format(inputNumber) + "</font>";
            }
        } 
    }
    else {
        if (inputNumber < 0) {
            return "<font color='red'>" + formatter.format(inputNumber) + "</font>";
        }
        else {
            return formatter.format(inputNumber);
        }      
    }

}


/****************
Retirement Field Object
****************/
class RetirementField {

    constructor(fieldName, fieldValue, fieldDescription, fieldType = "", moneyType = "", timePeriod = "", rateField = "", startYear = "", endYear = "", accrueBeforeStart = true, depositAccount ="", withdrawAccount = "") {
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
        this.accrueBeforeStart = accrueBeforeStart;
        this.netChange = 0;
        this.yearStartAmount = 0;
        this.yearIncome = 0;
        this.yearInvestmentReturnAmount = 0;
        this.yearExpense = 0;
        this.yearEndAmount = 0;
        this.yearProcessed = 0;
        this.depositAccount = depositAccount;
        this.withdrawAccount = withdrawAccount;

        this.initField();

        //console.log("CREATED OBJECT ", this);
    }

    /****************
    fieldDisplayRow
    ****************/
    fieldDisplayRow() {

        var myResponse = "";

        if (this.fieldType != "break") {

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

        if (this.fieldType != "break") {
            localStorage.setItem(this.fieldName, trimNumber(this.fieldValue));
            //console.log("Retirement Calculator Set " + this.fieldName + " to " + this.fieldValue);
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
 
            //Everything rolls forward by interest rate
            if (this.accrueBeforeStart || blnHandleMoney) {
                myRate = getValue(gFieldArray, this.rateField);
                this.fieldNetChange = (Number(this.fieldValue) * Number(myRate)/100);
            }
            else {
                this.fieldNetChange = 0;
            }

            //We've added interest and figured out if in play...lets handle it
            if (blnHandleMoney) {

                if (this.moneyType == "income") { //like investment gains, ss, other income

                    if (this.timePeriod == "monthly") {
                        this.yearIncome = Number(Number(this.fieldValue) * 12);
                    }
                    else {
                        this.yearIncome = Number(this.fieldValue);
                    }
                    
                }
                else {
                    if (this.moneyType == "expense") { //like COL, med insurance

                        if (this.timePeriod == "monthly") {
                            this.yearExpense = Number(Number(this.fieldValue) * 12);
                        }
                        else {
                            this.yearExpense = Number(this.fieldValue);
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