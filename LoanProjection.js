var LoanProjection = function(){ 
    
    var self = this;

    var Term;
    var DDate;
    var OpeningBalance;
    var Payment;
    var AutoAdditionalPayment;
    var AdditionalPayment;
    var InterestAmount;
    var PrincipalAmount;
    var ClosingBalance;
    var PrincipalRounded;
    var OpeningBalanceRounded;

    this.OpeningBalanceRounded = 0;
    this.PrincipalRounded = 0;
    this.ClosingBalance = 0;
    this.PrincipalAmount = 0;
    this.AutoAdditionalPayment = 0;
    this.InterestAmount = 0;
    this.AdditionalPayment = 0;
    this.Payment = 0;
    this.OpeningBalance = 0;
    this.Term = 0;
 
    self.TotalPayment = function() {
        return this.Payment + this.AutoAdditionalPayment + this.AdditionalPayment;
    }

    self.PaymentRounded = function() {
        return Math.round(this.Payment * 100) / 100;
    }

    self.TotalPaymentRounded = function() {
        return this.PaymentRounded() + this.AutoAdditionalPayment + this.AdditionalPayment;
    }

    self.InterestRounded = function() {
        return Math.round((this.TotalPaymentRounded() - this.PrincipalRounded) * 100) / 100;
    }

    self.ClosingBalanceRounded = function() {
        return Math.round((this.OpeningBalanceRounded - this.PrincipalRounded) * 100) / 100;
    }

    /*fromXML: function(XML) {
        var _loc_2:* = new LoanProjection;
        _loc_2.Term = param1.@Term;
        _loc_2.DDate = param1.@DDate;
        return _loc_2;
    }*/

}; 

