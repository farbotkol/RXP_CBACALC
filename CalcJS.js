var myApp = angular.module('RealEstateApp', ['ng-currency']);

Date.prototype.yyyymmdd = function() {         
    
    var yyyy = this.getFullYear().toString();                                    
    var mm = (this.getMonth()+1).toString(); // getMonth() is zero-based         
    var dd  = this.getDate().toString();             
    
    return yyyy + '-' + (mm[1]?mm:"0"+mm[0]) + '-' + (dd[1]?dd:"0"+dd[0]);
};  

Date.prototype.ddmmyyyy = function() {         
    
    var yyyy = this.getFullYear().toString();                                    
    var mm = (this.getMonth()+1).toString(); // getMonth() is zero-based         
    var dd  = this.getDate().toString();             
    
    return  (dd[1]?dd:"0"+dd[0])  + '/' + (mm[1]?mm:"0"+mm[0]) + '/' + yyyy;
}; 


myApp.directive("percent", function($filter){
    var p = function(viewValue){
        var m = viewValue.match(/^(\d+)\/(\d+)/);
        if (m != null)
          return $filter('number')(parseInt(m[1])/parseInt(m[2]), 4);
        return $filter('number')(parseFloat(viewValue)/100, 4);
    };

    var f = function(modelValue){
        return $filter('number')(parseFloat(modelValue)*100, 2);
    };
    
    return {
        require: 'ngModel',
        link: function(scope, ele, attr, ctrl){
            ctrl.$parsers.unshift(p);
            ctrl.$formatters.unshift(f);
        }
    };
});

