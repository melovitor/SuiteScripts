/**
*@NApiVersion 2.x
*@NScriptType ClientScript
*@NAuthor Vitor de Melo - vitormelobatista@gmail.com
*@NDescription Este script é responsável por fazer o cálculo de budget disponível para uso. 
    Caso o budget mensal não tenha saldo para completar a transação, o script mostra uma mensagem 
    informando que o budget mensal não tem saldo e que a transação será feita utilizando o budget trimestral.
    Caso o budget trimestral não tenha saldo, o script impede o salvamento da transação e informa ao usuário o motivo.
*/
define(['N/search','N/ui/message'], function(search, message) {    
    var month = new Date().getMonth() + 1;
    var monthAmount
    var quarterAmount
    var costCenter
    var referringQuarter
    var q1 
    var q2 
    var q3 
    var q4 

    myMsgMonth = message.create({
        title: 'Saldo do Budget Mensal Insuficente',
        message: 'O Saldo do Budget Mensal é Insuficiente! Esta requisição será criada utilizando o saldo trimestral!',
        type: message.Type.WARNING,
    });

    function saveRecord(context) {
        var record = context.currentRecord;
        var requestAmounth = record.getValue('total')
        var totalQuarter = referringQuarter - quarterAmount

        if( totalQuarter - requestAmounth < 0){
            myMsgQuarter = message.create({
                title: 'Saldo do Budget Mensal e Trimestral Insuficente',
                message: 'O Saldo do Budget Mensal e Trimestral é Insuficiente! Esta requisição não pode ser salva.',
                type: message.Type.ERROR,
            });
            myMsgQuarter.show({ duration : 20000 });   
            myMsgMonth.hide()
            return false;
        }
        return true;        
    }
    function fieldChanged(context) {
        if(context.fieldId == 'class'){
            var record = context.currentRecord;
            costCenter = record.getValue('class')

            var purchaserequisitionMonthSearchObj = search.create({
                type: "purchaserequisition",
                filters:
                [
                   ["type","anyof","PurchReq"], 
                   "AND", 
                   ["class.internalid","anyof", costCenter], 
                   "AND", 
                   ["approvalstatus","anyof","2"],
                   "AND", 
                   ["trandate","within","thismonth"]
                ],
                columns:
                [
                   search.createColumn({name: "amount", summary: "SUM", label: "Valor"})
                ]
             });                
             purchaserequisitionMonthSearchObj.run().each(function (result) {
                monthAmount = result.getValue({
                        "name": "amount",
                        "summary": 'SUM'
                    });
                })
            record.setValue('custbody2', Number(monthAmount))

            var purchaserequisitionQuarterSearchObj = search.create({
                type: "purchaserequisition",
                filters:
                [
                   ["type","anyof","PurchReq"], 
                   "AND", 
                   ["class.internalid","anyof", costCenter], 
                   "AND", 
                   ["approvalstatus","anyof","2"],
                   "AND", 
                   ["trandate","within","thisfiscalquarter"]
                ],
                columns:
                [
                   search.createColumn({name: "amount", summary: "SUM", label: "Valor"})
                ]
             });                
             purchaserequisitionQuarterSearchObj.run().each(function (result) {
                quarterAmount = result.getValue({
                        "name": "amount",
                        "summary": 'SUM'
                    });
                })


            var classificationSearchObj = search.create({
                type: "classification",
                filters:
                [
                   ["internalid","anyof", costCenter]
                ],
                columns:
                [
                   search.createColumn({name: "custrecord7", label: "BUDGET JANEIRO "}),
                   search.createColumn({name: "custrecord8", label: "BUDGET FEVEREIRO"}),
                   search.createColumn({name: "custrecord9", label: "BUDGET MARÇO"}),
                   search.createColumn({name: "custrecord10", label: "BUDGET ABRIL"}),
                   search.createColumn({name: "custrecord11", label: "BUDGET MAIO"}),
                   search.createColumn({name: "custrecord12", label: "BUDGET JUNHO"}),
                   search.createColumn({name: "custrecord13", label: "BUDGET JULHO"}),
                   search.createColumn({name: "custrecord14", label: "BUDGET AGOSTO"}),
                   search.createColumn({name: "custrecord15", label: "BUDGET SETEMBRO"}),
                   search.createColumn({name: "custrecord16", label: "BUDGET OUTUBRO"}),
                   search.createColumn({name: "custrecord17", label: "BUDGET NOVEMBRO"}),
                   search.createColumn({name: "custrecord18", label: "BUDGET DEZEMBRO"})
                ]
            });
            var searchResultClassification = classificationSearchObj.run().getRange({
                start: 0,
                end: 12
            });
                
            for (var i = 0; i < searchResultClassification.length; i++) {                    
                var january = Number(searchResultClassification[i].getValue('custrecord7'));
                var february = Number(searchResultClassification[i].getValue('custrecord8'));
                var march = Number(searchResultClassification[i].getValue('custrecord9'));
                var april = Number(searchResultClassification[i].getValue('custrecord10'));
                var may = Number(searchResultClassification[i].getValue('custrecord11'));
                var june = Number(searchResultClassification[i].getValue('custrecord12'));
                var july = Number(searchResultClassification[i].getValue('custrecord13'));
                var august = Number(searchResultClassification[i].getValue('custrecord14'));
                var september = Number(searchResultClassification[i].getValue('custrecord15'));
                var october = Number(searchResultClassification[i].getValue('custrecord16'));
                var november = Number(searchResultClassification[i].getValue('custrecord17'));
                var december = Number(searchResultClassification[i].getValue('custrecord18'));
            }                
            q1 = january + february + march
            q2 = april + may + june
            q3 = july + august + september
            q4 = october + november + december

            switch(month){
                case 1:
                    record.setValue('custbody3', january);
                    validateAmount(january, monthAmount)
                    referringQuarter = q1
                    break;
                case 2:
                    record.setValue('custbody3', february);
                    validateAmount(february, monthAmount)
                    referringQuarter = q1
                    break;
                case 3:
                    record.setValue('custbody3', march);
                    validateAmount(march, monthAmount)
                    referringQuarter = q1
                    break;
                case 4:
                    record.setValue('custbody3', april);
                    validateAmount(april, monthAmount)
                    referringQuarter = q2
                    break;
                case 5:
                    record.setValue('custbody3', may);
                    validateAmount(may, monthAmount)
                    referringQuarter = q2
                    break;
                case 6:
                    record.setValue('custbody3', june);
                    validateAmount(june, monthAmount)
                    referringQuarter = q2
                    break;
                case 7:
                    record.setValue('custbody3', july);
                    validateAmount(july, monthAmount)
                    referringQuarter = q3
                    break;
                case 8:
                    record.setValue('custbody3', august);
                    validateAmount(august, monthAmount)
                    referringQuarter = q3
                    break;
                case 9:
                    record.setValue('custbody3', september);
                    validateAmount(september, monthAmount)
                    referringQuarter = q3
                    break;
                case 10:
                    record.setValue('custbody3', october);
                    validateAmount(october, monthAmount)
                    referringQuarter = q4
                    break;
                case 11:
                    record.setValue('custbody3', november);
                    validateAmount(november, monthAmount)
                    referringQuarter = q4
                    break;
                case 12:
                    record.setValue('custbody3', december);
                    validateAmount(december, monthAmount)
                    referringQuarter = q4
                    break;
            }
        }  
    }
    function validateAmount(month, amount) {
        if(month - amount < 0){
            myMsgMonth.show({ duration : 20000 });
        }
    } 
    
    return {
        saveRecord: saveRecord,
        fieldChanged: fieldChanged
    }
});
