var myApp = angular.module('RealEstateApp', []);

Date.prototype.yyyymmdd = function() {         
    
    var yyyy = this.getFullYear().toString();                                    
    var mm = (this.getMonth()+1).toString(); // getMonth() is zero-based         
    var dd  = this.getDate().toString();             
    
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
    $scope.InAdvanced = 1;
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
    $scope.BalloonAmount = 0; 
    $scope.BalloonPercent = 0; 
    $scope.AmountFinanced = 0; 

    //Summary 
    $scope.TotalAmountFinanced = 0;
    $scope.TermInMonthsInstallment = 0;


    //hidden stuff from XML- Luke 
    $scope.FrequencyPerPeriod = 0;
    $scope.FrequencyPerYear =  0;



    //$scope.AmountFinanced = 4000000;
    $scope.DownPaymentPercent = .0; 
    $scope.DownPayment = 0;
    $scope.InstallmentPrincipal = 0;
    
    $scope.TotalInterest = 0;
    $scope.TotalPrincipal = 0;
    $scope.TotalAmortization = 0;
    
    
    
    $scope.NumberOfYearsToPay = 5;
    $scope.NumberOfMonthsToPay = 0;
    $scope.PaymentModeInMonths = 1; // monthly
    


    $scope.InterestRatePerAnnum = 0.21;
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
    
    $scope.ComputeYears = function() {
        $scope.NumberOfYearsToPay = $scope.NumberOfMonthsToPay / 12;
    }
    
    $scope.ComputeFromAmountFinanced = function() {
        $scope.ComputeTermInMonthsInstallment();
        $scope.ComputeDetailCosts();
        $scope.ComputeAmountFinanced(); //Needs to be after ComputeDetailCosts();
        $scope.ComputeTotalAmountFinanced();
        

        $scope.ComputeDownPayment();
        $scope.ComputeInstallmentPrincipal();
        $scope.ComputeAmortizationFactor();

    }

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


    $scope.ComputeDetailCosts = function() {


        $scope.EquipmentCostExclRego = $scope.EquipmentCost + $scope.Options + $scope.SupplierDelivery - $scope.SupplierDiscount;

        $scope.TotalEquipmentCost = $scope.EquipmentCost + $scope.MVRegoCost + $scope.Options
                                    + $scope.SupplierDelivery - $scope.SupplierDiscount ;



    };


    $scope.ComputeTermInMonthsInstallment = function() {
            
            // Equipment Loan
            
            if($scope.CalcType == 3){
                console.log('ComputeTermInMonthsInstallment $scope.CalcType :' + $scope.CalcType )
                $scope.TermInMonthsInstallment = $scope.TermInMonths;
            }
    };

    $scope.ComputeAmountFinanced = function() {
            
            // Equipment Loan
            if($scope.CalcType == 3){
                $scope.AmountFinanced = $scope.TotalEquipmentCost + $scope.FeesAndChargesFinanced - $scope.TradeIn;
            }
    };

    $scope.ComputeTotalAmountFinanced = function() {
            
            // Equipment Loan
            if($scope.CalcType == 3){
                $scope.TotalAmountFinanced = $scope.AmountFinanced;
            }
    };
    
    
    $scope.ComputeFromYears = function() {
        $scope.NumberOfMonthsToPay = $scope.NumberOfYearsToPay * 12;
        
        $scope.ComputeAmortizationFactor();
    };
    
    $scope.ComputeFromMonths = function() {
         $scope.ComputeYears();
         
         $scope.ComputeAmortizationFactor();
    };
    
    $scope.ComputeFromPaymentModeInMonths = function() {
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
        
        var pir = $scope.PeriodicInterestRate = $scope.InterestRatePerAnnum / (12 / $scope.PaymentModeInMonths);
        
        
        if ($scope.PaymentModeInMonths == 0) {
            $scope.AmortizationFactor = 0;
            return;
        }
            
        
        
        var compoundTerms = $scope.NumberOfMonthsToPay / $scope.PaymentModeInMonths;
        
        var amortizationFactor = 0;
        
        if (compoundTerms == 0) {
            $scope.AmortizationFactor = 0;
            return;
        }
    
        if ($scope.NumberOfMonthsToPay > 0) {
            if ($scope.InterestRatePerAnnum > 0) {
                $scope.AmortizationFactor = pir / (1 - (1 / Math.pow( 1 + pir, compoundTerms ) ) ); 
            }
            // 0% interest
            else {
                $scope.AmortizationFactor = 1 / compoundTerms;
            }
        }
        else {
            // nothing, this is handled by compoundTerms == 0
        }
        
        $scope.AmortizationFactor = $scope.round( $scope.AmortizationFactor, 10);
        
        if ($scope.DeterminePaymentTerms) {
            // AmortizationAmount is based on Budget
        }
        else {
            $scope.AmortizationAmount = $scope.AmortizationFactor * $scope.InstallmentPrincipal;
        }
        
        $scope.CreateAmortizationSchedule();
    };
    
    
    $scope.ComputeFromInterestRatePerAnnum = function() {
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
            $scope.NumberOfMonthsToPay = Math.ceil(n);        
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
                        
            i += parseInt($scope.PaymentModeInMonths);
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
    $scope.ComputeFromYears();
    $scope.ComputeAmortizationFactor();  
    $scope.ComputeFromAmountFinanced();

    
}]);