myApp.controller('RealEstateController',['$scope', function($scope) {
 // ------- MODELS --------

    $scope.VERSION = "v2.00";
    
    // Month number, amortization date, interest, principal, principal balance
    $scope.Amortizations = [];
    
    $scope.CalcTypeName = 'Equipment Loan';
    $scope.CalcType = '3';
    
    //Details 
    $scope.InAdvanced = 'true';
    $scope.Frequency = 'Monthly';
    $scope.DDate = new Date();
    $scope.DDateText = $scope.DDate;//$scope.DDate.yyyymmdd();
    $scope.AssetType =  'All Other Assets';
    $scope.EquipmentCost = 1000;
    $scope.TradeIn = 0;
    $scope.MVRegoCost = 0;
    $scope.Options = 0;
    $scope.SupplierDelivery = 0;
    $scope.SupplierDiscount = 0;
    $scope.FeesAndChargesFinanced = 0;
    $scope.EquipmentCostExclRego = 0;
    $scope.TotalEquipmentCost = 0;
    $scope.LessorRate = 0.07;
    $scope.TermInMonths = 48;
    $scope.DelayedPayment = 0;


    $scope.AddPayments = [];

    $scope.IsSeasonal = false;


    //Brokerage Details
    $scope.BrokageAmount = 0; 
    $scope.BrokagePercent = 0; 
    //$scope.BalloonAmount = 0; 
    //$scope.BalloonPercent = 0; 

    $scope.ResidualAmount = 0; 
    $scope.ResidualPercent = 0; 
 
    $scope.AmountFinanced = 0; 

    //Summary 
    $scope.TotalAmountFinanced = 0;
    $scope.TermInMonthsInstallment = 0;


    //$scope._NumberInstallments = 0 ;
    $scope.MortgageDuty = 0;
    $scope.LesseeRate = 0; 

    //$scope.GST = 0;
    //$scope.LCT = 0;
    //$scope.ITC = 0;
      
    //hidden stuff from XML- Luke 
    //$scope.FrequencyPerPeriod = 0;
    $scope.FrequencyPerYear =  0;
    $scope.RentalPMT = 0;
    //$scope.DelayedPayment = 0;
    $scope.IsIrregular = false;
    $scope.IsSeasonal = false;

    $scope.Seasonal = [false,false,false,false,false,false,false,false,false,false,false,false]; // need ui
    $scope.RegularPaymentOverride = 0;




    //CBACalculatorFacts salesforce config settings
    $scope.LCTLimit_ = 75375;// Doesnt seem to be used
    $scope.LCTLimitFuelEfficient = 75375;
    $scope.GSTPercentRate = 0.1;
    $scope.MortgageDutyBaseNSW = 5;
    $scope.MortgageDutyLimitNSW = 16000;
    $scope.MortgageDutyRateNSW = 0.4;
    $scope.MortgageDutyCeilFactorNSW = 1000;
    $scope.MortgageDutyBaseSA = 0;
    $scope.MortgageDutyLimitSA = 0;
    $scope.MortgageDutyRateSA = 0;
    $scope.MortgageDutyCeilFactorSA = 100;

    $scope.LCTCarLimit = 57466;//maybe should be added to CBACalculatorFacts    LCTLimitLuxury__c ( LCT Limit Luxury Car)
    $scope.threshouldIteration = 5000; //maybe should be added to CBACalculatorFacts
    $scope.thresholdDistance = 0.001; //maybe should be added to CBACalculatorFacts
    $scope.LCTRate = 0.33;//maybe should be added to CBACalculatorFacts 
    $scope.LCTLuxuryThreshold = 61884; //maybe should be added to CBACalculatorFacts 

    //$scope.AmountFinanced = 4000000;
    $scope.DownPaymentPercent = .0; 
    $scope.DownPayment = 0;
    $scope.InstallmentPrincipal = 0;
    
    $scope.TotalInterest = 0;
    $scope.TotalPrincipal = 0;
    $scope.TotalAmortization = 0;

    $scope.GSTreciprocal = 1/$scope.GSTPercentRate + 1; // was CarGSTRateNum in flash app
    
    
    
    $scope.NumberOfYearsToPay = 5;
    //$scope.NumberInstallments  = 0;
    $scope.FrequencyPerPeriod = 1; // monthly
    


    $scope.LesseeRate = 0.21;
    $scope.PeriodicInterestRate = 0;
    $scope.AmortizationFactor = 0;
    $scope.AmortizationAmount = 0;

    
    // determine payment terms based on budget
    $scope.DeterminePaymentTerms = false; 
    $scope.Budget = 0;


    //UI SHOW HIDE VARS.
    $scope.showFacts = false;
    $scope.showTradeIn = false;
    $scope.showTotalAmountFinanced = false ;
    $scope.showCostOfGoods = false;
    $scope.showPlusFeesAndChargesFinanced = false;
    $scope.showGSTOnResidual = false; 
    $scope.showResidualAmountIncGST = false;
    $scope.showResidualValueIncGST = false;
    $scope.showTotalAmountInterest = false;
    $scope.showTotalAmountRepayments = false;
    $scope.showNumberInstallments = false;
    $scope.showPayable = false;

    $scope.showHirePurchaseSummaryPart2 = false;
    $scope.showFinanceLeaseSummaryPart2 = false;


    $scope.showITC = false;

    $scope.showDelayedPayment = false;
    $scope.showAmountFinancedForHP = false;

    $scope.showPurchasePriceOfgoods = false;
    
    ///////
    $scope.AdvancedPayments = [
        { MonthNumber: null, Payment: null }
    ];


    $scope.calcJSON = null;
    

    // ------- CONTROLLER's ACTIONS -----------
    
    /*$scope.ComputeYears = function() {
        $scope.NumberOfYearsToPay = $scope.InAdvanced / 12;
    }*/

    $scope.CondenseJSONScheduleForSF = function(schedule){
        var newschedule = [];

        var originalLen = schedule.length;
        var index = 1 ; 
        var futureSched; 


        if (originalLen > 1 ){

            var prevSched = schedule[0]  
            var currSched = schedule[1] 
            var startDate = prevSched["-DDate"];
            var futureSched;    
            var paymentsCnt = 1; 
            while (index < originalLen){

                currSched = schedule[index];     

                //do something 
                if (prevSched["-TotalPayment"]  == currSched["-TotalPayment"] ) 
                {
                    paymentsCnt++; 

                    if (index == originalLen-1)
                    {
                        futureSched = prevSched; 
                        futureSched["-No_of_Payments"] = paymentsCnt;
                        newschedule.push(futureSched);
                    }
                }
                else 
                {
                   
                    futureSched = prevSched; 
                    futureSched["-DDate"] = startDate;
                    futureSched["-No_of_Payments"] = paymentsCnt;
                    newschedule.push(futureSched);


                    startDate = currSched["-DDate"];
                    paymentsCnt=1

                    if (index == originalLen-1)
                    {
                        newschedule.push(currSched);
                    }
                }

                prevSched = currSched;

                index++;
            }   

        }

        return newschedule;



    }

    $scope.CreateJSONScheduleForSF = function(){

        var schedule = [];

        if ($scope.loanProjectionLesse.loanProjections != null && $scope.loanProjectionLesse.loanProjections.length > 0)
        {
            var lpBefore = $scope.loanProjectionLesse.loanProjections[0];
            var numberofpayment = 0 ;
            var LstInstallmentDate = lpBefore.DDate;
            var startInstallmentDate = lpBefore.DDate
            var lpCurrent;
            var x = 0;
            while (x <= $scope.loanProjectionLesse.loanProjections.length)
            {
                
                if (x < $scope.loanProjectionLesse.loanProjections.length)
                {
                    lpCurrent = $scope.loanProjectionLesse.loanProjections[x];

                    if (Math.ceil(lpCurrent.TotalPayment() * 100) == Math.ceil(lpBefore.TotalPayment() * 100) && $scope.IsSeasonal == false && Math.abs(lpCurrent.AdditionalPayment) < 0.005)
                    {
                        numberofpayment++;
                        LastInstallmentDate = lpBefore.DDate;

                    }
                    else
                    {

                        if (lpBefore.TotalPayment() > 0 )
                        {
                            numberofpayment++;
                            var scheduleItem = {
                                            "-DDate": startInstallmentDate.ddmmyyyy(),
                                            "-LastInstallmentDate": LastInstallmentDate.ddmmyyyy(),
                                            "-Payment": lpBefore.PaymentRounded(),
                                            "-AutoAdditionalPayment": lpBefore.AutoAdditionalPayment,
                                            "-AdditionalPayment": lpBefore.AdditionalPayment,
                                            "-TotalPayment": lpBefore.TotalPaymentRounded(),
                                            "-No_of_Payments": numberofpayment,
                                            "-Payment_Frequency": ($scope.IsSeasonal === true) ? "Monthly" : $scope.Frequency
                            };

                            schedule.push(scheduleItem);
                        }
                        if(x == $scope.loanProjectionLesse.loanProjections.length -1  && lpCurrent.TotalPayment() > 0)
                        {

                            numberofpayment = 1;
                            var scheduleItem = {
                                            "-DDate": lpCurrent.DDate.ddmmyyyy(),
                                            "-LastInstallmentDate": lpCurrent.DDate.ddmmyyyy(),
                                            "-Payment": lpCurrent.PaymentRounded(),
                                            "-AutoAdditionalPayment": lpCurrent.AutoAdditionalPayment,
                                            "-AdditionalPayment": lpCurrent.AdditionalPayment,
                                            "-TotalPayment": lpCurrent.TotalPaymentRounded(),
                                            "-No_of_Payments": numberofpayment,
                                            "-Payment_Frequency": ($scope.IsSeasonal === true) ? "Monthly" : $scope.Frequency
                            };

                            schedule.push(scheduleItem);

                        }
                        startInstallmentDate = lpCurrent.DDate;
                        numberofpayment =  0;
                    }

                }
                
                lpBefore = lpCurrent;
                LastInstallmentDate = lpCurrent.DDate;
                x++;
            }
        }

        if ( $scope.Frequency != "Monthly")
        {

            schedule = $scope.CondenseJSONScheduleForSF(schedule);
        }

        return schedule;
    }

    $scope.CreateSaveObject = function(){

      
        var CBACalculatorTools = {
                                  "CBACalculatorTools": {
                                    "CBACalculatorForm": {
                                      "CalcTypeName": $scope.CalcTypeName ,
                                      "CalcType": $scope.CalcType,
                                      "InAdvanced": $scope.InAdvanced,
                                      "Frequency": $scope.Frequency,
                                      "State": $scope.State,
                                      "DDate": $scope.DDate.ddmmyyyy(),
                                      "AssetType": $scope.AssetType,
                                      "EquipmentCost": $scope.EquipmentCost,
                                      "TradeIn": $scope.TradeIn,
                                      "MVRegoCost": $scope.MVRegoCost,
                                      "Options": $scope.Options,
                                      "SupplierDelivery": $scope.SupplierDelivery,
                                      "SupplierDiscount": $scope.SupplierDiscount,
                                      "FeesAndChargesFinanced": $scope.FeesAndChargesFinanced,
                                      "LessorRate": $scope.LessorRate,
                                      "TermInMonths": $scope.TermInMonths,
                                      "BrokageAmount": $scope.BrokageAmount,
                                      "BrokagePercent": $scope.BrokagePercent,
                                      "ResidualAmount": $scope.ResidualAmount,
                                      "ResidualPercent": $scope.ResidualPercent,
                                      "BalloonAmount": $scope.BalloonAmount(),
                                      "BalloonPercent": $scope.BalloonPercent(),
                                      "DelayedPayment": $scope.DelayedPayment,
                                      "BalloonAmountExclGST": $scope.ResidualAmount,
                                      "FrequencyPerPeriod": $scope.FrequencyPerPeriod,
                                      "AmountFinanced": $scope.AmountFinanced,
                                      "TotalAmountFinanced": $scope.TotalAmountFinanced(),
                                      "FrequencyPerYear": $scope.FrequencyPerYear,
                                      "EquipmentCostExclRego": $scope.EquipmentCostExclRego,
                                      "TotalEquipmentCost": $scope.TotalEquipmentCost,
                                      "TermInMonthsInstallment": $scope.TermInMonthsInstallment(),
                                      "TotalGST": $scope.TotalGST(),
                                      "GST": $scope.GST(),
                                      "LCT": $scope.LCT(),
                                      "ITC": $scope.ITC(),
                                      "BrokeragePercentHPEL": $scope.BrokagePercent,
                                      "AssetFinancedLease": $scope.AssetFinancedLease(),
                                      "AmountFinancedHirePurchaseEquipmentLoan": $scope.AmountFinancedHirePurchaseEquipmentLoan(),
                                      "ITCLease": $scope.ITCLease(),
                                      "ITC_HPEL": $scope.GST_HPEL(),
                                      "HPEL_Installment": $scope.HPEL_Installment(),
                                      "RentalDuty": 0,
                                      "TotalInstallment": $scope.TotalInstallment(),
                                      "RentalPMT": $scope.RentalPMT,
                                      "RentalInAdvanceLease": $scope.RegularPaymentOverride,
                                      "TotalLeaseRental": $scope.TotalLeaseRental(),
                                      "ResidualValueInclGST": $scope.BalloonAmount(),
                                      "LesseeRate": $scope.LesseeRate,
                                      "LCTLimit": $scope.LCTLimit(),
                                      "CarLuxuryTaxValue": $scope.CarLuxuryTaxValue(),
                                      "RentalInstallment": $scope.GSTRentalDuty() + $scope.TotalInstallment(),
                                      "GSTOnResidual": $scope.GSTOnResidual(),
                                      "GST_HPEL": $scope.GST_HPEL(),
                                      "GSTRentalDuty": $scope.GSTRentalDuty(),
                                      "MaxITCOnLease": $scope.MaxITCOnLease(),
                                      "CarCostExclGSTAndLCT": $scope.CarCostExclGSTAndLCT(),
                                      "NumberInstallments": $scope.NumberInstallmentsFromSchedule,
                                      "TotalAmountRepayments": $scope.TotalAmountRepaymentsFromSchedule,
                                      "TotalAmountInterest": $scope.TotalAmountInterestFromSchedule,
                                      "MortgageDuty": $scope.MortgageDuty,
                                      "VERSION": $scope.VERSION
                                    },
                                    "CBACalculatorFacts": {
                                      "LCTLimit": $scope.LCTLimit(),
                                      "LCTLimitFuelEfficient": $scope.LCTLimitFuelEfficient,
                                      "GSTPercentRate": $scope.GSTPercentRate,
                                      "MortgageDutyBaseNSW": $scope.MortgageDutyBaseNSW,
                                      "MortgageDutyLimitNSW": $scope.MortgageDutyLimitNSW,
                                      "MortgageDutyRateNSW": $scope.MortgageDutyRateNSW,
                                      "MortgageDutyCeilFactorNSW": $scope.MortgageDutyCeilFactorNSW,
                                      "MortgageDutyBaseSA": $scope.MortgageDutyBaseSA,
                                      "MortgageDutyLimitSA": $scope.MortgageDutyLimitSA,
                                      "MortgageDutyRateSA": $scope.MortgageDutyRateSA,
                                      "MortgageDutyCeilFactorSA": $scope.MortgageDutyCeilFactorSA,
                                      "LCTRate": $scope.LCTRate,
                                      "LCTLuxuryThreshold" : $scope.LCTLuxuryThreshold,
                                      "LCTCarLimit": $scope.LCTCarLimit
                                    },
                                    "CBACalculatorSchedule": {
                                      "CBACalculatorAddPayments": {
                                        "AdditionalPayment": $scope.getAddPaymentArray()
                                      },
                                      "Seasonal": ($scope.IsSeasonal === true) ? $scope.Seasonal.toString() :null,
                                      "ScheduledPaymentPerFreq": $scope.RegularPaymentOverride,
                                      "Schedules": {
                                        "Schedule": $scope.CreateJSONScheduleForSF()
                                      }
                                    }
                                  }
                                };
                                          

        return CBACalculatorTools;


        //console.log(CBACalculatorTools) ;     

        //console.log(JSON.stringify(CBACalculatorTools));                    


    }


    $scope.TotalLeaseRental= function() {
        return $scope.RegularPaymentOverride  + $scope.GSTRentalDuty();
    }
    
    $scope.ComputeFromAmountFinanced = function() {
        if ($scope.DDateText == null)
        {
            // type date not suported by browser
            $scope.dateformat = 'Invalid Date use YYYY-MM-DD'

        }
        else
        {
            $scope.dateformat = $scope.dateformatcopy;
            $scope.DDate = new Date($scope.DDateText);
        }
        
        
        //$scope.ComputeTermInMonthsInstallment();
        $scope.ComputeDetailCosts();
        $scope.ComputeAmountFinanced(); //Needs to be after ComputeDetailCosts();
        //$scope.ComputeTotalAmountFinanced();
        $scope.ComputeRentalPMT();
        $scope.ComputeLesseeRate();

        

        $scope.ComputeMorgageDuty (); // must be after the amount is calculated
        

        //$scope.ComputeDownPayment();
        //$scope.ComputeInstallmentPrincipal();
        //$scope.ComputeAmortizationFactor();

        $scope.ProjectionCalculate();

    }


    $scope.getAddPaymentArray = function(){
        var addPayments = [];
        var cnt = 0;
        var len = $scope.loanProjectionLesse.loanProjections.length;

        while (cnt < len)
        {
            addPayments.push($scope.loanProjectionLesse.loanProjections[cnt].AdditionalPayment);
            cnt++;    
        }

        return addPayments;
            
    }

    $scope.setAddPaymentArray = function(payments){
        $scope.AddPayments = [];
        var cnt = 0;
        var len = payments.AdditionalPayment.length;

        while (cnt < len)
        {
             var baseItem = {"AdditionalPayment":0};
             baseItem.AdditionalPayment = Number(payments.AdditionalPayment[cnt]);
             $scope.AddPayments.push(baseItem);
             cnt++;    
        }

        //$scope.ProjectionCalculate();
            
    }

    $scope.ComputeAddPaymentChange = function(){
        $scope.AddPayments = [];
        var cnt = 0;
        var len = $scope.loanProjectionLesse.loanProjections.length;

        while (cnt < len)
        {
             var baseItem = {"AdditionalPayment":0};
             baseItem.AdditionalPayment = $scope.loanProjectionLesse.loanProjections[cnt].AdditionalPayment;
             $scope.AddPayments.push(baseItem);
             cnt++;    
        }

        $scope.ProjectionCalculate();
            
    }

    /*$scope.InAdvanceChanged = function() {
        $scope.InAdvanced =  Boolean($scope.InAdvanced);

        $scope.ComputeFromAmountFinanced();
    }*/

     $scope.TypeChanged = function() {
        

        //$scope.CalcType =  parseInt($scope.CalcType);


        switch ($scope.CalcType) {
          case '1':
            $scope.CalcTypeName  = 'Finance Lease';
            $scope.showTradeIn =  false;
            $scope.showTotalAmountFinanced = false ;
            $scope.showCostOfGoods = true;
            $scope.showPlusFeesAndChargesFinanced = true;
            $scope.showGSTOnResidual = true; 
            $scope.showResidualAmountIncGST = true;
            $scope.showResidualValueIncGST = true;
            $scope.showTotalAmountInterest = false;
            $scope.showTotalAmountRepayments = false;
            $scope.showNumberOfRentals = true;
            $scope.showNumberInstallments = false;
            $scope.showPayable = true;
            $scope.showHirePurchaseSummaryPart2 = false;
            $scope.showFinanceLeaseSummaryPart2 = true;
            $scope.showITC = true;
            $scope.showDelayedPayment = false;
            $scope.showAmountFinancedForHP = false;
            $scope.showPurchasePriceOfgoods = false;
            break;
          case '2':
            $scope.CalcTypeName  = 'Hire Purchase';
            $scope.showTradeIn =  true;
            $scope.showTotalAmountFinanced = true ;
            $scope.showCostOfGoods = false;
            $scope.showPlusFeesAndChargesFinanced = false;
            $scope.showGSTOnResidual = false; 
            $scope.showResidualAmountIncGST = false;
            $scope.showResidualValueIncGST = false;
            $scope.showTotalAmountInterest = false;
            $scope.showTotalAmountRepayments = false;
            $scope.showNumberOfRentals = false;
            $scope.showNumberInstallments = false;
            $scope.showPayable = false;
            $scope.showHirePurchaseSummaryPart2 = false;
            $scope.showFinanceLeaseSummaryPart2 = false;
            $scope.showITC = true;
            $scope.showDelayedPayment = false;
            $scope.showAmountFinancedForHP = true;
            $scope.showPurchasePriceOfgoods = true;
            break;
          case '3':
            $scope.CalcTypeName  = 'Equipment Loan';
            $scope.showTradeIn =  true;
            $scope.showTotalAmountFinanced = true ;
            $scope.showCostOfGoods = false;
            $scope.showPlusFeesAndChargesFinanced = false;
            $scope.showGSTOnResidual = false; 
            $scope.showResidualAmountIncGST = false;
            $scope.showResidualValueIncGST = false;
            $scope.showTotalAmountInterest = true;
            $scope.showTotalAmountRepayments = true;
            $scope.showNumberOfRentals = false;
            $scope.showNumberInstallments = true;
            $scope.showPayable = false;
            $scope.showHirePurchaseSummaryPart2 = true;
            $scope.showFinanceLeaseSummaryPart2 = false;
            $scope.showITC = false;
            $scope.showDelayedPayment = false;
            $scope.showAmountFinancedForHP = false;
            $scope.showPurchasePriceOfgoods = false;
            break;
          case '4':
            $scope.CalcTypeName  = 'Novated Lease';
            $scope.showTotalAmountFinanced = false ;
            $scope.showTradeIn =  false;
            $scope.showCostOfGoods = true;
            $scope.showPlusFeesAndChargesFinanced = true;
            $scope.showGSTOnResidual = true; 
            $scope.showResidualAmountIncGST = true;
            $scope.showResidualValueIncGST = true;
            $scope.showTotalAmountInterest = false;
            $scope.showTotalAmountRepayments = false;
            $scope.showNumberOfRentals = true;
            $scope.showNumberInstallments = false;
            $scope.showPayable = true;
            $scope.showHirePurchaseSummaryPart2 = false;
            $scope.showFinanceLeaseSummaryPart2 = true;
            $scope.showITC = true;
            $scope.showDelayedPayment = true;
            $scope.showAmountFinancedForHP = false;
            $scope.showPurchasePriceOfgoods = false;
            break;
          case '5':
            $scope.CalcTypeName  = 'Protected Lease';
            $scope.showTradeIn =  false;
            $scope.showTotalAmountFinanced = false ;
            $scope.showCostOfGoods = true;
            $scope.showPlusFeesAndChargesFinanced = true;
            $scope.showGSTOnResidual = true; 
            $scope.showResidualAmountIncGST = true;
            $scope.showResidualValueIncGST = true;
            $scope.showTotalAmountInterest = false;
            $scope.showTotalAmountRepayments = false;
            $scope.showNumberOfRentals = true;
            $scope.showNumberInstallments = false;
            $scope.showHirePurchaseSummaryPart2 = false;
            $scope.showFinanceLeaseSummaryPart2 = true;
            $scope.showPayable = true;
            $scope.showITC = true;
            $scope.showDelayedPayment = true;
            $scope.showAmountFinancedForHP = false;
            $scope.showPurchasePriceOfgoods = false;
            break;
          default:
            $scope.CalcTypeName  = '';
            break;
        }

         $scope.ComputeFromAmountFinanced();

         $scope.CalculateBrokagePercent();
         $scope.CalculateResidualPercent();
    }

    $scope.HPEL_Installment = function() {
        return $scope.ComputePMT((Math.pow(1 + $scope.LessorRate / 12, $scope.FrequencyPerPeriod) - 1), $scope.TermInMonths, $scope.FrequencyPerPeriod, $scope.DelayedPayment, -($scope.AmountFinancedHirePurchaseEquipmentLoan() + $scope.BrokageAmount), $scope.ResidualAmount, JSON.parse($scope.InAdvanced));
    }

    $scope.TotalGST = function() {
        if (parseInt($scope.CalcType) == 2)
        {
            return $scope.GST() + $scope._compoundGSTonCreditCharges;
        }
        return $scope.GST();
    }

    $scope.CarGST = function() {
        if ($scope.EquipmentCostExclRego < $scope.LCTLimit()){
            return $scope.EquipmentCostExclRego / $scope.GSTreciprocal;
        }
        //added as a fix, $scope is not from original code
        /*if ( $scope.AssetType == "All Other Assets"){
            return $scope.EquipmentCostExclRego / $scope.GSTreciprocal;
        }*/
        return $scope.CarLuxuryTaxValue() / $scope.GSTreciprocal;
    }

    $scope.CarLuxuryTaxValue = function(){
            return $scope.EquipmentCostExclRego - $scope.CarLCT();
    }

    $scope.CarLCT = function() {
        if ($scope.EquipmentCostExclRego < $scope.LCTLimit())
        {
            return 0;
        }
        return Math.round($scope.CarCostExclGSTAndLCT() * $scope.LCTRate * 100) / 100;
    }

    $scope.CarCostExclGSTAndLCT = function() {
        if ($scope.EquipmentCostExclRego < $scope.LCTLimit())
        {
            return 0;
        }
        return ($scope.EquipmentCostExclRego - $scope.LCTLimit()) / $scope.ExcludesGSTLCTRate();
    }

    $scope.ExcludesGSTLCTRate = function()  {
        return 1 + $scope.GSTPercentRate + $scope.LCTRate;
    }

    $scope.LCTLimit = function(){
        if ($scope.AssetType == "Car-Luxury")
        {
            return $scope.LCTLuxuryThreshold;
        }
        return $scope.LCTLimitFuelEfficient;
    }

    $scope.GSTOnResidual = function(){
    
            return Math.round($scope.ResidualAmount * $scope.GSTPercentRate * 100) / 100;
    }


    $scope.GST = function(){
        var gst = 0;
        if (!$scope.IsAssetACar())
        {
            gst = Math.round($scope.GST_HPEL() * 100) / 100;
        }
        else if ($scope.TotalEquipmentCost < $scope.LCTLimit())
        {
            gst = Math.round($scope.GST_HPEL() * 100) / 100;
        }
        else
        {
            gst = Math.round($scope.CarGST() * 100) / 100;
        }
        return gst;
    }

    $scope.GST_HPEL= function(){
        //function alterned from original flash to be simplified  
        return $scope.EquipmentCostExclRego /  $scope.GSTreciprocal;
    }

    $scope.IsAssetACar = function(){
        return $scope.AssetType != null && $scope.AssetType.toUpperCase().substr(0, 3) == "CAR";
    }

    
    $scope.BalloonPercent  = function(){
        return $scope.ResidualPercent;
    }

    $scope.BalloonAmount = function(){
        if (parseInt($scope.CalcType) == 1 || parseInt($scope.CalcType) == 4 || parseInt($scope.CalcType) == 5)
        {
            return $scope.ResidualAmount + $scope.GSTOnResidual();
        }
        return $scope.ResidualAmount;
    }


    $scope.LCT = function() {
        if ($scope.IsAssetACar())
        {
            return $scope.CarLCT();
        }
        return 0;
    }

    $scope.ITC = function() {
        if (parseInt($scope.CalcType) == 1 || parseInt($scope.CalcType) == 4)
        {
            if ($scope.IsAssetACar)
            {
                return Math.round($scope.ITCLease() * 100) / 100;
                
            }
            return Math.round($scope.GST_HPEL() * 100) / 100;
            //return $scope.GST_HPEL();

            //return $scope.ITC_HPEL; // ORIGINAL, CHNAGED BECAUSE ITC_HPEL SIMPLY CALLED GST_HPEL
        }
        else
        {
            if (parseInt($scope.CalcType) == 3)
            {
                return 0;
            }
            return $scope.GST();
        }
    }




    $scope.FrequencyChanged= function() {
        
        switch ($scope.Frequency) {
          case 'Monthly':
            $scope.FrequencyPerPeriod = 1;
            $scope.FrequencyPerYear =  12;
            break;
          case 'Quarterly':
            $scope.FrequencyPerPeriod = 3;
            $scope.FrequencyPerYear =  4;   
            break;
          case 'Half Yearly':
            $scope.FrequencyPerPeriod = 6;
            $scope.FrequencyPerYear =  2;
            break;
          case 'Yearly':
            $scope.FrequencyPerPeriod = 12;
            $scope.FrequencyPerYear =  1;
            break;
          default:
            $scope.FrequencyPerPeriod = 1; // Monthly Default
            $scope.FrequencyPerYear =  12;
            break;
        }

         $scope.ComputeFromAmountFinanced();
    }

    /*
        Calculate the morgate duty from based on the 
        CBACalculatorFacts and AmountFinanced

        Formular extracted from decomiled legacy flash object 
    */
    $scope.ComputeMorgageDuty = function(){

        var MortgageDutyBase;
        var MortgageDutyLimit;
        var MortgageDutyRate;
        var MortgageDutyCeilFactor;
        if ($scope.State == "NSW")
        {
            MortgageDutyBase = $scope.MortgageDutyBaseNSW;
            MortgageDutyLimit = $scope.MortgageDutyLimitNSW;
            MortgageDutyRate = $scope.MortgageDutyRateNSW;
            MortgageDutyCeilFactor = $scope.MortgageDutyCeilFactorNSW;
        }
        else if ($scope.State == "SA")
        {
            MortgageDutyBase = $scope.MortgageDutyBaseSA;
            MortgageDutyLimit = $scope.MortgageDutyLimitSA;
            MortgageDutyRate = $scope.MortgageDutyRateSA;
            MortgageDutyCeilFactor = $scope.MortgageDutyCeilFactorSA;
        }
        else
        {
            $scope.MortgageDuty = 0;
        }

        if ($scope.AmountFinanced <= MortgageDutyLimit && ($scope.State == "SA" || $scope.State == "NSW"))
        {
            $scope.MortgageDuty =  MortgageDutyBase;
        }
        else if ($scope.State == "SA" || $scope.State == "NSW")
        {
            $scope.MortgageDuty = (Math.ceil($scope.AmountFinanced / MortgageDutyCeilFactor) * MortgageDutyCeilFactor - MortgageDutyLimit) / 100 * MortgageDutyRate + MortgageDutyBase;
        }
        //return (Math.ceil($scope.AmountFinanced / 1000) * 1000 - 16000) / 100 * .4 + 5;
    }

    $scope.ComputeDetailCosts = function() {


        $scope.EquipmentCostExclRego = $scope.EquipmentCost + $scope.Options + $scope.SupplierDelivery - $scope.SupplierDiscount;

        $scope.TotalEquipmentCost = $scope.EquipmentCost + $scope.MVRegoCost + $scope.Options
                                    + $scope.SupplierDelivery - $scope.SupplierDiscount ;



    };

    $scope.CalculateBrokagePercent = function() {
        if ($scope.AmountFinanced < 0.005)
        {
            return 0;
        }
        if (parseInt($scope.CalcType) == 2)
        {
            $scope.BrokagePercent = Math.round($scope.BrokageAmount * 10000 / $scope.AmountFinancedHirePurchaseEquipmentLoan()) / 10000;
        }
        else
        {
            $scope.BrokagePercent = Math.round($scope.BrokageAmount * 10000 / $scope.AmountFinanced) / 10000;
        }
        $scope.ComputeFromAmountFinanced();
    }

    $scope.CalculateBrokageAmount = function() {
        if (parseInt($scope.CalcType) == 2)
        {
            $scope.BrokageAmount = $scope.BrokagePercent * $scope.AmountFinancedHirePurchaseEquipmentLoan() * 10000 / 10000;
        }
        else
        {
            $scope.BrokageAmount = $scope.BrokagePercent * $scope.AmountFinanced * 10000 / 10000;
        }

        $scope.ComputeFromAmountFinanced();
        
    }

    $scope.CalculateResidualPercent = function() {
        var _loc_1;
        if (parseInt($scope.CalcType) == 1 || parseInt($scope.CalcType) == 4)
        {
            _loc_1 = $scope.AmountFinanced - $scope.FeesAndChargesFinanced - $scope.MVRegoCost;
        }
        else
        {
            _loc_1 = $scope.AmountFinancedHirePurchaseEquipmentLoan();
        }
        if (_loc_1 < 0.0005)
        {
            return 0;
        }
        $scope.ResidualPercent =  Math.round($scope.ResidualAmount * 10000 / _loc_1) / 10000;

        $scope.ComputeFromAmountFinanced();
    }

    $scope.CalculateResidualAmount = function() {
        var _loc_2;
        if (parseInt($scope.CalcType) == 1 || parseInt($scope.CalcType) == 4)
        {
            _loc_2 = $scope.AmountFinanced - $scope.FeesAndChargesFinanced - $scope.MVRegoCost;
        }
        else
        {
            _loc_2 = $scope.AmountFinancedHirePurchaseEquipmentLoan();
        }
        $scope.ResidualAmount = Math.round($scope.ResidualPercent * _loc_2 * 100) / 100;

        $scope.ComputeFromAmountFinanced();
    }

     $scope.AmountFinancedHirePurchaseEquipmentLoan = function() {
        if (parseInt($scope.CalcType) == 1 || parseInt($scope.CalcType) == 4)
        {
            return $scope.TotalEquipmentCost + $scope.FeesAndChargesFinanced;
        }
        return $scope.TotalEquipmentCost + $scope.FeesAndChargesFinanced - $scope.TradeIn;
    }

    $scope.NumberInstallments = function() {
        if ($scope.IsIrregular)
        {
            return $scope.NumberInstallmentsFromSchedule / $scope.FrequencyPerPeriod;

            //temp 

            //return  $scope.TermInMonths / $scope.FrequencyPerPeriod;
        }
        return $scope.TermInMonths / $scope.FrequencyPerPeriod;
    }

    /*$scope.ComputeTermInMonthsInstallment = function() {
            
            // Equipment Loan
            
            if(parseInt($scope.CalcType) == 3){
                console.log('ComputeTermInMonthsInstallment parseInt($scope.CalcType) :' + $scope.CalcType )
                $scope.TermInMonthsInstallment = $scope.TermInMonths;
            }
            else 
            {   // other logic later 
                $scope.TermInMonthsInstallment = $scope.TermInMonths;
            }

            if ($scope.FrequencyPerPeriod == 0 ){
                $scope.FrequencyChanged();
            }

            //calculate NumberInstallments
            //$scope.NumberInstallments = $scope.TermInMonthsInstallment / $scope.FrequencyPerPeriod;
            console.log('$scope.NumberInstallments: ' + $scope.NumberInstallments());
    };*/


    $scope.TermInMonthsInstallment = function() {
        if ($scope.FrequencyPerPeriod == 0 ){
                $scope.FrequencyChanged();
        }
        if ($scope.InAdvanced && $scope.ResidualAmount == 0)
        {
            if ($scope.TermInMonths == 0)
            {
                return this.TermInMonths;
            }
            return ($scope.TermInMonths - 1);
        }
        else
        {
            return $scope.TermInMonths;
        }
    }





/*RentalPMT, TermInMonths, FrequencyPerPeriod, DelayedPayment, AmountFinanced, ResidualAmount, InAdvanced*/
    $scope.ComputeLesseeRate = function() {
            //AmountFinanced = AmountFinanced * -1; // change to negative

            var _loc_9;
            var _loc_12;
            var _loc_8 = 1;
            var _loc_10 = 0;
            var _loc_11 = 1;
            var _loc_13 = 0;
            var _loc_14 = 0;
            if (isNaN($scope.RentalPMT))
            {
                $scope.LesseeRate = 0;
                return;
            }
            while (_loc_13 < $scope.threshouldIteration)
            {
                
                _loc_9 = (_loc_10 + _loc_11) / 2;
                _loc_12 = $scope.ComputePMT((Math.pow(1 + _loc_9, $scope.FrequencyPerPeriod) - 1), $scope.TermInMonths, $scope.FrequencyPerPeriod, $scope.DelayedPayment, $scope.AmountFinanced * -1, $scope.ResidualAmount, JSON.parse($scope.InAdvanced));
                _loc_14 = _loc_12 - $scope.RentalPMT;
                if (_loc_14 < $scope.thresholdDistance && _loc_14 > -$scope.thresholdDistance)
                {
                    break;
                }
                else if (_loc_14 > 0)
                {
                    _loc_11 = _loc_9;
                }
                else
                {
                    _loc_10 = _loc_9;
                }
                _loc_13 = _loc_13 + 1;
            }
            $scope.LesseeRate = _loc_9 * 12;
            return ;
    };

    $scope.ComputeRentalPMT = function() {
        $scope.RentalPMT = $scope.ComputePMT((Math.pow(1 + $scope.LessorRate / 12, $scope.FrequencyPerPeriod) - 1), $scope.TermInMonths, $scope.FrequencyPerPeriod, $scope.DelayedPayment, -($scope.AmountFinanced + $scope.BrokageAmount), $scope.ResidualAmount, JSON.parse($scope.InAdvanced));
    }

    $scope.ComputePMT = function(param1, TermInMonths, FrequencyPerPeriod, DelayedPayment, AmountFinanced, ResidualAmount, InAdvanced) {
        var _loc_10;
        var _loc_8 = 1;
        if (InAdvanced)
        {
            _loc_8 = 1 + param1;
        }
        var _loc_9 = AmountFinanced * Math.pow(1 + param1, DelayedPayment);
        if (InAdvanced)
        {
            _loc_10 = (_loc_9 + (_loc_9 + ResidualAmount) / (Math.pow(1 + param1, Math.ceil((TermInMonths - DelayedPayment) / FrequencyPerPeriod)) - 1)) * (-param1 / _loc_8);
        }
        else
        {
            _loc_10 = (_loc_9 + (_loc_9 + ResidualAmount) / (Math.pow(1 + param1, Math.floor((TermInMonths - DelayedPayment) / FrequencyPerPeriod)) - 1)) * (-param1 / _loc_8);
        }
        return _loc_10;
    }// end function


    $scope.ComputeAmountFinanced = function() {
            
            // Equipment Loan
            /*if($scope.CalcType == 3){
                $scope.AmountFinanced = $scope.TotalEquipmentCost + $scope.FeesAndChargesFinanced - $scope.TradeIn;
            }
            else
            {
                // Not the formular
                $scope.AmountFinanced = $scope.TotalEquipmentCost + $scope.FeesAndChargesFinanced - $scope.TradeIn;
            }*/


            var AmtFinHireEqupLoanPlusBrokageAmount;
            var LessorRateDiv12;
            var NumberInstallments;
            var BalloonAmount;
            var BalloonPercent;
            if ($scope.CalcType == 1 || $scope.CalcType == 4 || $scope.CalcType == 5)
            {
                $scope.AmountFinanced = Math.round($scope.AssetFinancedLease() * 10000) / 10000;
                return;
            }
            if ($scope.CalcType == 2)
            {
                if ($scope.AmountFinancedHirePurchaseEquipmentLoan() < 0.005)
                {
                    $scope.AmountFinanced =  0;
                    return;
                }
                AmtFinHireEqupLoanPlusBrokageAmount = $scope.AmountFinancedHirePurchaseEquipmentLoan() + $scope.BrokageAmount;
                LessorRateDiv12 = $scope.LessorRate / 12;
                NumberInstallments = $scope.NumberInstallments();
                BalloonAmount = $scope.BalloonAmount();
                BalloonPercent = $scope.BalloonPercent();
                $scope._compoundGSTonCreditCharges = 0;
                $scope._thisRepayment = $scope.ComputePMT((Math.pow(1 + LessorRateDiv12, $scope.FrequencyPerPeriod) - 1), $scope.TermInMonths, $scope.FrequencyPerPeriod, $scope.DelayedPayment, -AmtFinHireEqupLoanPlusBrokageAmount, $scope.ResidualAmount, JSON.parse($scope.InAdvanced));
                $scope._TotalContractValue = $scope._thisRepayment * NumberInstallments + BalloonAmount;
                $scope._CreditCharges = $scope._TotalContractValue - AmtFinHireEqupLoanPlusBrokageAmount;
                $scope._GSTonCreditCharges = $scope._CreditCharges * 0.1 + $scope.BrokageAmount * 0.1;
                $scope._compoundGSTonCreditCharges = $scope._GSTonCreditCharges;
                while ($scope._GSTonCreditCharges > 0.01)
                {
                    
                    AmtFinHireEqupLoanPlusBrokageAmount = $scope._GSTonCreditCharges;
                    BalloonAmount = 0;
                    $scope._scopeRepayment = $scope.ComputePMT((Math.pow(1 + LessorRateDiv12, $scope.FrequencyPerPeriod) - 1), $scope.TermInMonths, $scope.FrequencyPerPeriod, $scope.DelayedPayment, - AmtFinHireEqupLoanPlusBrokageAmount, BalloonAmount, JSON.parse($scope.InAdvanced));
                    $scope._TotalContractValue = $scope._scopeRepayment * NumberInstallments + BalloonAmount;
                    $scope._CreditCharges = $scope._TotalContractValue - AmtFinHireEqupLoanPlusBrokageAmount;
                    $scope._GSTonCreditCharges = $scope._CreditCharges * 0.1;
                    $scope._compoundGSTonCreditCharges = $scope._compoundGSTonCreditCharges + $scope._GSTonCreditCharges;
                }
                $scope.AmountFinanced =  Math.round(($scope.AmountFinancedHirePurchaseEquipmentLoan()+ $scope._compoundGSTonCreditCharges) * 100) / 100 ;
                return;
            }
            else
            {
                $scope.AmountFinanced =  Math.round($scope.AmountFinancedHirePurchaseEquipmentLoan() * 100) / 100;
                return;

            }
    };

    $scope.GSTRentalDuty = function() {
        //return Math.round((this.RentalInAdvanceLease + this.SARentalDuty) * this.GSTPercentRate * 100) / 100; 

        //SARentalDuty in flash version siply returned 0 anyway so removing 

        return Math.round($scope.TotalInstallment() * $scope.GSTPercentRate * 100) / 100;
    }


    $scope.AssetFinancedLease = function() {
        if ($scope.IsAssetACar)
        {
            return $scope.TotalEquipmentCost + $scope.FeesAndChargesFinanced - $scope.ITCLease();
        }
        //return $scope.TotalEquipmentCost + $scope.FeesAndChargesFinanced - $scope.ITC_HPEL; // ORIGINAL, CHANGED BECAUSE ITC_HPEL JUST RETURNED GST_HPEL
        return $scope.TotalEquipmentCost + $scope.FeesAndChargesFinanced - $scope.GST_HPEL();
        
    }

    $scope.ITCLease = function() {
        if ($scope.CarLuxuryTaxValue() > $scope.LCTCarLimit)
        {
            return $scope.MaxITCOnLease();
        }
        return $scope.CarGST();
    }

    $scope.MaxITCOnLease = function() {
        //return Math.round(this.LCTCarLimit / this.GSTHireLoanNum * 100) / 100;
        return Math.round($scope.LCTCarLimit / $scope.GSTreciprocal * 100) / 100;
    }


    $scope.TotalInstallment = function() {

        return $scope.RegularPaymentOverride;
    }


    $scope.TotalAmountFinanced = function() {

        return this.AmountFinanced + this.BrokageAmount;
    }

    $scope.ProjectionCalculate = function() { 
        //this.IsCalculating = true;
        //this.UpdateSeasonalPaymentsButtons();
        $scope.loanProjection = new LoanProjections();
        //previously UpdateSeasonalPaymentsButtons(); in flash app
        $scope.loanProjection.Initialise($scope.DDate, $scope.TotalAmountFinanced(), $scope.RegularPaymentOverride, $scope.FrequencyPerPeriod, $scope.LessorRate / 12, $scope.TermInMonths, JSON.parse($scope.InAdvanced), $scope.ResidualAmount, $scope.AddPayments, !$scope.IsSeasonal ? (null) : ($scope.Seasonal), $scope.DelayedPayment);
        $scope.loanProjection.Calculate();
        $scope.IsIrregular = $scope.loanProjection.IsIrregular;
        $scope.NumberInstallmentsFromSchedule = $scope.loanProjection.NumberOfInstallments;
        //
        

        $scope.loanProjection.Initialise($scope.DDate, $scope.TotalAmountFinanced(), $scope.RegularPaymentOverride, $scope.FrequencyPerPeriod, $scope.LessorRate / 12, $scope.TermInMonths, JSON.parse($scope.InAdvanced), $scope.ResidualAmount, $scope.AddPayments, !$scope.IsSeasonal ? (null) : ($scope.Seasonal), $scope.DelayedPayment);
        $scope.loanProjection.Calculate();
        $scope.RegularPaymentOverride = $scope.loanProjection.ScheduledPaymentPerFreq;
        
        $scope.loanProjectionLesse = new LoanProjections();
        $scope.loanProjectionLesse.Initialise($scope.DDate, $scope.AmountFinanced, $scope.RegularPaymentOverride, $scope.FrequencyPerPeriod, $scope.LessorRate / 12, $scope.TermInMonths, JSON.parse($scope.InAdvanced), $scope.ResidualAmount, $scope.AddPayments, !$scope.IsSeasonal ? (null) : ($scope.Seasonal), $scope.DelayedPayment);
        if ($scope.BrokageAmount > 0.01)
        {
            $scope.loanProjectionLesse.CalculateByInterest();
        }
        else
        {
            $scope.loanProjectionLesse.Calculate();
        }
        $scope.IsIrregular = $scope.loanProjectionLesse.IsIrregular;
        $scope.LesseeRateOverride = $scope.loanProjectionLesse.InterestRatePerPeriod * 12;
        $scope.TotalAmountInterestFromSchedule = $scope.loanProjectionLesse.TotalInterests();
        $scope.TotalAmountRepaymentsFromSchedule = $scope.loanProjectionLesse.TotalRepayments();
        $scope.NumberInstallmentsFromSchedule = $scope.loanProjectionLesse.NumberOfInstallments();

        //console.log('NumberInstallmentsFromSchedule :' + $scope.NumberInstallmentsFromSchedule);
        //this.IsCalculating = false;
        /*this.RemapTable();
        this.SendDataXML();
        if (this.taLog != null)
        {
            this.taLog.text = this._logger.log;
        }*/

        $scope.jsonOut = $scope.CreateSaveObject();
        //console.log($scope.jsonOut);
        //var x2js = new X2JS();
        //$scope.xmlOut = x2js.json2xml_str($scope.jsonOut);

        var xotree = new XML.ObjTree();
        //var myjson = eval('(' + JSON.stringify($scope.jsonOut) + ')');
        $scope.xmlOut = xotree.writeXML($scope.jsonOut);

        //console.log($scope.xmlOut);

        return;
    }



    
    
    /*$scope.ComputeFromYears = function() {
        $scope.InAdvanced = $scope.NumberOfYearsToPay * 12;
        
        $scope.ComputeAmortizationFactor();
    };*/
    
    /*
    $scope.ComputeFromMonths = function() {
         $scope.ComputeYears();
         
         $scope.ComputeAmortizationFactor();
    };
    
    $scope.ComputeFromFrequencyPerPeriod = function() {
        $scope.ComputeAmortizationFactor();        
    };
    
    
    
    $scope.ComputeDownPaymentPercent = function() {
        $scope.DownPaymentPercent = $scope.DownPayment / $scope.AmountFinanced;                        
    };
    
    $scope.ComputeInstallmentPrincipal = function() {        
        $scope.InstallmentPrincipal = $scope.AmountFinanced - $scope.DownPayment;
    };    
        
    
    $scope.ComputeFromDownPayment = function() {
        $scope.ComputeDownPaymentPercent();
        $scope.ComputeInstallmentPrincipal();
        
        
        if ($scope.DeterminePaymentTerms) {
            $scope.ComputeFromAmortizationAmount();
        }
        else {        
            $scope.ComputeAmortizationFactor();
        }
    };
    
    
    $scope.ComputeDownPayment = function() {
        $scope.DownPayment = $scope.DownPaymentPercent * $scope.AmountFinanced;        
    }
    
    $scope.ComputeFromDownPaymentPercent = function() {
        $scope.ComputeDownPayment();
        $scope.ComputeInstallmentPrincipal();
        
        $scope.ComputeAmortizationFactor();
    };
    

    
    $scope.ComputeFromInstallmentPrincipal = function() {
        $scope.DownPayment = $scope.AmountFinanced - $scope.InstallmentPrincipal;
        $scope.ComputeDownPaymentPercent();
        
        
        $scope.ComputeAmortizationFactor();        
    };
    
    */
    /*$scope.ComputeAmortizationFactor = function() {
        
        $scope.DDate = new Date($scope.DDateText);
        
        var pir = $scope.PeriodicInterestRate = $scope.LesseeRate / (12 / $scope.FrequencyPerPeriod);
        
        
        if ($scope.FrequencyPerPeriod == 0) {
            $scope.AmortizationFactor = 0;
            return;
        }
            
        
        
        var compoundTerms = $scope.NumberInstallments();  /// $scope.FrequencyPerPeriod;
        
        var amortizationFactor = 0;
        
        if (compoundTerms == 0) {
            $scope.AmortizationFactor = 0;
            return;
        }
    
        if ($scope.NumberInstallments()  > 0) {
            if ($scope.LesseeRate > 0) {
                $scope.AmortizationFactor = pir / (1 - (1 / Math.pow( 1 + pir, compoundTerms ) ) ); 
            }
            // 0% interest
            else {
                $scope.AmortizationFactor = 1 / compoundTerms;
            }
        }
        else {
            // nothing, $scope is handled by compoundTerms == 0
        }
        
        $scope.AmortizationFactor = $scope.round( $scope.AmortizationFactor, 10);
        
        if ($scope.DeterminePaymentTerms) {
            // AmortizationAmount is based on Budget
        }
        else {
            
            $scope.AmortizationAmount = $scope.AmortizationFactor * $scope.InstallmentPrincipal;
            $scope.TotalInstallment = $scope.AmortizationFactor * $scope.InstallmentPrincipal;
            console.log('$scope.AmortizationAmount : ' + $scope.AmortizationAmount);
            console.log('$scope.TotalInstallment : ' + $scope.TotalInstallment);
        }
        
        $scope.CreateAmortizationSchedule();
    };*/
    
    /*
    $scope.ComputeFromLesseeRate = function() {
        $scope.ComputeAmortizationFactor();
    };
    
    
    $scope.FirstInterest = function() {
        return Math.ceil($scope.PeriodicInterestRate * $scope.InstallmentPrincipal);
    };
    
    $scope.IsBudgetLessThanTheFirstInterest = function() {
        return $scope.Budget <= $scope.FirstInterest();
    };
    
    
    $scope.ComputeFromAmortizationAmount = function() {
    
        // http://oakroadsystems.com/math/loan.htm#LoanNumber        
        // N = −log(1−iA/P) / log(1+i)
        
        
        var interest = $scope.FirstInterest();
                
        if ($scope.Budget <= interest) {
            return;
        }
        
        
        
        var n = (-Math.log(1 - $scope.PeriodicInterestRate * $scope.InstallmentPrincipal / $scope.Budget))  / Math.log(1 + $scope.PeriodicInterestRate);
            
        
            
        if (!isNaN(n) && n > 0) {        
            $scope.AmortizationAmount = $scope.Budget;
            //$scope.NumberInstallments  = Math.ceil(n);        
            $scope.ComputeYears();
            $scope.CreateAmortizationSchedule();            
        }
        
    };*/
    
    
    $scope.EvaluatePaymentTerms = function() {
        // based on budget
        if ($scope.DeterminePaymentTerms == true) {
            $scope.Budget = 0;
            $scope.ComputeFromAmortizationAmount();
        }
        else {
            $scope.ComputeFromInstallmentPrincipal();
        }
    };
    
    
    $scope.AddAdvancedPayment = function() {
        $scope.AdvancedPayments.push({MonthNumber: null, Payment: null});
    };
    
    $scope.RemoveAdvancedPayment = function(index) {
        $scope.AdvancedPayments.splice(index,1);
        $scope.CreateAmortizationSchedule();
    };
    
    /*$scope.CreateAmortizationSchedule = function() {
        
        var amort = $scope.Amortizations = [];
        
        
        var pir = $scope.PeriodicInterestRate;        
        var ma = $scope.AmortizationAmount;
        
        var prevBalance = $scope.InstallmentPrincipal;

        amort.push({
                MonthNumber : 0, 
                AmortizationDate : null,
                Interest : null, 
                Principal : null, 
                Amortization : null, 
                AdvancedPayment : null,
                PrincipalBalance : prevBalance});
        

        
        var i = 0;
        while (Math.floor(prevBalance) > 0) {
            var interest = pir * prevBalance;
            var principal = ma - interest;
            
            if (principal > prevBalance) {
                principal = prevBalance;
            }
            
            
            var amortization = interest + principal;
            var advancedPayment = 0;
            
            var advancedPaymentFilter = $scope.AdvancedPayments.filter(function(pay) {                 
                return pay.MonthNumber-1 == i;
            });
            
            if (advancedPaymentFilter.length == 1) {
                advancedPayment = advancedPaymentFilter[0].Payment;
            }
            
            prevBalance = prevBalance - principal - advancedPayment;
            
            
            var startDate = $scope.DDate;
            var nthMonthFromStartDate = new Date(new Date(startDate).setMonth(startDate.getMonth()+i));
                        
            i += parseInt($scope.FrequencyPerPeriod);
            amort.push({
                MonthNumber : i, 
                AmortizationDate : nthMonthFromStartDate,
                Interest : interest, 
                Principal : principal, 
                Amortization : amortization, 
                AdvancedPayment : advancedPayment,
                PrincipalBalance : prevBalance});
        }
        

        $scope.TotalAmountInterest = 
            parseFloat(amort
            .map(function(a) { return a.Interest; })
            .reduce(function(prev,current) { return prev + current; }));

            
        $scope.TotalAmountRepayments = 
            amort
            .map(function(a) { return a.Amortization })
            .reduce(function(prev,current) { return prev + current; });

        
        $scope.TotalInterest = 
            amort
            .map(function(a) { return a.Interest; })
            .reduce(function(prev,current) { return prev + current; });

            
        $scope.TotalPrincipal = 
            amort
            .map(function(a) { return a.Principal; })
            .reduce(function(prev,current) { return prev + current; });
            
        $scope.TotalAmortization = 
            amort
            .map(function(a) { return a.Amortization })
            .reduce(function(prev,current) { return prev + current; });
    };*/
    
    $scope.round = function(number,X) {
        // rounds number to X decimal places, defaults to 2
        X = (!X ? 2 : X);
        return Math.round(number*Math.pow(10,X))/Math.pow(10,X);
    }
    
            
    //$scope.ComputeFromDownPaymentPercent();
    //$scope.ComputeFromYears();
    //$scope.ComputeAmortizationFactor();  
    $scope.ComputeFromAmountFinanced();
    $scope.TypeChanged();


      var i = document.createElement("input");
      i.setAttribute("type", "date");
      if (i.type == "text") {
        $scope.dateformat = ' (YYYY-MM-DD)';
        $scope.dateformatcopy = $scope.dateformat ;

        // No native date picker support :(
        // Use Dojo/jQueryUI/YUI/Closure to create one,
        // then dynamically replace that <input> element.
      }
        //var dataElement = angular.element(document.querySelector('#CBA_CALC')).scope();
        
        
    
}]);