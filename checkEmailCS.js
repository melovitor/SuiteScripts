/**
*@NApiVersion 2.1
*@NScriptType ClientScript
*@NAuthor Vitor de Melo - vitormelobatista@gmail.com
*@NDescription Script responsável por validar no momento em que o registro está sendo salvo se o e-mail do 
    cliente está cadastrado, através de uma validação de campos feita no pedido de venda. 
    Caso o cliente não possua um e-mail cadastrado, o script mostra um alerta no padrão NetSuite
    e não permite o salvamento do registro até que se tenha um e-mail cadastrado. E caso exista um e-mail, 
    o script permite o salvamento do registro normalmente, sem mostrar nenhum alerta.
*/
define(['N/record', 'N/ui/dialog'], function(record, dialog) {
    function saveRecord(context) {
        var currentRecord = context.currentRecord;
        var entity = currentRecord.getValue('entity')
        var customer = record.load({
            type: 'customer',
            id: entity,
        })
        var email = customer.getValue('email')

        var checkFields = [
            {
                id: 'custbody19',
            },
            {
                id: 'custbody20',
            },
            {
                id: 'custbody21',
            },
            {
                id: 'custbody22',
            },
            {
                id: 'custbody23',
            },
            {
                id: 'custbody24' ,
            },
            
        ]
        for (var i = 0; i < checkFields.length; i++) {
            if(currentRecord.getValue(checkFields[i].id) == true)  {
                if(!email) {
                    dialog.alert({
                        title: 'O e-mail do cliente está em branco.',
                        message: 'Adicione um e-mail válido no cadastro do cliente ou retire o checkbox de cobrança para continuar.'
                    })
                    return false
                } 
            }
        }      
        return true
    }   
    return {
        saveRecord: saveRecord,
    }
});
