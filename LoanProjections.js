 var  LoanProjections = function(){ 
  
	var self = this;

	var Seasonal;
    var AdditionalPayments;
    var EndPayment = 0;
    var InAdvanced = true;
    var InterestRatePerPeriod = 0;
    var ScheduledPaymentFrequencyPerPeriod = 1;
    var IsIrregular = false;
    var ScheduledPaymentPerFreq = 0;
    var loanProjections;
    var numOfDelayedMonth;
    var IsOutstanding = false;
    var SpecificPaymentLabel = "Monthly";


    self.Initialise = function(pDDate, pTotalAmountFinanced, pRegularPaymentOverride, pFrequencyPerPeriod, pLessorRateDiv12, pTermInMonths, pInAdvanced, pResidualAmount, pTableLessee, pSeasonal, pDelayedPayment){
        var SeasonalLength = 0;
        if (isNaN(pTermInMonths))
        {
            pTermInMonths = 1;
        }
        pTermInMonths = pTermInMonths + 1;
        this.loanProjections = new Array(pTermInMonths);
        this.InterestRatePerPeriod = pLessorRateDiv12;
        this.ScheduledPaymentPerFreq = pRegularPaymentOverride;
        this.ScheduledPaymentFrequencyPerPeriod = pFrequencyPerPeriod;
        this.InAdvanced = pInAdvanced;
        this.EndPayment = pResidualAmount;
        this.AdditionalPayments = pTableLessee;
        this.Seasonal = pSeasonal;
        if (this.Seasonal != null)
        {
            SeasonalLength = this.Seasonal.length;
            while (SeasonalLength < 12)
            {
                
                this.Seasonal.addItem(false);
                SeasonalLength++;
            }
        }
        this.numOfDelayedMonth = pDelayedPayment;
        if (pTermInMonths < 1)
        {
            return;
        }
        this.loanProjections[0] = new LoanProjection();
        this.loanProjections[0].DDate = pDDate;
        this.loanProjections[0].OpeningBalance = pTotalAmountFinanced;
        this.loanProjections[0].Term = 0;
        return;
    }



    self.Calculate = function(){
        this.IsOutstanding = false;
        if (this.loanProjections == null)
        {
            return;
        }
        //var loanProjection1:LoanProjection = null;
        var loanProjection_loc_2 = new LoanProjection()// = null;
        var _loc_3 = 0;
        var _loc_4 = -1;
        var _loc_5 = 0;
        var _loc_6 = this.loanProjections[0].OpeningBalance;
        var _loc_7 = 0;
        while (_loc_5 < _loc_6)
        {
            
            _loc_7 = _loc_5 + (_loc_6 - _loc_5) * 0.5;
            this.ScheduledPaymentPerFreq = _loc_7;
            _loc_4 = this.CalculateProjectionByPayment();
            if (Math.abs(_loc_4) < 0.01)
            {
                break;
            }
            if (_loc_4 > 0)
            {
                _loc_5 = _loc_7 + 1e-006;
                continue;
            }
            _loc_6 = _loc_7 - 1e-006;
        }
        this.CalculateRounded();
        return;
    }



    self.CalculateProjectionByPayment = function(){
        var _loc_5 = NaN;
        var _loc_6 = false;
        if (this.loanProjections == null)
        {
            return 0;
        }
        var _loc_1 = null; //LoanProjection
        var _loc_2 = null; //LoanProjection
        var _loc_3 = 0; // loop index it seems
        var _loc_4 = 0; // type date
        if (this.loanProjections.length > 0)
        {
            _loc_4 = this.loanProjections[0].DDate.date;
        }
        _loc_3 = 0;
        while (_loc_3 < this.loanProjections.length)
        {
            
            if (this.loanProjections[_loc_3] == null)
            {
                this.loanProjections[_loc_3] = new LoanProjection();
            }
            _loc_1 = this.loanProjections[_loc_3];
            if (_loc_3 > 0)
            {
                _loc_2 = this.loanProjections[(_loc_3 - 1)];
                _loc_1.DDate = new Date(_loc_2.DDate);
                (_loc_1.DDate.month + 1);
                _loc_1.DDate.date = _loc_4;
                if ((_loc_2.DDate.month + 1) % 12 != _loc_1.DDate.month)
                {
                    _loc_1.DDate.date = 1;
                    _loc_1.DDate.hours = _loc_1.DDate.hours - 24;
                }
                _loc_1.OpeningBalance = _loc_2.ClosingBalance;
            }
            _loc_1.Term = _loc_3;
            if (_loc_3 == 0)
            {
                _loc_1.InterestAmount = 0;
            }
            else
            {
                _loc_1.InterestAmount = this.InterestRatePerPeriod * _loc_1.OpeningBalance;
            }
            _loc_5 = _loc_1.OpeningBalance + _loc_1.InterestAmount;
            _loc_1.Payment = 0;
            _loc_1.AutoAdditionalPayment = 0;
            _loc_1.AdditionalPayment = 0;
            if ((_loc_3 + 1) >= this.loanProjections.length)
            {
                _loc_1.AutoAdditionalPayment = this.EndPayment;
            }
            _loc_5 = Math.max(0, _loc_5 - _loc_1.AutoAdditionalPayment);
            // ALTERED LAST CONDITION FROM 'IS NUMBER' TO !ISNAN  
            if (this.AdditionalPayments != null && this.AdditionalPayments.length > _loc_3 && this.AdditionalPayments[_loc_3] != null && !isNaN(this.AdditionalPayments[_loc_3].AdditionalPayment))
            {
                if (isNaN(this.AdditionalPayments[_loc_3].AdditionalPayment))
                {
                    _loc_1.AdditionalPayment = 0;
                }
                else
                {
                    _loc_1.AdditionalPayment = this.AdditionalPayments[_loc_3].AdditionalPayment;
                }
            }
            _loc_5 = Math.max(0, _loc_5 - _loc_1.AdditionalPayment);
            _loc_1.Payment = 0;
            _loc_6 = _loc_3 % this.ScheduledPaymentFrequencyPerPeriod == 0;
            if (this.Seasonal != null)
            {
                _loc_6 = this.Seasonal[_loc_1.DDate.month];
            }
            _loc_6 = _loc_6 && (_loc_3 != 0 || this.InAdvanced) && (!this.InAdvanced || _loc_3 != (this.loanProjections.length - 1));
            if (_loc_3 < this.numOfDelayedMonth)
            {
                _loc_6 = false;
            }
            if (_loc_6)
            {
                _loc_1.Payment = this.ScheduledPaymentPerFreq;
            }
            _loc_1.PrincipalAmount = Math.round((_loc_1.AutoAdditionalPayment + _loc_1.AdditionalPayment + _loc_1.Payment - _loc_1.InterestAmount) * 100) / 100;
            _loc_1.ClosingBalance = _loc_1.OpeningBalance + _loc_1.InterestAmount - (_loc_1.AutoAdditionalPayment + _loc_1.AdditionalPayment + _loc_1.Payment);
            _loc_3 = _loc_3 + 1;
        }
        if (_loc_1 != null)
        {
            return _loc_1.ClosingBalance;
        }
        return 0;
    }


    self.CalculateByInterest = function(){
        this.IsOutstanding = false;
        if (this.loanProjections == null)
        {
            return;
        }
        var _loc_1 = null; //:LoanProjection 
        var _loc_2 = null; //:LoanProjection 
        var _loc_3 = 0;//:uint 
        var _loc_4 = -1;//:Number
        var _loc_5 = 0;//:Number
        var _loc_6 = 1;//:Number 
        var _loc_7 = 0;//:Number 
        while (_loc_5 < _loc_6)
        {
            
            _loc_7 = _loc_5 + (_loc_6 - _loc_5) * 0.5;
            this.InterestRatePerPeriod = _loc_7;
            _loc_4 = this.CalculateProjectionByPayment();
            if (Math.abs(_loc_4) < 0.01)
            {
                break;
            }
            if (_loc_4 < 0)
            {
                _loc_5 = _loc_7 + 1e-009;
                continue;
            }
            _loc_6 = _loc_7 - 1e-009;
        }
        this.CalculateRounded();
        return;
    }



    self.CalculateRounded = function(){
        var _loc_1 = 0; //number 
        var _loc_2 = null; // LoanProjection
        var _loc_3 = null; //LoanProjection
        var _loc_4 = 0; //uint
        this.IsIrregular = false;
        //_loc_4 = 0;
        while (_loc_4 < this.loanProjections.length)
        {
            
            _loc_2 = this.loanProjections[_loc_4];
            if (_loc_2 == null)
            {
            }
            else
            {
                if (_loc_4 == 0)
                {
                    _loc_2.OpeningBalanceRounded = _loc_2.OpeningBalance;
                }
                if (_loc_4 > 0)
                {
                    _loc_3 = this.loanProjections[(_loc_4 - 1)];
                    if (_loc_3 == null)
                    {
                    }
                    _loc_2.OpeningBalanceRounded = _loc_3.ClosingBalanceRounded();
                }
                _loc_2.PrincipalRounded = Math.round(_loc_2.PrincipalAmount * 100) / 100;
                if (Math.abs(_loc_2.ClosingBalance) < 0.01)
                {
                    _loc_2.PrincipalRounded = _loc_2.ClosingBalanceRounded() + _loc_2.PrincipalRounded;
                }
                if (_loc_2.AdditionalPayment > 0)
                {
                    this.IsIrregular = true;
                }
            }
            _loc_4 = _loc_4 + 1;
        }
        if (this.Seasonal != null)
        {
            this.IsIrregular = true;
        }
        return;
    }



    self.TotalInterests = function(){
        var _loc_1 = null;//:LoanProjection
        var _loc_2 = null;//:LoanProjection
        var _loc_3 = 0;//:uint
        var _loc_4 = 0;//:Number
        _loc_3 = 0;
        while (_loc_3 < this.loanProjections.length)
        {
            
            _loc_1 = this.loanProjections[_loc_3];
            if (_loc_1 == null)
            {
            }
            else
            {
                _loc_4 = _loc_4 + _loc_1.InterestRounded();
            }
            _loc_3 = _loc_3 + 1;
        }
        return _loc_4;
    }

    self.TotalRepayments = function(){
        var _loc_1 = null;//:LoanProjection
        var _loc_2 = null;//:LoanProjection 
        var _loc_3 = 0;//:uint
        var _loc_4 = 0;//:Number
        _loc_3 = 0;
        while (_loc_3 < this.loanProjections.length)
        {
            
            _loc_1 = this.loanProjections[_loc_3];
            if (_loc_1 == null)
            {
            }
            else
            {
                _loc_4 = _loc_4 + _loc_1.TotalPaymentRounded();
            }
            _loc_3 = _loc_3 + 1;
        }
        return _loc_4;
    }

    self.NumberOfInstallments = function(){
        var _loc_1 = null;//:LoanProjection
        var _loc_2 = 0;//:uint
        var _loc_3 = 0;//:Number
        _loc_2 = 0;
        while (_loc_2 < this.loanProjections.length)
        {
            
            _loc_1 = this.loanProjections[_loc_2];
            if (_loc_1 == null)
            {
            }
            else if (_loc_1.Payment > 0 || _loc_1.AdditionalPayment > 0)
            {
                _loc_3 = _loc_3 + 1;
            }
            _loc_2 = _loc_2 + 1;
        }
        return _loc_3;
    }

 };