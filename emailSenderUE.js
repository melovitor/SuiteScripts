/**
*@NApiVersion 2.1
*@NScriptType UserEventScript
*@NAuthor Vitor de Melo - vitormelobatista@gmail.com
*@NDescription Este script é carregado com determinados IDs de campos e IDs internos de modelos de e-mail. 
    Após isso, é feita uma validação de qual campo está marcado no pedido de venda para executar o envio do e-mail 
    referente ao campo marcado. Após isso, os dados são enviados para um script de MapReduce para fazer o envio 
    do e-mail para o cliente.

    MapReduce: emailSenderMR.js
*/
define(['N/task', 'N/record'], function(task, record) {


function afterSubmit(context) {
    var currentRecord = context.newRecord;
    var entity = currentRecord.getValue('entity')
    var checkFields = [
        {
            id:"custbody19",
            setField: 'custbody13',
            pix: 3,
            creditCard: 9
        },
        {
            id:"custbody20",
            setField: 'custbody14',
            pix: 5,
            creditCard: 10
        },
        {
            id:"custbody21",
            setField: 'custbody15',
            pix: 6,
            creditCard: 11
        },
        {
            id:"custbody22",
            setField: 'custbody16',
            pix: 7,
            creditCard: 12
        },
        {
            id:"custbody23",
            setField: 'custbody17',
            pix: 8,
            creditCard: 13
        },
        {
            id:"custbody24",
            setField: 'custbody18' ,
            pix: 14,
            creditCard: 15    
        },       
    ]  
    var payment =  currentRecord.getText('custbody_sit_t_desc_cond_pgto')

    for (var i = 0; i < checkFields.length; i++) {
        if(currentRecord.getValue(checkFields[i].setField) == true)  return
        if(currentRecord.getValue(checkFields[i].id) == true) {
            payment == 'A VISTA - PIX' ? payment = checkFields[i].pix : payment = checkFields[i].creditCard
            var customer = record.load({
                type: 'customer',
                id: entity,
            })
            var email = customer.getValue('email')
            var mrTask = task.create({taskType: task.TaskType.MAP_REDUCE})
                mrTask.scriptId = 'customscript_emailsendermr'
                mrTask.deploymentId = 'customdeploy_emailsendermr'
                mrTask.params = {
                custscript_data: `${currentRecord.id},${email},${checkFields[i].setField},${payment}`
            }
        var mrTaskId = mrTask.submit();                
        }            
    }
}
    return {
        afterSubmit: afterSubmit
    }
});
