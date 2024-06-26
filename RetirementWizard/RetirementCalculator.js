//How to manage taxes? Build in tax rates for taxable accounts...but lots of investment income is already taxed
//
//Could clean up lacal storage so not so many "scenario-field" things, could be arrays.
//
//And so we begin....
//
//Year Detail page - bigger, readable, multi-line break
//Property Asset: Group with value, mortage, rate, payment, etc.
//Add group total/sub-total 
//
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
var gBlnMoveUp = true;
var storedMoveUp;
var subTotalAmount = 0;
var startLiquidNetWorth = 0;
var blnDoneWithSection = false;

localStorage.getItem("moveUp", storedMoveUp);
if (storedMoveUp) {
    if (storedMoveUp == "false") {
        gBlnMoveUp = false;
    }
}

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
    var storedFieldArray = [];
    var blnDoStartupHelp = false;
    var blnDidDebt = false;

    gFieldArray = [];
    gYearDetailsArray = [];

    //Initialize our secnarios
    gScenario.scenarioName = localStorage.getItem("scenarioSelected");
    gScenarioArray = JSON.parse(localStorage.getItem('scenarioArray'));
    if (!gScenarioArray) {
        gScenarioArray = [];
    }        

    //And clear out our new scenario
    document.getElementById("new-scenario").value = gScenario.scenarioName;

    loadScenarios(gScenario);

    loadScenario(gScenario.scenarioName);

    if (gScenarioArray.length > 0) {
        document.getElementById("scenarioOptions").style.display = "block";
    }
    else {
        document.getElementById("scenarioOptions").style.display = "none";
    }
    
    //Fields are -fieldName, fieldValue, fieldDescription, fieldType, moneyType, timePeriod, rateField, startYear, endYear, accrueBeforeStart, depositAccount, withdrawAccount, defaultCashAccount) {

    //If already in local storage, use it.  Else start fresh
    storedFieldArray = JSON.parse(localStorage.getItem('fieldArray'));
    if (!storedFieldArray) {
        storedFieldArray = [];
    }

    //Use if we have it
    if (storedFieldArray.length > 0) {
        //All loaded from local storage
        storedFieldArray.forEach((fieldObject) => {
            var tempRetObject = new RetirementField(fieldObject.fieldName, fieldObject.fieldValue, fieldObject.fieldDescription, fieldObject.fieldType, fieldObject.moneyType, fieldObject.timePeriod, fieldObject.rateField, fieldObject.startYear, fieldObject.endYear, fieldObject.accrueBeforeStart, fieldObject.depositAccount, fieldObject.withdrawAccount, fieldObject.defaultCashAccount, fieldObject.assetLoan);
            gFieldArray.push(tempRetObject);
            if (fieldObject.fieldName == "debtBreak") {
                blnDidDebt = true;
            }
        });
        if (!blnDidDebt) {
            gFieldArray.push(new RetirementField("debtBreak", "", "--DEBT--", "break"));
            gFieldArray.push(new RetirementField("addDebt", "debt", "ADD FIELD", "add-field"));
            gFieldArray.push(new RetirementField("---------", "", "", "break"));
        }

    }
    else {

        //Add our feilds - Setup the time horizon
        gFieldArray.push(new RetirementField("timeBreak", "", "---TIME HORIZON---", "break"));
        gFieldArray.push(new RetirementField("yearBorn", "1969", "Born Year", "year"));
        gFieldArray.push(new RetirementField("yearMortgageStart", "2025", "Mortgage Start", "year"));
        gFieldArray.push(new RetirementField("yearMortgageEnd", "2040", "Mortgage End", "year"));
        gFieldArray.push(new RetirementField("yearRetire", "2025", "Retire Year", "year"));
        gFieldArray.push(new RetirementField("yearIRA", "2031", "IRA Withdraw Year", "year"));
        gFieldArray.push(new RetirementField("yearSocSec", "2034", "Social Security Year", "year"));
        gFieldArray.push(new RetirementField("yearMedicare", "2034", "Medicare Year", "year"));
        gFieldArray.push(new RetirementField("yearDie", "2059", "Die Year", "year"));
        gFieldArray.push(new RetirementField("addTime", "year", "ADD FIELD", "add-field"));

        //Interest rates
        gFieldArray.push(new RetirementField("rateBreak", "", "--- INTEREST/RETURN RATES ---", "break"));
        gFieldArray.push(new RetirementField("rateInflation", "0", "Inflation Rate %", "rate")); 
        gFieldArray.push(new RetirementField("rateCheckingAccountReturn", "0", "Checking Rate %", "rate")); 
        gFieldArray.push(new RetirementField("rateSavingsAccountReturn", "0", "Savings Rate %", "rate")); 
        gFieldArray.push(new RetirementField("rateMoneyMarketAccountReturn", "0", "Money Mkt Rate %", "rate")); 
        gFieldArray.push(new RetirementField("rateInvestmentAccountReturn", "0", "Investment Rate %", "rate")); 
        gFieldArray.push(new RetirementField("rateHomeAppreciation", "0", "Home Apprec %", "rate")); 
        gFieldArray.push(new RetirementField("rateMortgage", "7", "Mortage Rate %", "rate")); 
        gFieldArray.push(new RetirementField("addRate", "rate", "ADD FIELD", "add-field"));

        //Our expenses
        gFieldArray.push(new RetirementField("expenseBreak", "", "---EXPENSES---", "break"));
        gFieldArray.push(new RetirementField("expenseLiving", "100000", "Living Expense/Yr", "money", "expense", "yearly", "rateInflation", "", "", true, "", "cash"));
        gFieldArray.push(new RetirementField("expenseMedicalPreMedicare", "0", "Pre-Medicare/Mth", "money", "expense", "monthly", "rateInflation", "yearRetire", "yearMedicare", true, "", "cash"));
        gFieldArray.push(new RetirementField("expenseMortagePayment", "0", "Mortgage/Mth", "money", "expense", "monthly", "rateMortgage", "", "", true, "", "cash"));
        gFieldArray.push(new RetirementField("addExpense", "money", "ADD FIELD", "add-field"));

        /* If wanted to do real expense break down, do this
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
        gFieldArray.push(new RetirementField("incomeBreak", "", "---INCOME---", "break"));
        gFieldArray.push(new RetirementField("incomeSalary", "100000", "Salary/Yr", "money", "income", "yearly", "rateInflation", "yearBorn", "yearRetire", false, "cash", ""));
        gFieldArray.push(new RetirementField("incomeSocialSecurity", "0", "Social Security/Mth", "money", "income", "monthly", "rateInflation", "yearSocSec", "yearDie", false, "cash", ""));
        gFieldArray.push(new RetirementField("incomePension", "0", "Pension/Mth", "money", "income", "monthly", "rateInflation", "yearRetire", "yearDie", true, "cash", ""));
        gFieldArray.push(new RetirementField("incomeRental", "0", "Rental Income/Mth", "money", "income", "monthly", "rateInflation", "", "yearDie", true, "cash", ""));
        gFieldArray.push(new RetirementField("addIncome", "money", "ADD FIELD", "add-field"));

        //Property Assets
        gFieldArray.push(new RetirementField("propertyBreak", "", "--PROPERTY ASSETS--", "break"));
        var propertyHouse = new RetirementField("propertyHouse", "300000", "House", "asset", "", "", "rateHomeAppreciation", "yearMortgageStart", "yearDie");
        propertyHouse.assetLoan = "debtMortgage";
        gFieldArray.push(propertyHouse);
        gFieldArray.push(new RetirementField("addAsset", "asset", "ADD FIELD", "add-field"));

        //Debt
        gFieldArray.push(new RetirementField("debtBreak", "", "--DEBT--", "break"));
        //Debit is principle, start year, end year, rate --> Calculate payment amount
        gFieldArray.push(new RetirementField("debtMortgage", "200000", "Mortgage", "debt", "", "", "rateMortgage", "yearMortgageStart", "yearMortgageEnd", false));
        gFieldArray.push(new RetirementField("addDebt", "debt", "ADD FIELD", "add-field"));

        //Cash/savings
        gFieldArray.push(new RetirementField("cashBreak", "", "---CASH/SAVINGS---", "break"));
        gFieldArray.push(new RetirementField("moneyChecking", "0", "Checking", "money", "investment-savings", "yearly", "rateCheckingAccountReturn", "", "", true, "", "", true));
        gFieldArray.push(new RetirementField("moneySavings", "0", "Savings", "money", "investment-savings", "yearly", "rateSavingsAccountReturn"));
        gFieldArray.push(new RetirementField("moneyMoneyMarket", "0", "Money Market", "money", "investment-savings", "yearly", "rateMoneyMarketAccountReturn"));
        gFieldArray.push(new RetirementField("addCash", "money", "ADD FIELD", "add-field"));

        //Regular investments
        gFieldArray.push(new RetirementField("investBreak", "", "-NON RETIREMENT INVESTMENTS-", "break"));
        gFieldArray.push(new RetirementField("investmentBrokerage", "1000000", "Brokerage", "money", "investment-savings", "yearly", "rateInvestmentAccountReturn"));
        gFieldArray.push(new RetirementField("addInvestment", "money", "ADD FIELD", "add-field"));

        //Retirment accounts
        gFieldArray.push(new RetirementField("retInvestBreak", "", "--RETIREMENT ACCOUNTS--", "break"));
        gFieldArray.push(new RetirementField("retirementRothIRA", "0", "Roth IRA", "money", "investment-savings", "yearly", "rateInvestmentAccountReturn", "yearIRA", "yearDie"));
        gFieldArray.push(new RetirementField("retirementRolloverIRA", "0", "Rollover IRA", "money", "investment-savings", "yearly", "rateInvestmentAccountReturn", "yearIRA", "yearDie"));
        gFieldArray.push(new RetirementField("retirementTraditionalIRA", "0", "Traditional IRA", "money", "investment-savings", "yearly", "rateInvestmentAccountReturn", "yearIRA", "yearDie"));
        gFieldArray.push(new RetirementField("retirement401K", "0", "401K", "money", "investment-savings", "yearly", "rateInvestmentAccountReturn", "yearIRA", "yearDie"));
        gFieldArray.push(new RetirementField("addRetirement", "money", "ADD FIELD", "add-field"));

        //Education accounts
        gFieldArray.push(new RetirementField("educationBreak", "", "--EDUCATION ACCOUNTS--", "break"));
        gFieldArray.push(new RetirementField("educationCoverdell", "0", "Coverdell", "money", "investment-savings", "yearly", "rateInvestmentAccountReturn"));
        gFieldArray.push(new RetirementField("education529", "0", "529 Plan", "money", "investment-savings", "yearly", "rateInvestmentAccountReturn"));        
        gFieldArray.push(new RetirementField("addEducation", "money", "ADD FIELD", "add-field"));
        gFieldArray.push(new RetirementField("---------", "", "", "break"));

        //And since it is all fresh, pre-load scenario name
        document.getElementById("new-scenario").value = "Default Scenario Name";

        //Save initial data if we need to
        blnDoStartupHelp = true;
    }

    //Build our display
    var fieldSequenceNumber = 0;
    gFieldArray.forEach((fieldObject) => {
        fieldSequenceNumber = fieldSequenceNumber + 1;
        if (blnDoneWithSection) {
            blnDoneWithSection = false;
            if (subTotalAmount > 0) {
                outputRows = outputRows.replace(/_REPLEAMT_/, currency(subTotalAmount));
            }
            else {
                outputRows = outputRows.replace(/_REPLEAMT_/, "");
            }
            subTotalAmount = 0;
        }
        else {
            outputRows = outputRows.replace(/_AMOUNT_/, "_REPLEAMT_");
        }
        outputRows = outputRows + fieldObject.fieldDisplayRow(fieldSequenceNumber);
        //AJH SUBTOTAL THING GOES HERE
        //console.log("ROW IS: " + outputRows);
    });
    blnDoneWithSection = false;
    if (subTotalAmount > 0) {
        outputRows = outputRows.replace(/_REPLEAMT_/, currency(subTotalAmount));
    }
    else {
        outputRows = outputRows.replace(/_REPLEAMT_/, "");
    }
    outputRows = outputRows.replace(/_AMOUNT_/, "");
    outputRows = outputRows + "<tr>";
    outputRows = outputRows + "<td width='100%' colspan='2'><p align='center' valign='top'>_LIQUID_ Starting Amount</p></td>";
    outputRows = outputRows + "</tr>";
    outputRows = outputRows.replace(/_LIQUID_/, currency(startLiquidNetWorth));
    subTotalAmount = 0;
    startLiquidNetWorth = 0;
    
    outputTable = outputTable.replace(/_RETIREMENTFIELDS_/gi, outputRows);
    document.getElementById("input-fields").innerHTML = outputTable;

    if (blnDoStartupHelp) {
        //Save the defualt data
        doCalc(true);

        //And since it is all fresh, pre-load scenario name
        document.getElementById("new-scenario").value = "";

        //And show help
        showPageView("help");
    }
    else {
        showPageView("inputs");   
    }

    //Test out our mortgage calculator - THIS WOKS, for debt we'll show -rem bal as part of net worth
    //var paymentCount = (currentDate.getFullYear() - 2000) * 12;
    //var remBal = 0;
    //var testMortagePayment = calculateMortagePayment(100000, 6, 2000, 2030, paymentCount);
    //console.log("MORTGAGE PAYMENT: " + testMortagePayment.paymentAmount + " REM BAL: " + testMortagePayment.remainingBalance);

}

/****************
doCalc
****************/
function doCalc(inputSaveOnly) {

    var i = 0;
    var blnBogus = false;
    var startAmount = 0;
    var assetStartAmount = 0;
    var assetReturnAmount = 0;
    var debtStartAmount = 0;
    var debtReturnAmount = 0;
    var investmentReturnAmount = 0;
    var incomeAmount = 0;
    var expenseAmount = 0;
    var changeAmount = 0;
    var endAmount = 0;
    var expenseToWithdraw = 0;
    var incomeToDeposit = 0;
    var totalIncomeToDeposit = 0;
    var totalExpenseToWithdraw = 0;
    var blnHaveDefaultCashAccount = false;
    var bogusField = "";

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
            document.getElementById("new-scenario").focus();
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

        if (fieldObject.fieldType != "break" && fieldObject.fieldType != "add-field") {

            if (!isNumber(document.getElementById(fieldObject.fieldName).value)) {
                //bogus
                blnBogus = true;
                bogusField = fieldObject.fieldName;
            }
            else {
                fieldObject.fieldValue = trimNumber(document.getElementById(fieldObject.fieldName).value);
                fieldObject.setDataValue();
                //console.log("FIELD VALUE SET " + fieldObject.fieldName + " = " + fieldObject.fieldValue);
            }

            //Need a default account
            if (fieldObject.fieldType == "money" && fieldObject.defaultCashAccount) {
                blnHaveDefaultCashAccount = true;
            }
        }
    });

    if (blnBogus) {
        alert("Invalid data.  Must be money, rate, year --> Numeric")
        document.getElementById("infomessage").innerHTML = "Invalid Data. Try again.";
        document.getElementById(bogusField).focus();
        return;
    }
    
    //Validate we have defualt account to take money from or put money into  
    if (!blnHaveDefaultCashAccount) {
        alert("A default cash account is required for managing income/expenses.")
        document.getElementById("infomessage").innerHTML = "Default Cash Account is required. Set one up by editing or adding a field.";
        return;
    }
        
    //Store the fields
    localStorage.setItem('fieldArray', JSON.stringify(gFieldArray));

    //Reset everything
    onDOMContentLoaded();

    if (inputSaveOnly) {
        return;
    }

    //Data is good, lets rip thru it and apply our time algorithm..since updating, make a copy
    lFieldArray = gFieldArray;

    resultReport = "<table class='output-report' border='1px' width='100%' cellpadding='5' cellspacing='5'><tr><td align='center'>YEAR</td><td align='center'>START</td><td align='center'>RETURN</td><td align='center'>INCOME</td><td align='center'>EXPENSE</td><td align='center'>END</td></tr>"
    for (let i = currentDate.getFullYear(); i <= getValue(lFieldArray, "yearDie"); i++) {

        startAmount = 0;
        assetStartAmount = 0;
        assetReturnAmount = 0;
        debtStartAmount = 0;
        debtReturnAmount = 0;
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

            if (fieldObject.fieldType == "money") {
                switch(fieldObject.moneyType) {
                    case "investment-savings":
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
            }
            else {
                if (fieldObject.fieldType == "asset") {
                    startAmount = startAmount + fieldObject.yearStartAmount;
                    investmentReturnAmount = investmentReturnAmount + fieldObject.yearInvestmentReturnAmount;
                    endAmount = endAmount + fieldObject.yearEndAmount;
                    changeAmount = changeAmount + fieldObject.yearInvestmentReturnAmount;

                    //And our asset stuff
                    assetStartAmount = assetStartAmount + fieldObject.yearStartAmount;   
                    assetReturnAmount = assetReturnAmount + fieldObject.yearInvestmentReturnAmount;

                }
                else {
                    if (fieldObject.fieldType == "debt") { //AJH

                        if (isNaN(fieldObject.yearStartAmount)) {
                            fieldObject.yearStartAmount = 0;
                        }

                        if (isNaN(fieldObject.yearInvestmentReturnAmount)) {
                            fieldObject.yearInvestmentReturnAmount = 0;
                        }

                        if (isNaN(fieldObject.yearIncome)) {
                            fieldObject.yearIncome = 0;
                        }

                        if (isNaN(fieldObject.yearExpense)) {
                            fieldObject.yearExpense = 0;
                        }
                        
                        if (isNaN(fieldObject.yearEndAmount)) {
                            fieldObject.yearEndAmount = 0;
                        }

                        startAmount = startAmount + fieldObject.yearStartAmount; 
                        investmentReturnAmount = investmentReturnAmount + fieldObject.yearInvestmentReturnAmount;
                        endAmount = endAmount + fieldObject.yearEndAmount; 
                        changeAmount = changeAmount + fieldObject.yearInvestmentReturnAmount;
                        //Change to -

                    }

                    //console.log("YEAR: " + i + " START: " + startAmount + " INVEST: " + investmentReturnAmount + " CHG:" + changeAmount);
                }
            }



        });     
        
        //Deposit income into account
        lFieldArray.forEach((fieldObject) => {

            if (fieldObject.yearIncome > 0 && fieldObject.fieldType != "asset" && fieldObject.fieldType != "debt") {
                
                //Track income total --> sum up all earnings
                incomeToDeposit = incomeToDeposit + fieldObject.yearIncome;

                //Deposit income into designated account
                lFieldArray.forEach((fieldObject2) => {
                    if (fieldObject2.fieldName == fieldObject.depositAccount && fieldObject2.fieldType == "money" && fieldObject2.moneyType == "investment-savings") {
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
            if (incomeToDeposit > 0) {
                alert("Looks like we are missing default account to drop money into.")
            }
        }

        //Withdraw expenses from account
        lFieldArray.forEach((fieldObject) => {
            
            if (fieldObject.yearExpense > 0 && fieldObject.fieldType != "asset" && fieldObject.fieldType != "debt") {

                //Track expense total --> sum up all expenses
                expenseToWithdraw = expenseToWithdraw + fieldObject.yearExpense;

                //if (fieldObject.fieldType == "asset") {
                //    console.log("WE ARE HANDLING THIS EXPENSE: " + expenseToWithdraw + " FOR YEAR: " + i);
                //}                

                //Withdraw expense from designated account
                lFieldArray.forEach((fieldObject2) => {
                    if (fieldObject2.fieldName == fieldObject.withdrawAccount && fieldObject2.fieldType == "money" && fieldObject2.moneyType == "investment-savings") {
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
                    if (fieldObject.fieldType == "money" && fieldObject.moneyType == "investment-savings") {

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
                    if (fieldObject.fieldType == "money" && fieldObject.moneyType == "investment-savings") {

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
            if (expenseToWithdraw > 0) {
                alert("Looks like we are missing default account to take money from.")
            }
        }

        //OK, these should be 0, but use em anyway
        totalIncomeToDeposit = totalIncomeToDeposit + incomeToDeposit;
        totalExpenseToWithdraw = totalExpenseToWithdraw + expenseToWithdraw;

        //Create clone of object and store it for reference
        var clonedArray = structuredClone(gFieldArray);
        gYearDetailsArray.push(clonedArray);

        //Calculate % of this withdraw
        var returnPercentage = calculatePercentage((investmentReturnAmount - assetReturnAmount - debtReturnAmount), (startAmount - assetStartAmount - debtStartAmount));
        var expensePercentage = calculatePercentage(expenseAmount, (startAmount - assetStartAmount - debtStartAmount));

        var clickCode = "onclick='javascript:showYearDetail(" + i + ")'";
        resultReport = resultReport + "<tr " + clickCode + "><td align='center' width='10%'>" + i + "</td><td width='20%' align='right'>" + currency(startAmount, "", true) + "&nbsp;</td><td width='20%' align='right'>" + currency(investmentReturnAmount, "", true) + "<font color='green'>&nbsp;(" + returnPercentage + "%)</font></td><td width='15%' align='right'>" + currency(incomeAmount, "", true) + "</td>";
        if (expenseAmount > 0) {
            resultReport = resultReport + "<td width='15%' align='right'>" + currency(-1 * expenseAmount, "", true) + "<font color='green'>&nbsp;(" + expensePercentage + "%)</font></td>";
        } 
        else {
            resultReport = resultReport + "<td width='15%' align='right'>" + currency(expenseAmount, "", true) + "</td>";
        }
        resultReport = resultReport + "<td width='20%' align='right'>" + currency(startAmount + changeAmount, "", true) + "</td></tr>";
    
        //AJH
        lFieldArray.forEach((fieldObject) => {
            if (fieldObject.fieldType == "asset") {
                //console.log("YEAR IS: " + i + " ASSET START: " + fieldObject.yearStartAmount + " INV: " + fieldObject.yearInvestmentReturnAmount + " INC: " + fieldObject.yearIncome + " EXP: " + fieldObject.yearExpense + " END: " + fieldObject.yearEndAmount )
            }
        });
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

    //Lets calculate what is left in todays sollar PV = FV/((1+(r/100))^yrs)
    //Need the rate from inflations rate

    var totalYears = getValue(lFieldArray, "yearDie") - currentDate.getFullYear();
    var inflationRate = 1 + (getValue(lFieldArray, "rateInflation") / 100);
    var presentDayValueOfEndAmount = endAmount / ( (inflationRate)**totalYears ); //Need rate and years from fields

    if (endAmount < 0 ) {
        errorMessages = errorMessages + "Not looking good for your heirs. You are " + currency(endAmount) + " (" + currency(presentDayValueOfEndAmount) + ") in the hole";
    }
    else {
        if (endAmount <= 1000 ) {
            errorMessages = errorMessages + "Not great. You have haven't left hardly anything:  " + currency(endAmount) + " (" + currency(presentDayValueOfEndAmount) + ") - Yuck.";
        }
        else {
            if (endAmount <= 100000 ) {
                errorMessages = errorMessages + "Very good. You've timed it right and can maybe take care of the service with " + currency(endAmount) + " (" + currency(presentDayValueOfEndAmount) + ") left";
            }
            else {
                if (endAmount <= 1000000 ) {
                    errorMessages = errorMessages + "Nice little nest egg for your loved ones of " + currency(endAmount) + " (" + currency(presentDayValueOfEndAmount) + ") will be appreciated";
                }
                else {
                    if (endAmount <= 10000000 ) {
                        errorMessages = errorMessages + "Yer risking generational wealth and spoiling your heirs with this " + currency(endAmount) + " (" + currency(presentDayValueOfEndAmount) + ") windfall";
                    }
                    else {
                        if (endAmount <= 50000000 ) {
                            errorMessages = errorMessages + "You should really spend this money and not save it all. Seriously, " + currency(endAmount) + " (" + currency(presentDayValueOfEndAmount) + ") is too much to leave behind";
                        }
                        else {
                            if (endAmount <= 50000000 ) {
                                errorMessages = errorMessages + "Ridiculous really.  Give your money away before you die. Or you will ruin your heirs. A needy family could use some of the " + currency(endAmount) + " (" + currency(presentDayValueOfEndAmount) + ") you've been hording";
                            }
                            else {
                                errorMessages = errorMessages + "This is stupid. Yer Ebenezer Scrooge. Spend your money! Buy an island or a private jet with the " + currency(endAmount) + " (" + currency(presentDayValueOfEndAmount) + ") before you die!";
                            }
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
calculatePercentage
****************/
function calculatePercentage(inputNumerator, inputDenominator) {

    var myResult = 0;
    var myNumerator = inputNumerator;
    var myDenominator = inputDenominator;

    if (!isNaN(myNumerator) && myNumerator != 0 && !isNaN(myDenominator) && myDenominator != 0) {
        myNumerator = myNumerator * 100;
        myResult = roundNumber(myNumerator / myDenominator, 1);
        myResult = myResult.toFixed(1);
    }

    return myResult;
}

/****************
roundNumber
****************/
function roundNumber(value, precision) {
    var multiplier = Math.pow(10, precision || 0);
    return Math.round(value * multiplier) / multiplier;
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

    document.getElementById("note-detail").focus();

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
deleteScenario
****************/
function deleteScenario() {

    var tempArray = [];

    myAnswer = confirm('Are you sure you want to delete this ' + gScenario.scenarioName + ' scenario?');

    if (!myAnswer) {
        return;
    }

    //Delete the scenario
    gScenarioArray.forEach((scenarioEntry) => { 
        if (scenarioEntry.scenarioName == gScenario.scenarioName) {
            //Delete this one..by not copying it
        }        
        else {
            tempArray.push(scenarioEntry);
        }
    });

    gScenarioArray = tempArray;
    localStorage.setItem('scenarioArray', JSON.stringify(gScenarioArray));

    gScenario = {scenarioName: "", scenarioNote: ""};
    gScenarioArray.forEach((scenarioEntry) => { 
        if (gScenario.scenarioName == "") {
            gScenario = scenarioEntry;
        }
    });
    
    //Store the choice
    localStorage.setItem("scenarioSelected", gScenario.scenarioName);

    //And start again
    onDOMContentLoaded();

}

/****************
updateField
****************/
function updateField() {

    var fieldName = "";
    var blnUpdateError = false;

    //Updte field settings
    fieldName = document.getElementById("fieldName").value;
    gFieldArray.forEach((fieldObject) => { 
        //console.log("DOING FIELD: " + fieldName);
        if (fieldObject.fieldName == fieldName) {
            //Nowe we update it
            fieldObject.fieldDescription = document.getElementById("fieldDescription").value;
            fieldObject.fieldType = document.getElementById("fieldType").value;
            if (fieldObject.fieldType == "money") {
                fieldObject.moneyType = document.getElementById("moneyType").value;
                fieldObject.timePeriod = document.getElementById("timePeriod").value;
                fieldObject.rateField = document.getElementById("rateField").value;
                fieldObject.startYear = document.getElementById("startYear").value;
                fieldObject.endYear = document.getElementById("endYear").value;
                fieldObject.depositAccount = document.getElementById("depositAccount").value;
                fieldObject.withdrawAccount = document.getElementById("withdrawAccount").value;
                if (document.getElementById("accrueBeforeStart").value == "true") {
                    fieldObject.accrueBeforeStart = true;
                }
                else {
                    fieldObject.accrueBeforeStart = false;
                }
                if (document.getElementById("defaultCashAccount").value == "true") {
                    fieldObject.defaultCashAccount = true;
                }
                else {
                    fieldObject.defaultCashAccount = false;
                }
            }
            else {
                if (fieldObject.fieldType == "asset") {

                    //console.log("HERE WE GO START 1: " + document.getElementById("startYear").value + " END: " + document.getElementById("endYear").value);
                    //console.log("HERE WE GO START 2: " + document.getElementById("rateField").value + " END: " + document.getElementById("assetLoan").value);

                    fieldObject.moneyType = "";
                    fieldObject.timePeriod = "";
                    fieldObject.rateField = document.getElementById("rateField").value;
                    fieldObject.startYear = document.getElementById("startYear").value;
                    fieldObject.endYear = document.getElementById("endYear").value;
                    if (document.getElementById("accrueBeforeStart").value == "true") {
                        fieldObject.accrueBeforeStart = true;
                    }
                    else {
                        fieldObject.accrueBeforeStart = false;
                    }
                    fieldObject.assetLoan = document.getElementById("assetLoan").value;
                    fieldObject.depositAccount = "";
                    fieldObject.withdrawAccount = "";
                    fieldObject.defaultCashAccount = false;
                }
                else {
                    //Do Debt
                    if (fieldObject.fieldType == "debt")  {

                        fieldObject.moneyType = "";
                        fieldObject.timePeriod = "";
                        fieldObject.rateField = document.getElementById("rateField").value;
                        fieldObject.startYear = document.getElementById("startYear").value;
                        fieldObject.endYear = document.getElementById("endYear").value;
                        if (document.getElementById("accrueBeforeStart").value == "true") {
                            fieldObject.accrueBeforeStart = true;
                        }
                        else {
                            fieldObject.accrueBeforeStart = false;
                        }
                        fieldObject.depositAccount = "";
                        fieldObject.withdrawAccount = "";
                        fieldObject.defaultCashAccount = false;

                    }
                    else {

                        fieldObject.moneyType = "";
                        fieldObject.timePeriod = "";
                        fieldObject.rateField = "";
                        fieldObject.startYear = "";
                        fieldObject.endYear = "";
                        fieldObject.depositAccount = "";
                        fieldObject.withdrawAccount = "";
                        fieldObject.accrueBeforeStart = true;
                        fieldObject.defaultCashAccount = false;
                        
                    }
                }
            }

            if ((fieldObject.startYear && !fieldObject.endYear) || (!fieldObject.startYear && fieldObject.endYear)) {
                alert("Sorry, if speicifying a time range please include both start and ending years.");
                blnUpdateError = true;
                return;
            }
        
        }
    });
   
    if (!blnUpdateError) {
        localStorage.setItem('fieldArray', JSON.stringify(gFieldArray));

        //And start again
        onDOMContentLoaded();
    }

   
}


/****************
deleteField
****************/
function deleteField() {

    var myAnswer = false;
    var fieldName;
    var tempArray = [];
    var myReferenceField = "";
    
    //Probably should have validation so dont delete refrenced field (ie: pension inflation)
    
    //FietimePeriod, rateField, startYear, endYear, accrueBeforeStart, depositAccount, withdrawAccount, defaultCashAccount)

    fieldName = document.getElementById("fieldName").value;
    gFieldArray.forEach((fieldObject) => { 
        //See if any references to this name
        if (fieldObject.rateField == fieldName) {
            myReferenceField = fieldObject.fieldName;
        }
        if (fieldObject.startYear == fieldName) {
            myReferenceField = fieldObject.fieldName;
        }
        if (fieldObject.endYear == fieldName) {
            myReferenceField = fieldObject.fieldName;
        }
        if (fieldObject.depositAccount == fieldName) {
            myReferenceField = fieldObject.fieldName;
        }
        if (fieldObject.withdrawAccount == fieldName) {
            myReferenceField = fieldObject.fieldName;
        }
    });
    
    if (myReferenceField != "") {
        alert("Sorry, can't delete this field. It is referenced by " + myReferenceField);
        myAnswer = false;
    }
    else {
        gFieldArray.forEach((fieldObject) => { 
            if (fieldObject.fieldName == fieldName) {
                //Make sure is deletable;
                //if (fieldObject.fieldType == "year") {
                //    //Not deletable
                //    alert("Sorry, you can't delete year fields. They are required.");
                //    myAnswer = false;
                // }
                //else {
                    if (fieldObject.defaultCashAccount) {
                        alert("Sorry, you can't delete default cash account. It is required.");
                        myAnswer = false;
                    }
                    else {
                        myAnswer = confirm('Are you sure you want to delete this field?');
                    }
                //}
            }
        });
    }

    if (myAnswer) {
        //Delete the field
        fieldName = document.getElementById("fieldName").value;
        gFieldArray.forEach((fieldObject) => { 
            if (fieldObject.fieldName == fieldName) {
                //Delete this one..by not copying it
            }
            else {
                //Keep these, by copying them
                tempArray.push(fieldObject);
            }
        });
        localStorage.setItem('fieldArray', JSON.stringify(tempArray));

    }

    //And start again
    onDOMContentLoaded();
}

/****************
addField
****************/
function addField(inputFieldtype, inputSequenceNumber) {

    var addType = "";
    var addPrefix = "";
    var addSuffix = "";
    var newFieldObject;
    var blnExists = false;

    switch(inputFieldtype) {
        case "addTime":
            addType = "time in years";
            addPrefix = "year";
            addSuffix = "Field";
             break;
        case "addRate":
            addType = "interest rate / yr";
            addPrefix = "rate";
            addSuffix = "Field";
            break;
        case "addExpense":
            addType = "expense";
            addPrefix = "expense";
            addSuffix = "Field";
            break;
        case "addIncome":
            addType = "income";
            addPrefix = "income";
            addSuffix = "Field";
            break;
        case "addCash":
            addType = "cash";
            addPrefix = "money";
            addSuffix = "Field";
            break;
        case "addInvestment":
            addType = "investment savings";
            addPrefix = "investementSavings";
            addSuffix = "Field";
            break;
        case "addRetirement":
            addType = "retirement acount";
            addPrefix = "retirement";
            addSuffix = "Field";
            break;
        case "addEducation":
            addType = "education account";
            addPrefix = "education";
            addSuffix = "Field";
            break;
        case "addAsset":
            addType = "property asset";
            addPrefix = "asset";
            addSuffix = "Field";
            break;
        case "addDebt":
            addType = "debt";
            addPrefix = "debt";
            addSuffix = "Field";
            break;
        default:          
    }
    var newFieldName = prompt("Please enter name of this " + addType + " field", addPrefix + addSuffix);
    if (newFieldName) {
        if (newFieldName.length > 0) {
       
            switch(inputFieldtype) {
                case "addTime":
                    newFieldObject = new RetirementField(newFieldName, "", "", "year");
                    break;
                case "addRate":
                    newFieldObject = new RetirementField(newFieldName, "0", "", "rate");
                    break;
                case "addExpense":
                    newFieldObject = new RetirementField(newFieldName, "0", "", "money", "expense", "monthly", "", "", "", true, "", "");
                    break;
                case "addIncome":
                    newFieldObject = new RetirementField(newFieldName, "0", "", "money", "income", "monthly", "", "", "", true, "", "");
                    break;
                case "addCash":
                    newFieldObject = new RetirementField(newFieldName, "0", "", "money", "investment-savings", "yearly", "");
                    break;
                case "addInvestment":
                    newFieldObject = new RetirementField(newFieldName, "0", "", "money", "investment-savings", "yearly", "");
                    break;
                case "addRetirement":
                    newFieldObject = new RetirementField(newFieldName, "0", "", "money", "investment-savings", "yearly", "", "", "");
                    break;
                case "addEducation":
                    newFieldObject = new RetirementField(newFieldName, "0", "", "money", "investment-savings", "yearly", "");
                    break;
                case "addAsset":
                    newFieldObject = new RetirementField(newFieldName, "0", "", "asset", "", "yearly", "");
                    break;
                case "addDebt":
                    newFieldObject = new RetirementField(newFieldName, "0", "", "debt", "", "yearly", "");
                    break;
                default:          
            }
    
            //See if we have it, else add it
            gFieldArray.forEach((fieldObject) => {
                if (fieldObject.fieldName == newFieldObject.fieldName) {
                    //Field already exists
                     blnExists = true;
                }
            });
    
            //New field to add
            if (!blnExists) {
      
                //Put it in the right sequencey
                gFieldArray.splice(inputSequenceNumber, 0, newFieldObject);
    
                //And store it
                localStorage.setItem('fieldArray', JSON.stringify(gFieldArray));
                
            }
    
            showFieldDetails(newFieldObject.fieldName);
        }
    }

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

    if (!displayField) {
        displayField = new RetirementField();
    }

    //Fields are -fieldName, fieldValue, fieldDescription, fieldType, moneyType, timePeriod, rateField, startYear, endYear, accrueBeforeStart, depositAccount, withdrawAccount, defaultCashAccount)

    if (displayField) {
        var fieldDetailOutput = "<input type='hidden' id='fieldName' value='" + displayField.fieldName + "'></p>";
        //If need to keep the field, dont allow delete
        fieldDetailOutput = fieldDetailOutput + "<p align='center'>Details for Field: " + displayField.fieldDescription + "</p>";
        fieldDetailOutput = fieldDetailOutput + "<table class='output-report' border='1px' width='100%' cellpadding='10' cellspacing='10'>";
        fieldDetailOutput = fieldDetailOutput + "<tr><td>Name:</td><td>" + displayField.fieldName + "</td></tr>";
        fieldDetailOutput = fieldDetailOutput + "<tr><td>Description:</td><td><input type='text' id='fieldDescription' value='" + displayField.fieldDescription + "'></td></tr>";
        fieldDetailOutput = fieldDetailOutput + "<tr><td>Field Type:</td><td>" + showDropDown("fieldType", "money|year|rate|asset|debt", displayField.fieldType) + "</td></tr>";
        fieldDetailOutput = fieldDetailOutput + "<tr><td>Value:</td><td>" + displayField.fieldValue + "</td></tr>";
        fieldDetailOutput = fieldDetailOutput + "</table>";
        fieldDetailOutput = fieldDetailOutput + "<div id='" + displayField.fieldName + "-moneyfields'>";
        if (displayField.fieldType == "money") {
            fieldDetailOutput = fieldDetailOutput + "<table class='output-report' border='1px' width='100%' cellpadding='10' cellspacing='10'>";
            fieldDetailOutput = fieldDetailOutput + "<tr><td>Money Type:</td><td>" + showDropDown("moneyType", "expense|income|investment-savings", displayField.moneyType) + "</td></tr>";
            fieldDetailOutput = fieldDetailOutput + "<tr><td>Time Period:</td><td>" + showDropDown("timePeriod", "monthly|yearly", displayField.timePeriod) + "</td></tr>";
            fieldDetailOutput = fieldDetailOutput + "<tr><td>Rate Field:</td><td>" + showDropDown("rateField", "rateFields", displayField.rateField) + "</td></tr>";
            fieldDetailOutput = fieldDetailOutput + "<tr><td>Start Year:</td><td>" + showDropDown("startYear", "yearFields", displayField.startYear) + "</td></tr>";
            fieldDetailOutput = fieldDetailOutput + "<tr><td>End Year:</td><td>" + showDropDown("endYear", "yearFields", displayField.endYear) + "</td></tr>";
            fieldDetailOutput = fieldDetailOutput + "<tr><td>Accrue B4 Start:</td><td>" + showDropDown("accrueBeforeStart", "true|false", displayField.accrueBeforeStart) + "</td></tr>";
            fieldDetailOutput = fieldDetailOutput + "<tr><td>Deposit Acct:</td><td>" + showDropDown("depositAccount", "moneyFields", displayField.depositAccount) + "</td></tr>";
            fieldDetailOutput = fieldDetailOutput + "<tr><td>Withdraw Acct:</td><td>" + showDropDown("withdrawAccount", "moneyFields", displayField.withdrawAccount) + "</td></tr>";
            fieldDetailOutput = fieldDetailOutput + "<tr><td>Default Cash Account:</td><td>" + showDropDown("defaultCashAccount", "true|false", displayField.defaultCashAccount) + "</td></tr>";
            fieldDetailOutput = fieldDetailOutput + "</table>"; 
        }
        fieldDetailOutput = fieldDetailOutput + "</div>";
        fieldDetailOutput = fieldDetailOutput + "<div id='" + displayField.fieldName + "-assetfields'>";
        if (displayField.fieldType == "asset") {
            fieldDetailOutput = fieldDetailOutput + "<table class='output-report' border='1px' width='100%' cellpadding='10' cellspacing='10'>";
            fieldDetailOutput = fieldDetailOutput + "<tr><td>Rate Field:</td><td>" + showDropDown("rateField", "rateFields", displayField.rateField) + "</td></tr>";
            fieldDetailOutput = fieldDetailOutput + "<tr><td>Start Year:</td><td>" + showDropDown("startYear", "yearFields", displayField.startYear) + "</td></tr>";
            fieldDetailOutput = fieldDetailOutput + "<tr><td>End Year:</td><td>" + showDropDown("endYear", "yearFields", displayField.endYear) + "</td></tr>";
            fieldDetailOutput = fieldDetailOutput + "<tr><td>Accrue B4 Start:</td><td>" + showDropDown("accrueBeforeStart", "true|false", displayField.accrueBeforeStart) + "</td></tr>";
            fieldDetailOutput = fieldDetailOutput + "<tr><td>Loan:</td><td>" + showDropDown("assetLoan", "debtFields", displayField.assetLoan) + "</td></tr>";
            fieldDetailOutput = fieldDetailOutput + "</table>"; 
        }
        fieldDetailOutput = fieldDetailOutput + "</div>";
        fieldDetailOutput = fieldDetailOutput + "<div id='" + displayField.fieldName + "-debtfields'>";
        if (displayField.fieldType == "debt") {
            fieldDetailOutput = fieldDetailOutput + "<table class='output-report' border='1px' width='100%' cellpadding='10' cellspacing='10'>";
            fieldDetailOutput = fieldDetailOutput + "<tr><td>Rate Field:</td><td>" + showDropDown("rateField", "rateFields", displayField.rateField) + "</td></tr>";
            fieldDetailOutput = fieldDetailOutput + "<tr><td>Start Year:</td><td>" + showDropDown("startYear", "yearFields", displayField.startYear) + "</td></tr>";
            fieldDetailOutput = fieldDetailOutput + "<tr><td>End Year:</td><td>" + showDropDown("endYear", "yearFields", displayField.endYear) + "</td></tr>";
            fieldDetailOutput = fieldDetailOutput + "<tr><td>Accrue B4 Start:</td><td>" + showDropDown("accrueBeforeStart", "true|false", displayField.accrueBeforeStart) + "</td></tr>";
            fieldDetailOutput = fieldDetailOutput + "</table>"; 
        }
        fieldDetailOutput = fieldDetailOutput + "</div>";    

        document.getElementById("fieldDetailsDetail").innerHTML = "<center>" + fieldDetailOutput + "</center>";
        showPageView("fieldDetails");

        toggleFieldDetailDisplay(displayField.fieldType);
    }
    else {
        // it is a new field

    }

}

/****************
toggleFieldDetailDisplay
****************/
function toggleFieldDetailDisplay(inputValue) {

    var myMoneyDiv = document.getElementById("fieldName").value + "-moneyfields";
    var myAssetDiv = document.getElementById("fieldName").value + "-assetfields";
    var myDebtDiv = document.getElementById("fieldName").value + "-debtfields";

    if (inputValue == "money") {
        document.getElementById(myMoneyDiv).style.display = "block";
        document.getElementById(myAssetDiv).style.display = "none";
        document.getElementById(myDebtDiv).style.display = "none";
    }
    else {
        if (inputValue == "asset") {
            document.getElementById(myMoneyDiv).style.display = "none";
            document.getElementById(myAssetDiv).style.display = "block";
            document.getElementById(myDebtDiv).style.display = "none";
        }
        else {
            if (inputValue == "debt") {
                document.getElementById(myMoneyDiv).style.display = "none";
                document.getElementById(myAssetDiv).style.display = "none";  
                document.getElementById(myDebtDiv).style.display = "block";
            }     
        }
    }
    
}

/****************
showDropDown
****************/
function showDropDown(inputFieldName, inputFieldOptions, inputFieldValue) {

    var myResponse = "<select id='" + inputFieldName + "' _ONCHANGE_>_OPTIONS_</select>";
    var options = "<option value=''>(none)</option>";
    var optionArray;

    if (inputFieldName == "fieldType") {
        myResponse = myResponse.replace("_ONCHANGE_", "onChange='toggleFieldDetailDisplay(this.value);'");      
    }
    else {
        myResponse = myResponse.replace("_ONCHANGE_", "");
    }

    if (inputFieldOptions == "rateFields" || inputFieldOptions == "yearFields" || inputFieldOptions == "moneyFields" || inputFieldOptions == "assetFields" || inputFieldOptions == "debtFields") {
        gFieldArray.forEach((fieldObject) => {
            if (fieldObject.fieldType == "rate" && inputFieldOptions == "rateFields") {
                if (fieldObject.fieldName == inputFieldValue) {
                    options = options + "<option value='" + fieldObject.fieldName + "' selected>" + fieldObject.fieldName + "</option>";
                }
                else {
                    options = options + "<option value='" + fieldObject.fieldName + "'>" + fieldObject.fieldName + "</option>";
                }
            }
            if (fieldObject.fieldType == "year" && inputFieldOptions == "yearFields") {
                if (fieldObject.fieldName == inputFieldValue) {
                    options = options + "<option value='" + fieldObject.fieldName + "' selected>" + fieldObject.fieldName + "</option>";
                }
                else {
                    options = options + "<option value='" + fieldObject.fieldName + "'>" + fieldObject.fieldName + "</option>";
                }
            }
            if (fieldObject.fieldType == "money" && inputFieldOptions == "moneyFields") {
                if (fieldObject.fieldName == inputFieldValue) {
                    options = options + "<option value='" + fieldObject.fieldName + "' selected>" + fieldObject.fieldName + "</option>";
                }
                else {
                    options = options + "<option value='" + fieldObject.fieldName + "'>" + fieldObject.fieldName + "</option>";
                }
            }
            if (fieldObject.fieldType == "asset" && inputFieldOptions == "assetFields") {
                if (fieldObject.fieldName == inputFieldValue) {
                    options = options + "<option value='" + fieldObject.fieldName + "' selected>" + fieldObject.fieldName + "</option>";
                }
                else {
                    options = options + "<option value='" + fieldObject.fieldName + "'>" + fieldObject.fieldName + "</option>";
                }
            }
            if (fieldObject.fieldType == "debt" && inputFieldOptions == "debtFields") {
                if (fieldObject.fieldName == inputFieldValue) {
                    options = options + "<option value='" + fieldObject.fieldName + "' selected>" + fieldObject.fieldName + "</option>";
                }
                else {
                    options = options + "<option value='" + fieldObject.fieldName + "'>" + fieldObject.fieldName + "</option>";
                }
            }
        });
    } 
    else {
        optionArray = inputFieldOptions.split("|");
        optionArray.forEach((fieldOption) => {
            if (fieldOption == inputFieldValue || (fieldOption == "true" && inputFieldValue) || (fieldOption == "false" && !inputFieldValue) ) {
                options = options + "<option value='" + fieldOption + "' selected>" + fieldOption + "</option>";
            }
            else {
                options = options + "<option value='" + fieldOption + "'>" + fieldOption + "</option>";
            }
        });
    }

    myResponse = myResponse.replace("_OPTIONS_", options);    

    return myResponse;

}

/****************
clearDefaultScenario
****************/
function clearDefaultScenario() {

    if (document.getElementById('new-scenario').value == "Default Scenario Name" || document.getElementById('new-scenario').value == "New Scenario Name") {
        document.getElementById('new-scenario').value = "";
    }

}

/****************
doClose
****************/
function doClose(inputValue) {

    showPageView("inputs");

}

/****************
resetData
****************/
function resetData() {

    var myAnswer;
    
    myAnswer = confirm('Are you sure you want to reset everything, erasing data?');

    if (myAnswer) {
        //Clear all storage and reload
        localStorage.clear();
        location.reload();
    }

}

/****************
saveData
****************/
function saveData() {

    const link = document.createElement("a");
    const content = JSON.stringify(localStorage);
    const file = new Blob([content], { type: 'text/plain' });
    link.href = URL.createObjectURL(file);
    link.download = "RetirementPlannerData.txt";
    link.click();
    URL.revokeObjectURL(link.href);
    alert("Data saved and downloaded! Check your download files.")

}

/****************
ParseJSON
****************/
function ParseJSON(inputSet) {

    var newSet = {};

    for (let i = 0; i < inputSet.length; i++) {
        var key = inputSet.key(i);
        var json = inputSet.getItem(key);
        try {
            newSet[key] = JSON.parse(json);
        }
        catch (execption) {
            newSet[key] = json;
        }
    }

    return newSet;

}

/****************
loadData
****************/
function loadData() {

    const [file] = document.querySelector("input[type=file]").files;
    const reader = new FileReader();
  
    reader.addEventListener("load", () => {storeData(reader.result);}, false);
  
    if (file) {
      reader.readAsText(file);
    }
}

/****************
storeData
****************/
function storeData(inputDataStream) {

    var dataToStore;
    var valueToStore;

    try {
        dataToStore = JSON.parse(inputDataStream);
    } catch (e) {
        alert("Bad data, try again.");
        return;
    }

    if (dataToStore) {
        if (dataToStore.fieldArray) {
            //OK, it is legit...rip thru everything and store it
            for (const key in dataToStore){
                if(dataToStore.hasOwnProperty(key)){
                    localStorage.setItem(key, dataToStore[key]);
                }
            }
            alert("Data loaded!");
            showPageView('inputs');
        }
        else {
            alert("Bad data, try again.");
        }
    }
    else {
        alert("Bad data, try again.");
    }

    //All set, but we need to reload everything
    onDOMContentLoaded();

}


/****************
showPageView
****************/
function showPageView(inputView) {

    document.getElementById("output").style.display = "none";
    document.getElementById("output-help").style.display = "none";
    document.getElementById("yeardetail").style.display = "none";
    document.getElementById("yeardetail-help").style.display = "none";
    document.getElementById("scenarioNote").style.display = "none";
    document.getElementById("scenarioNote-help").style.display = "none";
    document.getElementById("fieldDetails").style.display = "none";
    document.getElementById("fieldDetails-help").style.display = "none";
    document.getElementById("loadData").style.display = "none";
    document.getElementById("loadData-help").style.display = "none";
    document.getElementById("help").style.display = "none";
    document.getElementById("calculatorHeader").style.display = "none";

    if (inputView != "output") {
        if (inputView == "inputs") {
            document.getElementById("calculatorHeader").style.display = "block";
        }
        document.getElementById("inputs").style.display = "none";
        document.getElementById("inputs-help").style.display = "none";
    }
    else {
        document.getElementById("inputs").style.display = "block";
        document.getElementById("inputs-help").style.display = "none";
        document.getElementById("calculatorHeader").style.display = "block";  

    }

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
    var displayClass = "";
    var displayReturn;
    var displayIncome;
    var displayExpense;

    if (inputYear != currentDate.getFullYear()) {
        priorYearButton = "<img src='prior-arrow.png' valign='middle' height='50' onclick='showYearDetail(" + (inputYear - 1) + ")'>";
    }

    if (inputYear != getValue(lFieldArray, "yearDie")) {
        nextYearButton = "<img src='next-arrow.png' valign='middle' height='50' onclick='showYearDetail(" + (inputYear + 1) + ")'>";
    }          

    var resultReport = "<p align='center' valign='bottom'>" + priorYearButton + "&nbsp&nbsp;&nbsp&nbsp;Results for " + inputYear + "&nbsp&nbsp;&nbsp&nbsp;" + nextYearButton + "</p>";
    resultReport = resultReport + "<table class='output-report' border='1px' width='100%' cellpadding='10' cellspacing='10'><tr><td align='center'>ACCT</td><td align='center'>STRT</td><td align='center'>RET</td><td align='center'>INC</td><td align='center'>EXP</td><td align='center'>END</td></tr>"
    
    gYearDetailsArray.forEach((arrayObjects) => {

        arrayObjects.forEach((fieldObject) => {

            if (fieldObject.yearProcessed == inputYear) {
                //if (fieldObject.fieldType == "money" || fieldObject.fieldType == "asset" || fieldObject.fieldType == "debt") {
                if (fieldObject.fieldType == "money" || fieldObject.fieldType == "asset" || fieldObject.fieldType == "debt") {
                
                    switch(fieldObject.fieldType) {
                        case "asset":      
                            displayClass = "nowrap-purple";
                            break;
                        case "debt":      
                            displayClass = "nowrap-black";
                            break;
                        case "money":
                            switch(fieldObject.moneyType) {
                                case "expense":      
                                    displayClass = "nowrap-red";
                                    break;
                                case "income":      
                                    displayClass = "nowrap-green";
                                    break;
                                case "investment-savings":      
                                    displayClass = "nowrap";
                                    break;
                                default:
                                    displayClass = "nowrap";
                                    break;
                            };
                            break;
                        default:
                            displayClass = "nowrap";
                            break;
                    }

                    //Debt yearStartAmount = last years rem bal, return is dif to thisyears, 
                    //Debt yearEndAmount = this years rem bal
                    totalStartAmount = totalStartAmount + fieldObject.yearStartAmount;
                    totalInvestmentReturnAmount = totalInvestmentReturnAmount + fieldObject.yearInvestmentReturnAmount;
                    totalIncome = totalIncome + fieldObject.yearIncome;
                    if (fieldObject.fieldType == "debt") {
                        totalExpense = totalExpense - fieldObject.yearExpense;
                    }
                    else {
                        totalExpense = totalExpense + fieldObject.yearExpense;
                    }
                    totalEndAmount = totalEndAmount + fieldObject.yearEndAmount;
                    //console.log("OBJ:", fieldObject);

                    if (fieldObject.fieldType == "debt") {
                        //console.log("FIELD: " + fieldObject.fieldDescription + " TOTALS START: " + totalStartAmount + " INVEST: " + totalInvestmentReturnAmount + " INCOME: " + totalIncome + " EXPENSE: " + totalExpense + " END: " + totalEndAmount);
                    }
 
                    if (fieldObject.fieldType == "asset" || fieldObject.fieldType == "debt") {
                        displayReturn = currency(fieldObject.yearInvestmentReturnAmount);
                        if (fieldObject.yearExpense != 0) {
                            displayExpense = currency(fieldObject.yearExpense, "expense");    
                        }
                        else {
                            displayExpense = "----";  
                        }
                        if (fieldObject.yearIncome != 0) {
                            displayIncome = currency(fieldObject.yearIncome);
                        }
                        else {
                            displayIncome = "----"; 
                        }                         
                    }
                    else {
                        switch(fieldObject.moneyType) {
                            case "expense":
                                displayExpense = currency(fieldObject.yearExpense, "expense");    
                                displayIncome = "----";    
                                displayReturn = "----";                      
                                break;
                            case "income":
                                displayIncome = currency(fieldObject.yearIncome);
                                displayExpense = "----";  
                                displayReturn = "----";         
                                break;
                            case "investment-savings":
                                displayReturn = currency(fieldObject.yearInvestmentReturnAmount);
                                displayExpense = "----";    
                                displayIncome = "----";     
                                if (fieldObject.yearStartAmount + fieldObject.yearInvestmentReturnAmount > fieldObject.yearEndAmount) {
                                    //We took money out
                                    displayExpense = "<font color='red'>(W/D)</font>";   
                                }
                                if (fieldObject.yearStartAmount + fieldObject.yearInvestmentReturnAmount < fieldObject.yearEndAmount) {
                                    //We put money in
                                    displayExpense = "(DEP)";
                                }
                                displayExpense = "(" + currency((fieldObject.yearStartAmount + fieldObject.yearInvestmentReturnAmount - fieldObject.yearEndAmount)) + ")";      
                                break;
                        }
                    }
                    resultReport = resultReport + "<tr class='" + displayClass + "'><td width='30%'>" + fieldObject.fieldDescription + "</div></td><td width='14%'>" + currency(fieldObject.yearStartAmount, fieldObject.fieldType) + "</td><td width='14%'>" + displayReturn + "</td><td width='14%'>" + displayIncome + "</td><td width='14%'>" + displayExpense + "</td><td width='14%'>" + currency(fieldObject.yearEndAmount, fieldObject.fieldType) + "</td></tr>";  
                }   
            }
        });        
    });
    
    //And a totals line
    resultReport = resultReport + "<tr><td width='30%'><div class='nowrap'>TOTAL:</div></td><td width='14%'>" + currency(totalStartAmount) + "</td><td width='14%'>" + currency(totalInvestmentReturnAmount) + "</td><td width='14%'>" + currency(totalIncome) + "</td><td width='14%'>" + currency(totalExpense) + "</td><td width='14%'>" + currency(totalEndAmount) + "</td></tr>";  
 
    resultReport = resultReport + "</table>";  
    document.getElementById("yeardetailReport").innerHTML = "<center>" + resultReport + "</center>";
    showPageView("yeardetail");
}

/****************
moveField
****************/
function moveField(inputSequenceNumber, inputMovement) {

    var myField = gFieldArray[inputSequenceNumber];
    var mySwapField = gFieldArray[inputSequenceNumber + inputMovement];

    //console.log("SWAP: " + mySwapField.fieldName + " FIELD: " + myField.fieldName + " ENTRY: " + inputSequenceNumber + " MOVEMENT: " + inputMovement);
 
    gFieldArray[inputSequenceNumber] = mySwapField;
    gFieldArray[inputSequenceNumber + inputMovement] = myField;

    //Store the fields
    localStorage.setItem('fieldArray', JSON.stringify(gFieldArray));

    //Reset everything
    onDOMContentLoaded();
 
}


/****************
getValue
****************/
function getValue(inputArray, inputFieldName) {

    var myValue = "";

    //Build our display
    inputArray.forEach((fieldObject) => {
        if (fieldObject.fieldName == inputFieldName) {
            //console.log("GETTING VALUE " + fieldObject.fieldName);
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
    var validChars = "0123456789$%,.-"

    if (inputNumber) {
        for (var i = 0; i < inputNumber.length; i++) {
            if (!validChars.includes(inputNumber.charAt(i))) {
                //console.log("INVALID " + inputNumber + " AT " + i + " = " + inputNumber.charAt(i));
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
    var validChars = "0123456789.-"

    if (inputNumber) {
        if (!isNaN(inputNumber)) {
            myResponse = inputNumber.toString();
        }
        else {
            if (isNumber(inputNumber)) {
                for (var i = 0; i < inputNumber.length; i++) {
                    if (validChars.includes(inputNumber.charAt(i))) {
                        myResponse = myResponse + inputNumber.charAt(i);
                    }
                }
            }
        }
    }
    
    return myResponse;

}

/****************
currency
****************/
function currency(inputNumber, inputType="", superRound=false) {
 
    var blnLastComma = false;
    var thousandthsNumber = "";
    var nonThousandthsNumber = "";

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

    var myResponse = formatter.format(inputNumber);
    var tempNumber = trimNumber(inputNumber);

    if (superRound) {

        if (tempNumber) {
            if (isNumber(tempNumber)) {

                if (Math.abs(tempNumber) > 9999) {
 
                    for (var i = 0; i < myResponse.length; i++) {
                        if (blnLastComma) {
                            thousandthsNumber = thousandthsNumber +  myResponse.charAt(i);
                        }
                        if (myResponse.charAt(i) == "," && i == myResponse.length - 4) { 
                            //We have our last ,
                              blnLastComma = true;
                              thousandthsNumber = "";
                        }
                        else {
                            if (!blnLastComma) {
                                nonThousandthsNumber = nonThousandthsNumber +  myResponse.charAt(i);
                            }
                        }
                    }
                    if (blnLastComma) {
                        //We have thousands seperator, so make number and translate back to currency
                        var tempNumber = trimNumber(nonThousandthsNumber);
                        
                        if (thousandthsNumber > 499) {
                            //Add 1 to thousands number
                            tempNumber = Number(tempNumber) + 1;
                        }
        
                        //Back to currencty and appaend the K
                        tempNumber = currency(tempNumber) + "K";
        
                        myResponse = tempNumber;
                   }
                }
            }
        }
    }
 
    if (inputType == "expense") { // || inputType == "debt"
        if (inputNumber > 0) {
            myResponse = "<font color='red'>-" + myResponse + "</font>";
        }
        else {
            if (inputNumber != 0) {
                return "<font color='black'>" + myResponse + "</font>";
            }
        } 
    }
    else {
        if (inputNumber < 0) {
            return "<font color='red'>" + myResponse + "</font>";
        }
    }

    return myResponse;

}


/****************
validateField
****************/
function validateField(inputFieldType, inputFieldName, inputFieldValue, inputSequenceNumber) {

    var today = new Date();
    var cleanedValue;
    var blnValid = false;
    var enteredField = gFieldArray[inputSequenceNumber];

    if (isNumber(inputFieldValue)) {
        cleanedValue  = trimNumber(inputFieldValue);
    }
    else {
        cleanedValue  = inputFieldValue;
    }

    switch(inputFieldType) {
        case "year":
            if (isNumber(inputFieldValue)) {
                if (Number(cleanedValue) > 1900 && Number(cleanedValue) < (today.getFullYear() + 100)) {
                    //Its valid
                    blnValid = true;
                }
                else {
                    alert("Sorry, " + inputFieldValue + " is not a valid year (1900 to " + (today.getFullYear() + 100) + ")");
                    document.getElementById(inputFieldName).focus();
                }
            }
            else {
                alert("Sorry, " + inputFieldValue + " is not a valid year (1900 to " + (today.getFullYear() + 100) + ")");
                document.getElementById(inputFieldName).focus();
            }
            break;
        case "rate":
            if (isNumber(inputFieldValue)) {
                if (Number(cleanedValue) >= 0 && Number(cleanedValue) <= 100) {
                    //Its valid
                    blnValid = true;
                }
                else {
                    alert("Sorry, " + inputFieldValue + " is not a valid rate (0 to 100)");
                    document.getElementById(inputFieldName).focus();
                }
            }
            else {
                alert("Sorry, " + inputFieldValue + " is not a valid rate (0 to 100)");
                document.getElementById(inputFieldName).focus();
            }
            break;
        case "money":
        case "asset":
        case "debt":
            if (isNumber(inputFieldValue)) {
                if (Number(cleanedValue) >= 0 && Number(cleanedValue) <= 999999999) {
                    //Its valid
                    blnValid = true;
                }
                else {
                    alert("Sorry, " + inputFieldValue + " is not a valid amount (0 to 1 billion)");
                    document.getElementById(inputFieldName).focus();
                }
            }
            else {
                alert("Sorry, " + inputFieldValue + " is not a valid amount (0 to 1 billion)");
                document.getElementById(inputFieldName).focus();
            }
            break;
        default:
          // else, do nothing
    }

    if (blnValid) {
        //Store the fields
        enteredField.fieldValue = inputFieldValue;
        enteredField.setDataValue();

    }

}

/****************
calculateMortagePayment
****************/
function calculateMortagePayment(inputPrinciple, inputInterestRate, inputStartYear, inputEndYear, paymentCount) {

    var monthlyInterestRate = (inputInterestRate / 100) / 12;
    var numberOfPayments = (inputEndYear - inputStartYear) * 12;
    var paymentAmount = inputPrinciple * (monthlyInterestRate * ((1 + monthlyInterestRate) ** numberOfPayments)) / (((1 + monthlyInterestRate) ** numberOfPayments) - 1);
    var monthlyRate = (inputInterestRate / 12) / 100;
    var tempValue1 = (1+monthlyRate) ** paymentCount;
    var calc1 = inputPrinciple*(tempValue1);
    var calc2 = paymentAmount*((tempValue1 - 1)/monthlyRate);
    
    remBal = calc1 - calc2;

    //console.log("PRINCIPLE:" + inputPrinciple + " RATE:" + monthlyInterestRate + " START:" + inputStartYear + " END:" + inputEndYear + " NUMBER OF PAYMENTS TOTAL:" + numberOfPayments);
    //console.log("PAYMENT COUNT:" + paymentCount);
    //console.log("PAYMENT AMOUNT: " + paymentAmount + " REM BAL: " + remBal);
    return {"paymentAmount": paymentAmount, "remainingBalance": remBal};

}

/****************
toggleButtons
****************/
function toggleButtons() {

    if (gBlnMoveUp) {
        gBlnMoveUp = false;
        localStorage.setItem("moveUp", "false");
        //set to down arrow
        document.getElementById("up-down-arrow").src = "down-arrow.png";
    }
    else {
        gBlnMoveUp = true;
        localStorage.setItem("moveUp", "true");
        //set to up arrow
        document.getElementById("up-down-arrow").src = "up-arrow.png";
    }

    //Reset everything
    onDOMContentLoaded();

}


/****************
Retirement Field Object
****************/
class RetirementField {
     
    constructor(fieldName, fieldValue, fieldDescription, fieldType = "", moneyType = "", timePeriod = "", rateField = "", startYear = "", endYear = "", accrueBeforeStart = true, depositAccount ="", withdrawAccount = "", defaultCashAccount = false, assetLoan = "") {

        this.fieldName = fieldName;
        if (isNumber(fieldValue)) {
            this.fieldValue = Number(trimNumber(fieldValue));
        }
        else {
            this.fieldValue = fieldValue;
        }

        this.fieldDescription = fieldDescription;
        this.fieldType = fieldType;
        this.moneyType = moneyType; //income, expense, investment-savings
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
        this.assetLoan = assetLoan;

        this.initField();

        //console.log("ADDED FIELD ", this);
  
        //console.log("CREATED OBJECT ", this);
    }

    /****************
    fieldDisplayRow
    ****************/
    fieldDisplayRow(inputSequenceNumber) {

        var myResponse = "";

        inputSequenceNumber = inputSequenceNumber - 1; //Before the button

        var changeFunction = 'validateField("' + this.fieldType + '", "' + this.fieldName + '", this.value, ' + inputSequenceNumber + ');';

        if (this.fieldType != "break" && this.fieldType != "add-field") {

            var priorField = gFieldArray[inputSequenceNumber - 1];
            var nextField = gFieldArray[inputSequenceNumber + 1];

            var upArrows = "";
            var downArrows = "";
            
            //console.log("FIELD NAME: " + this.fieldName + " INPUT SEQ: " + inputSequenceNumber + " ARRAY SIZE: " + gFieldArray.length);
            if (priorField.fieldType != "break" && priorField.fieldType != "add-field") {
                upArrows = upArrows + "<img src='up-arrow.png' onclick='moveField(" + inputSequenceNumber + ", -1);'>";
            }
            else {
                upArrows = upArrows + "<img src='no-arrow-lg.png'>";

            }
            if (nextField.fieldType != "break" && nextField.fieldType != "add-field") {
                downArrows = downArrows + "<img src='down-arrow.png' onclick='moveField(" + inputSequenceNumber + ", 1);'>";
            }
            else {
                downArrows = downArrows + "<img src='no-arrow-lg.png'>";

            }

            myResponse = myResponse + "<tr>";
            myResponse = myResponse + "<td width='50%'><p align='right' valign='top'><a onclick='showFieldDetails(_FIELDNAMEPARM_);'>_FIELDDESCRIPTION_:</a>&nbsp;&nbsp;</p></td>";
            myResponse = myResponse + "<td width='50%'><textarea rows='1' cols='10' id='_FIELDNAME_' onchange='" + changeFunction +  "'>_FIELDVALUE_</textarea>_ARROWS_</td>";
            myResponse = myResponse + "</tr>";
    
            myResponse = myResponse.replace(/_FIELDNAME_/gi, this.fieldName);
            myResponse = myResponse.replace(/_FIELDNAMEPARM_/gi, '"' + this.fieldName + '"');

            if (this.fieldType == "money" || this.fieldType == "asset" || this.fieldType == "debt") {
                myResponse = myResponse.replace(/_FIELDVALUE_/gi, currency(this.fieldValue));
                //AJH SUBTOTALS GO HERE
                if (this.timePeriod == "monthly") {
                    subTotalAmount = subTotalAmount + (parseFloat(this.fieldValue) * 12); 
                }
                else {
                    subTotalAmount = subTotalAmount + parseFloat(this.fieldValue); 
                }
                //Starting out, what is liquied net worth?
                if (this.moneyType == "investment-savings") {
                    startLiquidNetWorth = startLiquidNetWorth + parseFloat(this.fieldValue);
                }
            }
            else {
                if (this.fieldType == "rate") {
                    myResponse = myResponse.replace(/_FIELDVALUE_/gi, this.fieldValue + "%");
                }
                else {
                    myResponse = myResponse.replace(/_FIELDVALUE_/gi, this.fieldValue);
                }
            }
            myResponse = myResponse.replace(/_FIELDDESCRIPTION_/gi, this.fieldDescription);
            if (gBlnMoveUp) {
                myResponse = myResponse.replace(/_ARROWS_/gi, upArrows);
            }
            else {
                myResponse = myResponse.replace(/_ARROWS_/gi, downArrows);
            }                  
        }
        else {
            if (this.fieldType == "break") {
                myResponse = myResponse + "<tr><td colspan='2' align='center'><hr><p>-------" + this.fieldDescription + "_AMOUNT_--</p></td></tr>";
                blnDoneWithSection = true;
                //AJH SUBTOTALS ADD THEM UP AND PUT THEM HERE
            }
            else {
                var tempName = "\"" + this.fieldName + "\"";
                myResponse = myResponse + "<tr><td colspan='2' align='center'><input type='button' value='" + this.fieldDescription + "' onClick='javascript:addField(" + tempName + ", " + inputSequenceNumber + ");'></input></td></tr>"; //AJH Add group total here
            }
           
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

        if (this.fieldType != "break" && this.fieldType != "add-field") {
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
        else {
            //this.fieldValue = "0";
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
        //if ((this.fieldType == "money" || this.fieldType == "asset" || this.fieldType == "debt") && Number(this.fieldValue) != 0) {
        if ((this.fieldType == "money" || this.fieldType == "asset" || this.fieldType == "debt") && Number(this.fieldValue) != 0) {

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
                        //Do nothing
                    }
                }
            }

            //For investments, they will always grow.
            if (((this.fieldType == "money" && this.moneyType == "investment-savings"))) {
                this.yearStartAmount = Number(this.fieldValue);
                this.yearInvestmentReturnAmount = Number(this.fieldNetChange);
                this.yearEndAmount = Number(this.fieldValue) + Number(this.fieldNetChange);

                //Fix goofy JS -0 problem
                this.yearInvestmentReturnAmount = this.yearInvestmentReturnAmount + +0;

                if (this.fieldType == "asset" || this.fieldType == "debt") {
                    this.yearEndAmount = Number(this.yearEndAmount) - Number(this.yearExpense);
                }
            }

            if (this.fieldType == "asset" && blnHandleMoney) {

                //If asset, then we have expense to buy it on year it starts and sell income in year done
                if (inputYear == getValue(gFieldArray, this.startYear)) {
                    //When start a buy of asset, starting asset value = 0, expense is cost, end value is cost
                    this.yearStartAmount = 0;
                    this.yearIncome = Number(this.fieldValue);
                    this.yearExpense = 0;
                    this.yearInvestmentReturnAmount = 0;
                    this.yearEndAmount = Number(this.fieldValue);
                    //console.log("WE STARTED A BUY " + this.startAmount + " Bought: " + this.yearExpense  + " Ended up: " + this.endAmount);
                }
                else {
                    if (inputYear == getValue(gFieldArray, this.endYear)) {
                        //When sell an asset, start value is what it was, income is field value, end value is 0
                        this.yearStartAmount = this.fieldValue; //leave it alone
                        this.yearIncome = 0;
                        this.yearExpense = Number(this.fieldValue);;
                        this.yearInvestmentReturnAmount = 0;
                        this.yearEndAmount = 0;
                    }
                    else {
                        //Asset appreciates
                        this.yearStartAmount = Number(this.fieldValue);                                         
                        this.yearInvestmentReturnAmount = Number(this.fieldNetChange);
                        this.yearInvestmentReturnAmount = this.yearInvestmentReturnAmount + +0; //Fix goofy JS -0 problem
                        this.yearEndAmount = Number(this.fieldValue) + Number(this.fieldNetChange);
                    }
                }                
            }

            if (this.fieldType == "debt" && blnHandleMoney) {

                //If debt, then remaining balance is what we manage
                this.yearStartAmount = 0;
                this.yearInvestmentReturnAmount = 0;
                this.yearIncome = 0;
                this.yearExpense = 0;
                this.yearEndAmount = 0;
                //console.log("CYCLE YEAR A: " + inputYear, this);
                if (inputYear == getValue(gFieldArray, this.startYear)) {
                    //When start, remaing balance is full amount
                    this.yearStartAmount = 0;
                    this.yearIncome = 0;
                    this.yearEndAmount = Number(this.fieldValue) * -1;
                    this.yearExpense = this.yearStartAmount + this.yearEndAmount;
                    //this.yearExpense = this.yearStartAmount - this.yearEndAmount;
                    this.yearInvestmentReturnAmount = 0;
                }
                else {
                    //Debt - last years balance
                    var paymentCount = (inputYear - 1 - getValue(gFieldArray, this.startYear)) * 12;
                    var testMortagePayment = calculateMortagePayment(this.fieldValue, getValue(gFieldArray, this.rateField), getValue(gFieldArray, this.startYear), getValue(gFieldArray, this.endYear), paymentCount);
                    this.yearStartAmount = testMortagePayment.remainingBalance * -1;
                    
                    //Now this years balance
                    paymentCount = (inputYear - getValue(gFieldArray, this.startYear)) * 12;
                    testMortagePayment = calculateMortagePayment(this.fieldValue, getValue(gFieldArray, this.rateField), getValue(gFieldArray, this.startYear), getValue(gFieldArray, this.endYear), paymentCount);
                    this.yearEndAmount = testMortagePayment.remainingBalance * -1;
                    this.yearIncome = 0;
                    this.yearExpense = 0; 
                    this.yearInvestmentReturnAmount = this.yearStartAmount - this.yearEndAmount;
                }
                
                this.fieldNetChange = 0;
                //console.log("CYCLE YEAR B: " + inputYear, this);
            }


            //End of yaer, cycled up by net change amount
            this.fieldValue = Number(this.fieldValue) + Number(this.fieldNetChange);

            var clone = JSON.parse(JSON.stringify(this));

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