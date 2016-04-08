var myApp = angular.module('testerApp', []);

		myApp.controller('testerController',['$scope', function($scope) {

		$scope.l = new LoanProjection();

		$scope.l.OpeningBalanceRounded = 6788;
		$scope.l.PrincipalRounded = 567.998889;

		console.log($scope.l.ClosingBalanceRounded());

		$scope.loanProjection = new LoanProjections();

		var addstuff = [{"AdditionalPayment":0}, {"AdditionalPayment":9},{"AdditionalPayment":78}];

		$scope.loanProjection.Initialise(Date(), 9800, 0, 1, .07 / 12, 48, false, 0, addstuff, null, 0);

            /*this.loanProjection.Initialise(this.model.DDate, this.model.TotalAmountFinanced, this.model.RegularPaymentOverride, this.model.FrequencyPerPeriod, this.model.LessorRate / 12, this.model.TermInMonths, this.model.InAdvanced, this.model.ResidualAmount, this.TableLessee, !this.model.IsSeasonal ? (null) : (this.Seasonal), this.model.DelayedPayment);*/

            /*public function Initialise(param1:Date, param2:Number, param3:Number, param4:Number, param5:Number, param6:Number, param7:Boolean, param8:Number, param9:ArrayCollection, param10:ArrayCollection, param11:Number) : void*/
   	$scope.loanProjection.Calculate();
		$scope.RegularPaymentOverride = $scope.loanProjection.ScheduledPaymentPerFreq;

		console.log('loanProjection : ');
		console.log('IsIrregular : ' + $scope.loanProjection.IsIrregular);
    console.log('InterestRatePerPeriod : ' + $scope.loanProjection.InterestRatePerPeriod * 12);
    console.log('TotalInterests : ' + $scope.loanProjection.TotalInterests());
    console.log('TotalRepayments : ' + $scope.loanProjection.TotalRepayments());
    console.log('NumberOfInstallments : ' + $scope.loanProjection.NumberOfInstallments());

		console.log('RegularPaymentOverride : ' + $scope.loanProjection.ScheduledPaymentPerFreq);


   	console.log('loanProjections : ' + $scope.loanProjection.loanProjections);

   	$scope.loanProjectionLesse = new LoanProjections();
   	$scope.loanProjectionLesse.Initialise(Date(), 9800, $scope.RegularPaymentOverride, 1, .07 / 12, 48, false, 0, addstuff, null, 0);

		$scope.BrokageAmount = 1000;

		if ($scope.BrokageAmount > 0.01)
    {
        $scope.loanProjectionLesse.CalculateByInterest();
    }
    else
    {
        $scope.loanProjectionLesse.Calculate();
    }

    console.log('loanProjectionLesse: ');
    console.log('IsIrregular : ' + $scope.loanProjectionLesse.IsIrregular);
    console.log('InterestRatePerPeriod : ' + $scope.loanProjectionLesse.InterestRatePerPeriod * 12);
    console.log('TotalInterests : ' + $scope.loanProjectionLesse.TotalInterests());
    console.log('TotalRepayments : ' + $scope.loanProjectionLesse.TotalRepayments());
    console.log('NumberOfInstallments : ' + $scope.loanProjectionLesse.NumberOfInstallments());


   }]);