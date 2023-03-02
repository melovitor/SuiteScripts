/**
 *@NApiVersion 2.1
 *@NScriptType MapReduceScript
 *@NAuthor Vitor de Melo - vitormelobatista@gmail.com
 *@NDescription  Neste script é feita uma busca salva com o filtro e as colunas variáveis para que 
    não seja necessário escrever diversas buscas ou diversos scripts. 
    Ele é responsável por buscar o pedido de venda que está com um determinado campo de dias marcado. 
    Este campo informa quanto tempo antes ou depois do vencimento de uma fatura se deve enviar um e-mail de alerta de vencimento. 
    Após pegar o valor do campo, ele faz um cálculo de dias. O modelo de e-mail que é enviado tem um template 
    que está na aba de "Modelos de E-mail" no NetSuite. Ele não cria em si o modelo do e-mail, 
    mas pega um que já existe na base e faz o envio para o cliente. Para esse script rodar de forma correta, 
    é necessário que ele seja programado na UI para rodar ao menos uma vez por dia.
*/
 define(['N/record', 'N/search', 'N/format', 'N/email', 'N/render'], function(record, search, format, email, render) {

function getInputData() {
    try {
        var fieldsSearch = [
            {
                id:"custbody19",
                setField: 'custbody13',
                label: '07 DIAS ANTES DO VENCIMENTO.',
            },
            {
                id:"custbody20",
                setField: 'custbody14',
                label: '03 DIAS ANTES DO VENCIMENTO.',
            },
            {
                id:"custbody21",
                setField: 'custbody15',
                label: '01 DIA APÓS O VENCIMENTO.',
            },
            {
                id:"custbody22",
                setField: 'custbody16',
                label: '05 DIAS APÓS O VENCIMENTO.',
            },
            {
                id:"custbody23",
                setField: 'custbody17',
                label: '10 DIAS APÓS O VENCIMENTO.',
            },
            {
                id:"custbody24",
                setField: 'custbody18' ,
                label: '15 DIAS APÓS O VENCIMENTO.',

            },
        
        ]
        var recordData = []

    for (var i = 0; i < fieldsSearch.length; i++) {
        var filters =  [
            ["type","anyof","SalesOrd"], 
            "AND", 
            [fieldsSearch[i].id,"is","T"],
            "AND", 
            [fieldsSearch[i].setField,"is","T"],
            "AND", 
            ["mainline","is","T"]
        ]

        var columns = [
            search.createColumn({name: "internalid", label: "ID interno"}),
            search.createColumn({name: fieldsSearch[i].id, label: fieldsSearch[i].label}),
            search.createColumn({name: "entity", label: "Cliente"})
        ]

        var searchObj = search.create({
            type: "salesorder",
            filters: filters,
            columns: columns            
        });
    

        var searchResult = searchObj.run().getRange({
            start: 0,
            end: 1000
        });

        for (var j = 0; j < searchResult.length; j++) {
            var entityData = record.load({
                type: 'customer',
                id: searchResult[j].getValue('entity'),
            })

            recordData.push({
                recordId: searchResult[j].id,
                fieldId: fieldsSearch[i].id,
                email: entityData.getValue('email')
            })
        } 
    }

    log.debug('recordData', recordData)
    return  recordData

    } catch (e) {
        log.debug('Error', e)
    }     
}


function reduce(context) {    
    try {
        var recordData = JSON.parse(context.values[0])
        var salesOrder = record.load({
            type: 'salesorder',
            id: recordData.recordId
        })

        var dateEnd = salesOrder.getSublistText({
            sublistId: 'item',
            fieldId:  'custcol_rsm_data_pag_fatura',
            line: 0
        })
        var parts = dateEnd.split('/');
        var day = parts[0]
        var month = parts[1] - 1
        var year = parts[2]

        dateEnd = new Date(year, month, day);
        var alertDate
        var fieldValue =  recordData.email ?  true : false

        switch(recordData.fieldId){
            case 'custbody19':
                alertDate = dateEnd.setDate(dateEnd.getDate() - 7);                    
                salesOrder.setValue({
                    fieldId: 'custbody13',
                    value: fieldValue
                })                    
                break;
            case 'custbody20':
                alertDate = dateEnd.setDate(dateEnd.getDate() - 3);
                salesOrder.setValue({
                    fieldId: 'custbody14',
                    value: fieldValue
                })  
                break;
            case 'custbody21':
                alertDate = dateEnd.setDate(dateEnd.getDate() + 1);
                salesOrder.setValue({
                    fieldId: 'custbody15',
                    value: fieldValue
                })  
                break;
            case 'custbody22':
                alertDate = dateEnd.setDate(dateEnd.getDate() + 5);
                salesOrder.setValue({
                    fieldId: 'custbody16',
                    value: fieldValue
                })  
                break;
            case 'custbody23':
                alertDate = dateEnd.setDate(dateEnd.getDate() + 10);
                salesOrder.setValue({
                    fieldId: 'custbody17',
                    value: fieldValue
                })  
                break;
            case 'custbody24':
                alertDate = dateEnd.setDate(dateEnd.getDate() + 15);salesOrder.setValue({
                    fieldId: 'custbody18',
                    value: fieldValue
                })  
                break;
        }

    
        alertDate = new Date(alertDate)
        alertDate = format.format({value: alertDate, type: format.Type.DATE});

        var today = new Date()
        today = format.format({value: today, type: format.Type.DATE});

        if(today != alertDate) return 

        var renderEmail = render.mergeEmail({
            templateId: 3,
            transactionId: parseInt(recordData.recordId)
        });


        email.send({
            author: 14272, 
            recipients: recordData.email, 
            subject: renderEmail.subject,
            body: renderEmail.body
        });
        salesOrder.save()            

    } catch (e) {
        log.debug("ERROR Reduce", e)
    }    
}
    return {
        getInputData: getInputData,
        reduce: reduce,

    }
});
