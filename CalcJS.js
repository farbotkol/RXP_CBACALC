var myApp = angular.module('RealEstateApp', []);

Date.prototype.yyyymmdd = function() {         
    
    var yyyy = $scope.getFullYear().toString();                                    
    var mm = ($scope.getMonth()+1).toString(); // getMonth() is zero-based         
    var dd  = $scope.getDate().toString();             
    
    return yyyy + '-' + (mm[1]?mm:"0"+mm[0]) + '-' + (dd[1]?dd:"0"+dd[0]);
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
    
    // Month number, amortization date, interest, principal, principal balance
    $scope.Amortizations = [];
    
    $scope.CalcTypeName = 'Equipment Loan';
    $scope.CalcType = 3;
    
    //Details 
    $scope.InAdvanced = 'false';
    $scope.Frequency = 'Monthly';
    $scope.DDate = new Date('Feb 28, 2013');
    $scope.DDateText = $scope.DDate.yyyymmdd();
    $scope.AssetType =  'All Other Assets';
    $scope.EquipmentCost = 10000;
    $scope.TradeIn = 1000;
    $scope.MVRegoCost = 100;
    $scope.Options = 200;
    $scope.SupplierDelivery = 300;
    $scope.SupplierDiscount = 500;
    $scope.FeesAndChargesFinanced = 2;
    $scope.EquipmentCostExclRego = 0;
    $scope.TotalEquipmentCost = 0;
    $scope.LessorRate = 0.07;
    $scope.TermInMonths = 48;

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


    $scope.NumberInstallments = 0 ;
    $scope.MortgageDuty = 0;
    $scope.LesseeRate = 0; 

    //$scope.GST = 0;
    $scope.LCT = 0;
    $scope.ITC = 0;
      
    //hidden stuff from XML- Luke 
    $scope.FrequencyPerPeriod = 0;
    $scope.FrequencyPerYear =  0;
    $scope.RentalPMT = 0;
    $scope.DelayedPayment = 0;



    //CBACalculatorFacts salesforce config settings
    $scope.LCTLimit = 75375;// Doesnt seem to be used
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
    $scope.NumberInstallments  = 0;
    $scope.FrequencyPerPeriod = 1; // monthly
    


    $scope.LesseeRate = 0.21;
    $scope.PeriodicInterestRate = 0;
    $scope.AmortizationFactor = 0;
    $scope.AmortizationAmount = 0;

    
    // determine payment terms based on budget
    $scope.DeterminePaymentTerms = false; 
    $scope.Budget = 0;
    
    
    $scope.AdvancedPayments = [
        { MonthNumber: null, Payment: null }
    ];
    
    
    // ------- CONTROLLER's ACTIONS -----------
    
    /*$scope.ComputeYears = function() {
        $scope.NumberOfYearsToPay = $scope.InAdvanced / 12;
    }*/
    
    $scope.ComputeFromAmountFinanced = function() {
        $scope.ComputeTermInMonthsInstallment();
        $scope.ComputeDetailCosts();
        $scope.ComputeAmountFinanced(); //Needs to be after ComputeDetailCosts();
        $scope.ComputeTotalAmountFinanced();
        $scope.ComputeRentalPMT();
        $scope.ComputeLesseeRate();

        

        $scope.ComputeMorgageDuty (); // must be after the amount is calculated
        

        $scope.ComputeDownPayment();
        $scope.ComputeInstallmentPrincipal();
        $scope.ComputeAmortizationFactor();

    }

    /*$scope.InAdvanceChanged = function() {
        $scope.InAdvanced =  Boolean($scope.InAdvanced);

        $scope.ComputeFromAmountFinanced();
    }*/

     $scope.TypeChanged = function() {
        

        $scope.CalcType =  parseInt($scope.CalcType);


        switch ($scope.CalcType) {
          case 1:
            $scope.CalcTypeName  = 'Finance Lease';
            break;
          case 2:
            $scope.CalcTypeName  = 'Hire Purchase';
            break;
          case 3:
            $scope.CalcTypeName  = 'Equipment Loan';
            break;
          case 4:
            $scope.CalcTypeName  = 'Novated Lease';
            break;
          case 5:
            $scope.CalcTypeName  = 'Protected Lease';
            break;
          default:
            $scope.CalcTypeName  = '';
            break;
        }

         $scope.ComputeFromAmountFinanced();

         $scope.CalculateBrokagePercent();
         $scope.CalculateResidualPercent();
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
        if ($scope.CalcType == 1 || $scope.CalcType == 4)
        {
            return $scope.ResidualAmount + $scope.GSTOnResidual;
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
        if ($scope.CalcType == 2)
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
        if ($scope.CalcType == 2)
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
        if ($scope.CalcType == 1 || $scope.CalcType == 4)
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
        if ($scope.CalcType == 1 || $scope.CalcType == 4)
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
        if ($scope.CalcType == 1 || $scope.CalcType == 4)
        {
            return $scope.TotalEquipmentCost + $scope.FeesAndChargesFinanced;
        }
        return $scope.TotalEquipmentCost + $scope.FeesAndChargesFinanced - $scope.TradeIn;
    }


    $scope.ComputeTermInMonthsInstallment = function() {
            
            // Equipment Loan
            
            if($scope.CalcType == 3){
                console.log('ComputeTermInMonthsInstallment $scope.CalcType :' + $scope.CalcType )
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
            $scope.NumberInstallments = $scope.TermInMonthsInstallment / $scope.FrequencyPerPeriod;
            console.log('$scope.NumberInstallments: ' + $scope.NumberInstallments);
    };



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
            if($scope.CalcType == 3){
                $scope.AmountFinanced = $scope.TotalEquipmentCost + $scope.FeesAndChargesFinanced - $scope.TradeIn;
            }
            else
            {
                // Not the formular
                $scope.AmountFinanced = $scope.TotalEquipmentCost + $scope.FeesAndChargesFinanced - $scope.TradeIn;
            }


            /*var AmtFinHireEqupLoanPlusBrokageAmount;
            var LessorRateDiv12;
            var NumberInstallments;
            var BalloonAmount;
            var BalloonPercent;
            if ($scope._CalcType == 1 || $scope.CalcType == 4)
            {
                $scope.AmountFinanced = Math.round($scope.AssetFinancedLease * 10000) / 10000;
                return;
            }
            if ($scope._CalcType == 2)
            {
                if ($scope.AmountFinancedHirePurchaseEquipmentLoan < 0.005)
                {
                    $scope.AmountFinanced =  0;
                    return;
                }
                AmtFinHireEqupLoanPlusBrokageAmount = $scope.AmountFinancedHirePurchaseEquipmentLoan + $scope.BrokageAmount;
                LessorRateDiv12 = $scope.LessorRate / 12;
                NumberInstallments = $scope.NumberInstallments;
                BalloonAmount = $scope.BalloonAmount;
                BalloonPercent = $scope.BalloonPercent;
                $scope._compoundGSTonCreditCharges = 0;
                $scope._$scopeRepayment = GetPMT((Math.pow(1 + LessorRateDiv12, $scope.FrequencyPerPeriod) - 1), $scope.TermInMonths, $scope.FrequencyPerPeriod, $scope.DelayedPayment, -AmtFinHireEqupLoanPlusBrokageAmount, $scope.ResidualAmount, $scope.InAdvanced);
                $scope._TotalContractValue = $scope._$scopeRepayment * NumberInstallments + BalloonAmount;
                $scope._CreditCharges = $scope._TotalContractValue - AmtFinHireEqupLoanPlusBrokageAmount;
                $scope._GSTonCreditCharges = $scope._CreditCharges * 0.1 + $scope.BrokageAmount * 0.1;
                $scope._compoundGSTonCreditCharges = $scope._GSTonCreditCharges;
                while ($scope._GSTonCreditCharges > 0.01)
                {
                    
                    AmtFinHireEqupLoanPlusBrokageAmount = $scope._GSTonCreditCharges;
                    BalloonAmount = 0;
                    $scope._$scopeRepayment = GetPMT((Math.pow(1 + LessorRateDiv12, $scope.FrequencyPerPeriod) - 1), $scope.TermInMonths, $scope.FrequencyPerPeriod, $scope.DelayedPayment, - AmtFinHireEqupLoanPlusBrokageAmount, BalloonAmount, $scope.InAdvanced);
                    $scope._TotalContractValue = $scope._$scopeRepayment * NumberInstallments + BalloonAmount;
                    $scope._CreditCharges = $scope._TotalContractValue - AmtFinHireEqupLoanPlusBrokageAmount;
                    $scope._GSTonCreditCharges = $scope._CreditCharges * 0.1;
                    $scope._compoundGSTonCreditCharges = $scope._compoundGSTonCreditCharges + $scope._GSTonCreditCharges;
                }
                $scope.AmountFinanced =  Math.round($scope.AmountFinancedHirePurchaseEquipmentLoan * 100) / 100 + $scope._compoundGSTonCreditCharges;
                return;
            }
            else
            {
                $scope.AmountFinanced =  Math.round($scope.AmountFinancedHirePurchaseEquipmentLoan * 100) / 100;
                return;

            }*/
    };

    $scope.ComputeTotalAmountFinanced = function() {
            
            // Equipment Loan
            if($scope.CalcType == 3){
                $scope.TotalAmountFinanced = $scope.AmountFinanced;
            }
    };
    
    
    /*$scope.ComputeFromYears = function() {
        $scope.InAdvanced = $scope.NumberOfYearsToPay * 12;
        
        $scope.ComputeAmortizationFactor();
    };*/
    
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
    
    
    $scope.ComputeAmortizationFactor = function() {
        
        $scope.DDate = new Date($scope.DDateText);
        
        var pir = $scope.PeriodicInterestRate = $scope.LesseeRate / (12 / $scope.FrequencyPerPeriod);
        
        
        if ($scope.FrequencyPerPeriod == 0) {
            $scope.AmortizationFactor = 0;
            return;
        }
            
        
        
        var compoundTerms = $scope.NumberInstallments  /// $scope.FrequencyPerPeriod;
        
        var amortizationFactor = 0;
        
        if (compoundTerms == 0) {
            $scope.AmortizationFactor = 0;
            return;
        }
    
        if ($scope.NumberInstallments  > 0) {
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
    };
    
    
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
        
        
        
        var n = (-Math.log(1 - $scope.PeriodicInterestRate * $scope.InstallmentPrincipal / $scope.Budget)) 
                / Math.log(1 + $scope.PeriodicInterestRate);
            
        
            
        if (!isNaN(n) && n > 0) {        
            $scope.AmortizationAmount = $scope.Budget;
            $scope.NumberInstallments  = Math.ceil(n);        
            $scope.ComputeYears();
            $scope.CreateAmortizationSchedule();            
        }
        
    };
    
    
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
    
    $scope.CreateAmortizationSchedule = function() {
        
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
    };
    
    $scope.round = function(number,X) {
        // rounds number to X decimal places, defaults to 2
        X = (!X ? 2 : X);
        return Math.round(number*Math.pow(10,X))/Math.pow(10,X);
    }
    
            
    $scope.ComputeFromDownPaymentPercent();
    //$scope.ComputeFromYears();
    $scope.ComputeAmortizationFactor();  
    $scope.ComputeFromAmountFinanced();

    
}]);