function LoadXMLDataFromRecord()
{
    
    if('{!currentRecordId}' != '')
    {
        Visualforce.remoting.Manager.invokeAction(
            '{!$RemoteAction.QuotesControllerExtension.getXMLData}',
             '{!currentRecordId}',
            function(result, event) {
                var scope = angular.element(document.querySelector('#CBA_CALC')).scope();
                var xotree = new XML.ObjTree();
                
                //var xmlData = unescape(result)
                
                var xmlData =  angular.element('<textarea />').html(result).text();


                var jsonData = xotree.parseXML( xmlData );

                var formData =  jsonData.CBACalculatorTools.CBACalculatorForm;

                scope.CalcType = formData.CalcType;
                scope.InAdvanced = formData.InAdvanced;
                scope.Frequency = formData.Frequency;
                scope.State = formData.State;

                var parts = formData.DDate.split("/");
                var dt = new Date(parseInt(parts[2], 10),
                                  parseInt(parts[1], 10) - 1,
                                  parseInt(parts[0], 10));


                if ( jsonData.CBACalculatorTools.CBACalculatorSchedule.Seasonal != null){
                    scope.IsSeasonal = true;
                    var seasonalStrArray = jsonData.CBACalculatorTools.CBACalculatorSchedule.Seasonal.split(',')
                    var cnt = 0;
                    while (cnt < seasonalStrArray.length){
                        scope.Seasonal[cnt] = JSON.parse(seasonalStrArray[cnt]);
                        cnt++;
                    }

                }
                else{
                    scope.IsSeasonal = false;
                }

                scope.DDateText = dt;//dt.yyyymmdd();//formData.DDate;
                scope.AssetType = formData.AssetType;
                scope.EquipmentCost = Number(formData.EquipmentCost);
                scope.TradeIn = Number(formData.TradeIn);
                scope.MVRegoCost = Number(formData.MVRegoCost);
                scope.Options = Number(formData.Options);
                scope.SupplierDelivery = Number(formData.SupplierDelivery);
                scope.SupplierDiscount = Number(formData.SupplierDiscount);
                scope.FeesAndChargesFinanced = Number(formData.FeesAndChargesFinanced);
                scope.LessorRate = Number(formData.LessorRate);
                scope.TermInMonths = Number(formData.TermInMonths);
                scope.BrokageAmount = Number(formData.BrokageAmount);
                scope.ResidualAmount = Number(formData.ResidualAmount);
                scope.DelayedPayment = Number(formData.DelayedPayment);


                var factsData =  jsonData.CBACalculatorTools.CBACalculatorFacts;


                                  //"LCTLimit": $scope.LCTLimit(),
                scope.LCTLimitFuelEfficient = Number(factsData.LCTLimitFuelEfficient); // LCTLimitFuelEfficient__c
                scope.GSTPercentRate  = Number(factsData.GSTPercentRate); //GSTPercentRate__c
                scope.MortgageDutyBaseNSW = Number(factsData.MortgageDutyBaseNSW); // MortgageDutyBaseNSW__c
                scope.MortgageDutyLimitNSW = Number(factsData.MortgageDutyLimitNSW);// MortgageDutyLimitNSW__c
                scope.MortgageDutyRateNSW = Number(factsData.MortgageDutyRateNSW);// MortgageDutyRateSA__c
                scope.MortgageDutyCeilFactorNSW = Number(factsData.MortgageDutyCeilFactorNSW);// MortgageDutyCeilFactorNSW__c
                scope.MortgageDutyBaseSA = Number(factsData.MortgageDutyBaseSA);// MortgageDutyBaseSA__c
                scope.MortgageDutyLimitSA = Number(factsData.MortgageDutyLimitSA);// MortgageDutyLimitSA__c
                scope.MortgageDutyRateSA = Number(factsData.MortgageDutyRateSA);//  MortgageDutyRateSA__c
                scope.MortgageDutyCeilFactorSA = Number(factsData.MortgageDutyCeilFactorSA);// MortgageDutyCeilFactorSA__c

                if (factsData.LCTRate)
                    scope.LCTRate = Number(factsData.LCTRate); // LCTRate__c
                if (factsData.LCTLuxuryThreshold)
                    scope.LCTLuxuryThreshold = Number(factsData.LCTLuxuryThreshold); //LCTLuxuryThreshold__c (New)
                if (factsData.LCTCarLimit)
                    scope.LCTCarLimit = Number(factsData.LCTCarLimit);//LCTLimitLuxury__c


                //console.log(xmlData);
                console.log(jsonData);
                
                scope.TypeChanged();

                scope.setAddPaymentArray(jsonData.CBACalculatorTools.CBACalculatorSchedule.CBACalculatorAddPayments);
                scope.ComputeFromAmountFinanced();
                scope.$apply();

            }
        );
    }
    else
    {

        Visualforce.remoting.Manager.invokeAction(
            'QuotesControllerExtension.getNothing',
            function(result, event) {
                var scope = angular.element(document.querySelector('#CBA_CALC')).scope();
                console.log('Hi YA!! {!$Setup.CalculatorFigures__c.MortgageDutyRateSA__c}');
                //then load the custom settings

                scope.LCTLimitFuelEfficient = Number({!$Setup.CalculatorFigures__c.LCTLimitFuelEfficient__c}); // LCTLimitFuelEfficient__c
                scope.GSTPercentRate  = Number({!$Setup.CalculatorFigures__c.GSTPercentRate__c}); //GSTPercentRate__c
                scope.MortgageDutyBaseNSW = Number({!$Setup.CalculatorFigures__c.MortgageDutyBaseNSW__c}); // MortgageDutyBaseNSW__c
                scope.MortgageDutyLimitNSW = Number({!$Setup.CalculatorFigures__c.MortgageDutyLimitNSW__c});// MortgageDutyLimitNSW__c
                scope.MortgageDutyRateNSW = Number({!$Setup.CalculatorFigures__c.MortgageDutyRateNSW__c});// MortgageDutyRateNSW__c     MortgageDutyRateNSW__c
                scope.MortgageDutyCeilFactorNSW = Number({!$Setup.CalculatorFigures__c.MortgageDutyCeilFactorNSW__c});// MortgageDutyCeilFactorNSW__c
                scope.MortgageDutyBaseSA = Number({!$Setup.CalculatorFigures__c.MortgageDutyBaseSA__c});// MortgageDutyBaseSA__c
                scope.MortgageDutyLimitSA = Number({!$Setup.CalculatorFigures__c.MortgageDutyLimitSA__c});// MortgageDutyLimitSA__c
                scope.MortgageDutyRateSA = Number({!$Setup.CalculatorFigures__c.MortgageDutyRateSA__c});//  MortgageDutyRateSA__c
                scope.MortgageDutyCeilFactorSA = Number({!$Setup.CalculatorFigures__c.MortgageDutyCeilFactorSA__c});// MortgageDutyCeilFactorSA__c
                scope.LCTRate = Number({!$Setup.CalculatorFigures__c.LCTRate__c}); // LCTRate__c
                scope.LCTLuxuryThreshold = Number({!$Setup.CalculatorFigures__c.LCTLuxuryThreshold__c}); //LCTLuxuryThreshold__c (New)
                scope.LCTCarLimit = Number({!$Setup.CalculatorFigures__c.LCTLimitLuxury__c});//LCTLimitLuxury__c

                scope.$apply();
            }
        );
    }
}