//TO DO: Add fields via a wizard, so user can build their own retirement calcualtor
//Data entry for a field and all the settings --> stored and used then again

//SCENARIOS - Loading and changing scenarios needs work
//CALC Has issues with default scenaro...go negative but comes back

//And so we begin....
document.addEventListener("DOMContentLoaded", onDOMContentLoaded, false);

var gFieldArray = [];
var lFieldArray = [];
var gYearDetailsArray = [];
var gScenarioArray = [];
//var gScenario = {scenarioName: "Default", scenarioNote: "<Add your notes here for the default scenario>"};
var gScenario = {scenarioName: "", scenarioNote: ""};
var gScenarioOptionsHTML = "";
var formatter;
var currentDate = new Date();

//Initialize our scenarios
gScenarioArray = JSON.parse(localStorage.getItem('scenarioArray'));
if (!gScenarioArray) {
    gScenarioArray = [];
}

//gScenarioArray.push(gScenario);

/****************
When Page loads we start
****************/
function onDOMContentLoaded() {

    var outputTable = "<table border='0' cellpadding='0' cellspacing='0' width='100%'>_RETIREMENTFIELDS_</table>";
    var outputRows = "";
    gFieldArray = [];
    gYearDetailsArray = [];

    //Initialize our secnarios
    gScenario.scenarioName = localStorage.getItem("scenarioSelected");

    //And clear out our new scenario
    document.getElementById("new-scenario").value = "";

    loadScenarios(gScenario);

    loadScenario(gScenario.scenarioName);

    if (gScenarioArray.length > 0) {
        document.getElementById("scenarioOptions").style.display = "block";
    }
    else {
        document.getElementById("scenarioOptions").style.display = "none";
    }
    
    //Fields are -fieldName, fieldValue, fieldDescription, fieldType, moneyType, timePeriod, rateField, startYear, endYear, accrueBeforeStart, depositAccount, withdrawAccount, defaultCashAccount) {


    //Add our feilds - Setup the time horizon
    gFieldArray.push(new RetirementField("yearBorn", "1969", "YEAR BORN", "year"));
    gFieldArray.push(new RetirementField("yearRetire", "2025", "YEAR RETIRE", "year"));
    gFieldArray.push(new RetirementField("yearIRA", "2031", "YEAR IRA WD", "year"));
    gFieldArray.push(new RetirementField("yearSocSec", "2034", "YEAR SOCSEC", "year"));
    gFieldArray.push(new RetirementField("yearMedicare", "2034", "YEAR MEDICARE", "year"));
    gFieldArray.push(new RetirementField("yearDie", "2059", "YEAR DIE", "year"));
    gFieldArray.push(new RetirementField("---------", "", "", "break"));

    //Our expenses
    gFieldArray.push(new RetirementField("medicalExpense", "0", "PRE-MEDCARE/MTH", "money", "expense", "monthly", "inflation", "yearRetire", "yearMedicare", true, "", "cash"));
    gFieldArray.push(new RetirementField("livingExpense", "0", "LIVING EXP/YR", "money", "expense", "yearly", "inflation", "yearRetire", "yearDie", true, "", "cash"));
    gFieldArray.push(new RetirementField("inflation", "0", "INFLATION/YR", "rate")); 
    gFieldArray.push(new RetirementField("---------", "", "", "break"));

    /*
    gFieldArray.push(new RetirementField("automotive", "0", "AUTOMOTIVE/YR", "money", "expense", "yearly", "inflation", "yearRetire", "yearDie", true, "", "cash"));
    gFieldArray.push(new RetirementField("boat", "0", "BOAT/YR", "money", "expense", "yearly", "inflation", "yearRetire", "yearDie", true, "", "cash"));
    gFieldArray.push(new RetirementField("christmas", "0", "CHRISTMAS/YR", "money", "expense", "yearly", "inflation", "yearRetire", "yearDie", true, "", "cash"));
    gFieldArray.push(new RetirementField("donations", "0", "DONATIONS/YR", "money", "expense", "yearly", "inflation", "yearRetire", "yearDie", true, "", "cash"));
    gFieldArray.push(new RetirementField("education", "0", "EDUCATION/YR", "money", "expense", "yearly", "inflation", "yearRetire", "yearDie", true, "", "cash"));
    gFieldArray.push(new RetirementField("food", "0", "FOOD/YR", "money", "expense", "yearly", "inflation", "yearRetire", "yearDie", true, "", "cash"));
    gFieldArray.push(new RetirementField("home", "0", "HOME IMP/YR", "money", "expense", "yearly", "inflation", "yearRetire", "yearDie", true, "", "cash"));
    gFieldArray.push(new RetirementField("inctax", "0", "INCOME TAX/YR", "money", "expense", "yearly", "inflation", "yearRetire", "yearDie", true, "", "cash"));
    gFieldArray.push(new RetirementField("realestatetax", "0", "REAL EST TAX/YR", "money", "expense", "yearly", "inflation", "yearRetire", "yearDie", true, "", "cash"));
    gFieldArray.push(new RetirementField("medicalservices", "0", "MED SVCS/YR", "money", "expense", "yearly", "inflation", "yearRetire", "yearDie", true, "", "cash"));
    gFieldArray.push(new RetirementField("travel-ent-eatout", "0", "TRAVEL/ENT/REST/YR", "money", "expense", "yearly", "inflation", "yearRetire", "yearDie", true, "", "cash"));
    gFieldArray.push(new RetirementField("utilities", "0", "UTILITIES/YR", "money", "expense", "yearly", "inflation", "yearRetire", "yearDie", true, "", "cash"));
    gFieldArray.push(new RetirementField("merchandise", "0", "OTHER MERCH/YR", "money", "expense", "yearly", "inflation", "yearRetire", "yearDie", true, "", "cash"));
    gFieldArray.push(new RetirementField("condoproptax", "0", "CONDO PROP TAX/YR", "money", "expense", "yearly", "inflation", "yearRetire", "yearDie", true, "", "cash"));
    gFieldArray.push(new RetirementField("condofees", "0", "CONDO FEES/MTH", "money", "expense", "monthly", "inflation", "yearRetire", "yearDie", true, "", "cash"));
    gFieldArray.push(new RetirementField("condoutilities", "0", "CONDO UTILS/MTH", "money", "expense", "monthly", "inflation", "yearRetire", "yearDie", true, "", "cash"));
    gFieldArray.push(new RetirementField("condoextras", "0", "CONDO EXTRAS/MTH", "money", "expense", "monthly", "inflation", "yearRetire", "yearDie", true, "", "cash"));
    gFieldArray.push(new RetirementField("---------", "", "", "break"));
*/

    //Income
    gFieldArray.push(new RetirementField("socSec", "0", "SOC AT BENE TIME", "money", "income", "monthly", "secsec-inflation", "yearSocSec", "yearDie", false, "cash", ""));
    gFieldArray.push(new RetirementField("secsec-inflation", "0", "SOC SEC INFLATION", "rate"));
    gFieldArray.push(new RetirementField("pension", "0", "PENSION NOW", "money", "income", "monthly", "pension-inflation", "yearRetire", "yearDie", true, "cash", ""));
    gFieldArray.push(new RetirementField("pension-inflation", "0", "PENSION INFLATION", "rate"));
    gFieldArray.push(new RetirementField("rental", "0", "RENTAL INC", "money", "income", "monthly", "rental-inflation", "", "yearDie", true, "cash", ""));
    gFieldArray.push(new RetirementField("rental-inflation", "0", "RENTAL INFLATION", "rate"));
    gFieldArray.push(new RetirementField("---------", "", "", "break"));

    //Cash/savings
    gFieldArray.push(new RetirementField("cash", "0", "CHECKING", "money", "investment", "yearly", "cash-return", "", "", true, "", "", true));
    gFieldArray.push(new RetirementField("cash-return", "0", "CASH RETURN", "rate"));
    gFieldArray.push(new RetirementField("mmk1", "0", "MON MKT 1", "money", "investment", "yearly", "mmk1-return"));
    gFieldArray.push(new RetirementField("mmk1-return", "0", "MON MKT 1 RETURN", "rate"));
    gFieldArray.push(new RetirementField("mmk2", "0", "MON MKT 2", "money", "investment", "yearly", "mmk2-return"));
    gFieldArray.push(new RetirementField("mmk2-return", "0", "MON MKT 2 RETURN", "rate"));
    gFieldArray.push(new RetirementField("---------", "", "", "break"));

    //Regular investments
    gFieldArray.push(new RetirementField("brokerage", "0", "BROKERAGE", "money", "investment", "yearly", "brokerage-return"));
    gFieldArray.push(new RetirementField("brokerage-return", "0", "BROKER RETURN", "rate"));

    //Retirment accounts
    gFieldArray.push(new RetirementField("rothIRAAl", "0", "ROTH 1 BAL", "money", "investment", "yearly", "rothIRAAl-return", "yearIRA", "yearDie"));
    gFieldArray.push(new RetirementField("rothIRAAl-return", "0", "ROTH 1 RET/YR", "rate"));
    gFieldArray.push(new RetirementField("rothIRAA2", "0", "ROTH 2 BAL", "money", "investment", "yearly", "rothIRAA2-return", "yearIRA", "yearDie"));
    gFieldArray.push(new RetirementField("rothIRAA2-return", "0", "ROTH 2 RET/YR", "rate"));
    gFieldArray.push(new RetirementField("regIRAA1", "0", "REG IRA 1 BAL", "money", "investment", "yearly", "regIRAA1-return", "yearIRA", "yearDie"));
    gFieldArray.push(new RetirementField("regIRAA1-return", "0", "REG IRA 1 RET/YR", "rate"));
    gFieldArray.push(new RetirementField("regIRAA2", "0", "REG IRA 2 BAL", "money", "investment", "yearly", "regIRAA2-return", "yearIRA", "yearDie"));
    gFieldArray.push(new RetirementField("regIRAA2-return", "0", "REG IRA 2 RET/YR", "rate"));
    gFieldArray.push(new RetirementField("regIRAA3", "0", "REG IRA 3 BAL", "money", "investment", "yearly", "regIRAA3-return", "yearIRA", "yearDie"));
    gFieldArray.push(new RetirementField("regIRAA3-return", "0", "REG IRA 3 RET/YR", "rate"));    
    gFieldArray.push(new RetirementField("401K-1", "0", "401K 1 BAL", "money", "investment", "yearly", "401K-1-return", "yearIRA", "yearDie"));
    gFieldArray.push(new RetirementField("401K-1-return", "0", "401K 1 RET/YR", "rate"));
    gFieldArray.push(new RetirementField("401K-2", "0", "401K 2 BAL", "money", "investment", "yearly", "401K-2-return", "yearIRA", "yearDie"));
    gFieldArray.push(new RetirementField("401K-2-return", "0", "401K 2 RET/YR", "rate"));   
    gFieldArray.push(new RetirementField("---------", "", "", "break"));

    //Education accounts
    gFieldArray.push(new RetirementField("coverdell-1", "0", "COVERDELL 1", "money", "investment", "yearly", "coverdell-1-return"));
    gFieldArray.push(new RetirementField("coverdell-1-return", "0", "COVER 1 RETURN", "rate"));
    gFieldArray.push(new RetirementField("coverdell-2", "0", "COVERDELL 2", "money", "investment", "yearly", "coverdell-2-return"));
    gFieldArray.push(new RetirementField("coverdell-2-return", "0", "COVER 2 RETURN", "rate"));
    gFieldArray.push(new RetirementField("---------", "", "", "break"));

    //Build our display
    gFieldArray.forEach((fieldObject) => {
        outputRows = outputRows + fieldObject.fieldDisplayRow();
        //console.log("ROW IS: " + outputRows);
    });

    outputTable = outputTable.replace(/_RETIREMENTFIELDS_/gi, outputRows);
    document.getElementById("input-fields").innerHTML = outputTable;

    showPageView("inputs");
}

