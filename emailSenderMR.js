/**
 *@NApiVersion 2.1
 *@NScriptType MapReduceScript
 *@NAuthor Vitor de Melo - vitormelobatista@gmail.com
 *@NDescription  Este script recebe parâmetros enviados de um UserEvent Script. 
    Os parâmetros são retirados de um pedido de venda e vêm em forma de string, 
    contendo o ID da transação, o e-mail do destinatário e o template que será usado. 
    Após receber os dados, ele envia um e-mail de vencimento de fatura para o cliente. 
    O modelo de e-mail que é enviado tem um template que está na aba de "Modelos de E-mail" no NetSuite. 
    Ele não cria em si o modelo de e-mail, mas pega um que já existe na base e faz o envio para o cliente. 
    Após o envio do e-mail, o script dá um record.load no pedido de venda e marca um campo para que, 
    quando esse script for acionado novamente, não envie o e-mail para o destinatário mais de uma vez.
    
    UserEvent: emailSenderUE.js
*/
define(['N/record', 'N/email', 'N/render', 'N/runtime'], function(record, email, render, runtime) {

function getInputData() {
    var params = [
        runtime.getCurrentScript().getParameter({
            name: 'custscript_data'
        })
    ]
    return params
}
function map(context){
    try {
        
        var params = context.value
        params  = params.split(',')
        
        var renderEmail = render.mergeEmail({
                templateId: Number(params[3]),
                transactionId: Number(params[0])
            });

        email.send({
            author: 1033, 
            recipients: params[1], 
            subject: renderEmail.subject,
            body: renderEmail.body
        });

        var salesOrder = record.load({
                type: 'salesorder',
                id: Number(params[0])
            })

        salesOrder.setValue({
            fieldId: params[2],
            value: true,
        })
        salesOrder.save() 
        
    } catch (e) {
        log.debug('Error', e)
    }               
}
    return {
        getInputData: getInputData,
        map: map

    }
});