/****************
doCalc
****************/
function doCalc() {

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

    //Grab scenario - if new one, add it
    if (document.getElementById("new-scenario").value.length > 0) {
        gScenario.scenarioName = document.getElementById("new-scenario").value;
        gScenario.scenarioNote = "";
        addScenario(gScenario);
     }
    else {
        if (document.getElementById('scenario').value.length > 0) {
            gScenario.scenarioName = document.getElementById("scenario").value;
            loadScenario(gScenario.scenarioName);
        }
        else {
            //We have no scenario
            alert("You must have a name for this scenario");
            gScenario.scenarioName = "";
            return;
        }
    }

    //Store the choice
    localStorage.setItem("scenarioSelected", gScenario.scenarioName);

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
    for (let i = currentDate.getFullYear(); i <= getValue(lFieldArray, "yearDie"); i++) {

        startAmount = 0;
        incomeAmount = 0;
        investmentReturnAmount = 0;
        expenseAmount = 0;
        expenseToWithdraw = 0;
        changeAmount = 0;
        incomeToDeposit = 0;

        lFieldArray.forEach((fieldObject) => {

            //4 fields tracking: startAmount, investmentReturnAmount, incomeAmount, expenseAmount --> endAmount
            fieldObject.yearProcessed = i;
            fieldObject.cycleYear(i); 
            switch(fieldObject.moneyType) {
                case "investment":
                    startAmount = startAmount + fieldObject.yearStartAmount;
                    investmentReturnAmount = investmentReturnAmount + fieldObject.yearInvestmentReturnAmount;
                    //endAmount = endAmount + fieldObject.yearEndAmount;
                    changeAmount = changeAmount + fieldObject.yearInvestmentReturnAmount;
                  break;
                case "income":
                    //collect the income, deposit it into cash
                    incomeAmount = incomeAmount + fieldObject.yearIncome;
                    changeAmount = changeAmount + fieldObject.yearIncome;
                  break;
                case "expense":
                    //collect the income, deposit it into cash
                    expenseAmount = expenseAmount + fieldObject.yearExpense;
                    changeAmount = changeAmount - fieldObject.yearExpense;
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

        //If we still have money, clean it up
        if (incomeToDeposit > 0) {
            //Now we go negative
            lFieldArray.forEach((fieldObject) => {
                if (incomeToDeposit > 0) {
                    //Still more to go
                    //console.log("WE HAVE MORE EXPENSE GOING RED " + expenseToWithdraw);
                    if (fieldObject.defaultCashAccount) {

                        fieldObject.fieldValue = fieldObject.fieldValue + incomeToDeposit;
                        fieldObject.yearEndAmount = fieldObject.fieldValue;
                        incomeToDeposit = 0;
                     
                    }
                }
            });
        }

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
                        else {
                            //Drain the account for what is left
                            if (fieldObject2.fieldValue > 0) { 
                                expenseToWithdraw = expenseToWithdraw - fieldObject2.fieldValue; 
                                fieldObject2.fieldValue = 0;
                                fieldObject2.yearEndAmount = fieldObject2.fieldValue;
                            }
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

        //If we still have debt, pay it off with whtever is left
        if (expenseToWithdraw > 0) {

            lFieldArray.forEach((fieldObject) => {
                if (expenseToWithdraw > 0) {
                    //Still more to go
                    if (fieldObject.moneyType == "investment") {

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
            });
        }

        //But, if we still have debt, we are going into the red
        if (expenseToWithdraw > 0) {
            //Now we go negative
            lFieldArray.forEach((fieldObject) => {
                if (expenseToWithdraw > 0) {
                    //Still more to go
                    //console.log("WE HAVE MORE EXPENSE GOING RED " + expenseToWithdraw);
                    if (fieldObject.defaultCashAccount) {

                        fieldObject.fieldValue = fieldObject.fieldValue - expenseToWithdraw;
                        fieldObject.yearEndAmount = fieldObject.fieldValue;
                        expenseToWithdraw = 0;

                        //console.log("PULLED FROM", fieldObject);

                    }
                }
            });
        }

        //OK, these should be 0, but use em anyway
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
        resultReport = resultReport + "<td width='20%' align='right'>" + currency(startAmount + changeAmount) + "</td></tr>";
    };

    endAmount = startAmount + changeAmount; //This if where finally landed

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
        errorMessages = errorMessages + "Not looking good for your heirs. You are " + currency(endAmount) + " in the hole";
    }
    else {
        if (endAmount <= 100000 ) {
            errorMessages = errorMessages + "Very good. You've timed it right and can maybe take care of the service with " + currency(endAmount) + " left";
        }
        else {
            if (endAmount <= 1000000 ) {
                errorMessages = errorMessages + "Nice little nest egg for your loved ones of " + currency(endAmount) + " will be appreciated";
            }
            else {
                if (endAmount <= 10000000 ) {
                    errorMessages = errorMessages + "Yer risking generational wealth and spoiling your heirs with this " + currency(endAmount) + " windfall";
                }
                else {
                    if (endAmount <= 50000000 ) {
                        errorMessages = errorMessages + "You should really spend this money and not save it all. Seriously, " + currency(endAmount) + " is too much to leave behind";
                    }
                    else {
                        if (endAmount <= 50000000 ) {
                            errorMessages = errorMessages + "Ridiculous really.  Give your money away before you die. Or you will ruin your heirs. A needy family could use some of the " + currency(endAmount) + " you've been hording";
                        }
                        else {
                            errorMessages = errorMessages + "This is stupid. Yer Ebineazer Scrooge. Spend your money! But an island or a private jet with the " + currency(endAmount) + " before you die!";
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
addScenario
****************/
function addScenario(inputScenario) {

    var blnFound = false;

    gScenarioArray.forEach((scenarioEntry) => { 
        if (scenarioEntry.scenarioName == inputScenario.scenarioName) {
            //alreay exists
            blnFound = true;
        }
    });
  
    if (!blnFound) { 
        gScenarioArray.push({scenarioName: inputScenario.scenarioName, scenarioNote: inputScenario.scenarioNote});
        
        //And store it
        localStorage.setItem('scenarioArray', JSON.stringify(gScenarioArray));

    }
}

/****************
loadScenarios
****************/
function loadScenarios(inputScenario) {

    var myScenarioOption = "<option value='_SCENARIONAME_' _SCENARIOSELECTED_>_SCENARIONAME_</option>";
    var myScenarioOptions = "";

    gScenarioArray.forEach((scenarioEntry) => { 
        myScenarioOptions = myScenarioOptions + myScenarioOption.replace(/_SCENARIONAME_/gi, scenarioEntry.scenarioName );
        if (scenarioEntry.scenarioName == inputScenario.scenarioName) {
            myScenarioOptions = myScenarioOptions.replace(/_SCENARIOSELECTED_/gi, "selected");
        }
        else {
            myScenarioOptions = myScenarioOptions.replace(/_SCENARIOSELECTED_/gi, "");
        }
    });

    //save original 
    if (gScenarioOptionsHTML == "") {
        gScenarioOptionsHTML = document.getElementById("scenarioOptions").innerHTML; 
    }

    document.getElementById("scenarioOptions").innerHTML = gScenarioOptionsHTML.replace(/_SCENARIOLIST_/gi, myScenarioOptions);

}

/****************
loadScenario
****************/
function loadScenario(inputScenarioName) {

    gScenarioArray.forEach((scenarioEntry) => { 
        if (scenarioEntry.scenarioName == inputScenarioName) {
            gScenario = JSON.parse(JSON.stringify(scenarioEntry));
            //Store the choice
            localStorage.setItem("scenarioSelected", gScenario.scenarioName);
        }
    });

}

/****************
loadNote
****************/
function loadNote(inputScenarioName) {

    gScenarioArray.forEach((scenarioEntry) => { 
        if (scenarioEntry.scenarioName == inputScenarioName) {
            gScenario = JSON.parse(JSON.stringify(scenarioEntry));;
            showPageView("scenarioNote");
        }
    });

    var resultReport = "<p align='center'>Note for Scenario: " + gScenario.scenarioName + "</p>";
    resultReport = resultReport + "<textarea rows='15' cols='40' id='note-detail'>" + gScenario.scenarioNote + "</textarea><br><br>";
    document.getElementById("scenarioNoteDetail").innerHTML = "<center>" + resultReport + "</center>";
    showPageView("scenarioNote");

}

/****************
loadNote
****************/
function updateNote() {

    //Update note for this scenario
    gScenario.scenarioNote = document.getElementById("note-detail").value;
    gScenarioArray.forEach((scenarioEntry) => { 
        if (scenarioEntry.scenarioName == gScenario.scenarioName) {
            scenarioEntry.scenarioNote = gScenario.scenarioNote;
        }
    });
   
    localStorage.setItem('scenarioArray', JSON.stringify(gScenarioArray));

}

/****************
showFieldDetails
****************/
function showFieldDetails(inputFieldName) {

    var displayField;
    var fieldDetailOutput = "";

    //Build our display
    gFieldArray.forEach((fieldObject) => {
        if (fieldObject.fieldName == inputFieldName) {
            displayField = fieldObject;
        }
    });

    if (displayField) {
        var fieldDetailOutput = "<p align='center'>Details for Field: " + displayField.fieldDescription + "</p>";
        fieldDetailOutput = fieldDetailOutput + "<table class='output-report' border='1px' width='100%' cellpadding='10' cellspacing='10'>";
        fieldDetailOutput = fieldDetailOutput + "<tr><td>Name:</td><td>" + displayField.fieldName + "</td></tr>";
        fieldDetailOutput = fieldDetailOutput + "<tr><td>Description:</td><td>" + displayField.fieldDescription + "</td></tr>";
        fieldDetailOutput = fieldDetailOutput + "<tr><td>Value:</td><td>" + displayField.fieldValue + "</td></tr>";
        fieldDetailOutput = fieldDetailOutput + "<tr><td>Money Type:</td><td>" + displayField.moneyType + "</td></tr>";
        fieldDetailOutput = fieldDetailOutput + "<tr><td>Time Period:</td><td>" + displayField.timePeriod + "</td></tr>";
        fieldDetailOutput = fieldDetailOutput + "<tr><td>Rate Field:</td><td>" + displayField.rateField + "</td></tr>";
        fieldDetailOutput = fieldDetailOutput + "<tr><td>Start Year:</td><td>" + displayField.startYear + "</td></tr>";
        fieldDetailOutput = fieldDetailOutput + "<tr><td>End Year:</td><td>" + displayField.endYear + "</td></tr>";
        fieldDetailOutput = fieldDetailOutput + "<tr><td>Accrue B4 Start:</td><td>" + displayField.accrueBeforeStart + "</td></tr>";
        fieldDetailOutput = fieldDetailOutput + "<tr><td>Deposit Acct:</td><td>" + displayField.depositAccount + "</td></tr>";
        fieldDetailOutput = fieldDetailOutput + "<tr><td>Withdraw Acct:</td><td>" + displayField.withdrawAccount + "</td></tr>";
        fieldDetailOutput = fieldDetailOutput + "</table>"; 

        document.getElementById("fieldDetailsDetail").innerHTML = "<center>" + fieldDetailOutput + "</center>";
        showPageView("fieldDetails");
    }

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
    document.getElementById("scenarioNote").style.display = "none";
    document.getElementById("fieldDetails").style.display = "none";
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
    var priorYearButton = "";
    var nextYearButton = "";

    if (inputYear != currentDate.getFullYear()) {
        priorYearButton = "<img src='prior-arrow.png' valign='middle' height='50' onclick='showYearDetail(" + (inputYear - 1) + ")'>";
    }

    if (inputYear != getValue(lFieldArray, "yearDie")) {
        nextYearButton = "<img src='next-arrow.png' valign='middle' height='50' onclick='showYearDetail(" + (inputYear + 1) + ")'>";
    }          

    var resultReport = "<p align='center' valign='bottom'>" + priorYearButton + "&nbsp&nbsp;&nbsp&nbsp;Showing Results for " + inputYear + "&nbsp&nbsp;&nbsp&nbsp;" + nextYearButton + "</p>";
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

    var myValue = "";

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
    
        });
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

    constructor(fieldName, fieldValue, fieldDescription, fieldType = "", moneyType = "", timePeriod = "", rateField = "", startYear = "", endYear = "", accrueBeforeStart = true, depositAccount ="", withdrawAccount = "", defaultCashAccount = false) {
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
        this.defaultCashAccount = defaultCashAccount;

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
            myResponse = myResponse + "<td width='50%'><p align='right' valign='top'><a onclick='showFieldDetails(_FIELDNAMEPARM_);'>_FIELDDESCRIPTION_:</a>&nbsp;&nbsp;</p></td>";
            myResponse = myResponse + "<td width='50%'><textarea rows='1' cols='15' id='_FIELDNAME_'>_FIELDVALUE_</textarea></td>";
            myResponse = myResponse + "</tr>";
    
            myResponse = myResponse.replace(/_FIELDNAME_/gi, this.fieldName);
            myResponse = myResponse.replace(/_FIELDNAMEPARM_/gi, '"' + this.fieldName + '"');
            if (this.fieldType == "money") {
                myResponse = myResponse.replace(/_FIELDVALUE_/gi, currency(this.fieldValue));
            }
            else {
                myResponse = myResponse.replace(/_FIELDVALUE_/gi, this.fieldValue);
            }
            myResponse = myResponse.replace(/_FIELDDESCRIPTION_/gi, this.fieldDescription);
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
            if (gScenario.scenarioName != "") {
                localStorage.setItem(gScenario.scenarioName + "-" + this.fieldName, trimNumber(this.fieldValue));
            }
            else {
                localStorage.setItem(this.fieldName, trimNumber(this.fieldValue));
            }
            //console.log("Retirement Calculator Set " + this.fieldName + " to " + this.fieldValue);
        }
    }


    /****************
    getDataValue
    ****************/
    getDataValue() {

        var dataValue;
        
        if (gScenario.scenarioName != "") {
            dataValue= localStorage.getItem(gScenario.scenarioName + "-" + this.fieldName);
        }
        else {
            dataValue= localStorage.getItem(this.fieldName);
        }

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
        if (this.fieldType == "money" && Number(this.fieldValue) != 0) {

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


                this.yearInvestmentReturnAmount = this.yearInvestmentReturnAmount + +0;

            }

            //End of yaer, cycled up by net change amount
            this.fieldValue = Number(this.fieldValue) + Number(this.fieldNetChange);

            //console.log("END YEAR CYCLE ", this);

        } 
    }
}



/*

//Useful code for dealing with local storage
// GET: chrome.storage.local.get(function(result){console.log(result)})
// DELETE: chrome.storage.local.clear(function(result){console.log(result)})

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