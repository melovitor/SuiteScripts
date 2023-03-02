/**
*@NApiVersion 2.1
*@NScriptType ClientScript
*@NAuthor Vitor de Melo - vitormelobatista@gmail.com
*@NDescription Esse script é responsável por fazer o cálculo de item ou despesa de um pedido, proporcionalmente ao rateio 
colocado em uma sublista customizada. Primeiro, ele pergunta ao usuário, no momento do salvamento da página, se ele deseja 
efetuar o cálculo de rateio. Caso ele não deseje, o script permite o salvamento do registro sem executar as demais condições 
do script.
Caso o usuário deseje fazer o cálculo de rateio, o script calcula as linhas do rateio e pega qual porcentagem é para 
projeto e qual é para item/despesa. Após fazer esse cálculo, ele apaga as linhas de item/despesa que existem e as 
reconstrói fazendo o cálculo proporcional do rateio.

    Exemplo:  
        Linha antiga do item: Teclado {
            valor: R$20,00,
            quantidade: 10,
            projeto: Rateio,
            ...
        }

    Rateio{
        40% do teclado vai para o projeto de ADS
        30% do teclado vai para o projeto de Financeiro
        30% do teclado vai para o projeto de RH
    }

    Linha novas do item:
        teclado {
            valor: R$8,00,
            quantiade: 4,
            projeto: ADS,
            ...
        }
        teclado {
            valor: R$6,00,
            quantiade: 3,
            projeto: Financeiro,
            ...
        }
        teclado {
            valor: R$6,00,
            quantiade: 3,
            projeto: RH,
            ...
        }


*/
define([], function() {
var item, expense, lineRateio 

function saveRecord(context) {
    var recordData = context.currentRecord
    if(recordData.getValue('cseg_pslad_pro') != 257) return true

    var remake = confirm('Desaja fazer o calculo de rateio?\nOK: SIM\nCANCEL: NÃO')
    if(remake == false) return true

    var amountItem = recordData.recordType == 'vendorbill' ? 'amount' : 'rate'
    var apportionmentArray = []
    var apportionmentLineCount = recordData.getLineCount('recmachcustrecord_ps_rateio_transacao')
    var item = recordData.getLineCount('item')
    var expense = recordData.getLineCount('expense')

    if(apportionmentLineCount) {        
            var sublist = []
            for(var i = 0; i < apportionmentLineCount; i++) {
                var line = {
                    weight: recordData.getSublistValue({
                        sublistId: 'recmachcustrecord_ps_rateio_transacao',
                        fieldId: 'custrecord_ps_rateio_peso',
                        line: i
                    }),
                    project: recordData.getSublistValue({
                        sublistId: 'recmachcustrecord_ps_rateio_transacao',
                        fieldId: 'custrecord_ps_rateio_projeto',
                        line: i
                    }),
                    item: recordData.getSublistValue({
                        sublistId: 'recmachcustrecord_ps_rateio_transacao',
                        fieldId: 'custrecord_ps_rateio_item',
                        line: i
                    }),
                    category: recordData.getSublistValue({
                        sublistId: 'recmachcustrecord_ps_rateio_transacao',
                        fieldId: 'custrecord_ps_rateio_categoria',
                        line: i
                    })
                }
                apportionmentArray.push(line)
            }

            for (var i = 0; i < apportionmentArray.length; i++) {
                if(!line.weight){
                    alert('O Peso e o Projeto na aba Rateio são obrigatórios!')
                    return false
                }
                if(!line.project){
                    alert('O Peso e o Projeto na aba Rateio são obrigatórios!')
                    return false
                }

                if(!line.project && !line.weight){
                    console.log('O Peso e o Projeto na aba Rateio')
                }
                if(!line.item || !line.category){
                    console.log('Item ou despesa')
                }
            }

            var countWeight = 0
            for(var i = 0; i < apportionmentArray.length; i++){
                countWeight = countWeight + apportionmentArray[i].weight 
                if(recordData.getValue('cseg_pslad_pro') == 257){
                    if(apportionmentArray[0].project == '' || apportionmentArray[0].weight == '') {
                        alert('O Peso e o Projeto na aba Rateio são obrigatórios!')
                        return false
                    }
                }     
            }            
            if (item){
                if(countWeight/item > 100) {
                    alert('O peso total de rateio por item/despesa deve ser 100%.')
                    return false
                }
                if(countWeight/item < 100) {
                    alert('O peso total de rateio por item/despesa deve ser 100%.')
                    return false
                }
                for(var i = 0; i < item; i++) { 
                    var line = {
                        item: recordData.getSublistValue({
                            sublistId: 'item',
                            fieldId: 'item',
                            line: i
                        }),
                        quantity: recordData.getSublistValue({
                            sublistId: 'item',
                            fieldId: 'quantity',
                            line: i
                        }),
                        unityValue: recordData.getSublistValue({
                            sublistId: 'item',
                            fieldId: amountItem,
                            line: i
                        }),
                        grossAmount: recordData.getSublistValue({
                            sublistId: 'item',
                            fieldId: 'grossamt',
                            line: i
                        }),
                        description: recordData.getSublistText({
                            sublistId: 'item',
                            fieldId: 'description',
                            line: i
                        }),
                        departament: recordData.getSublistValue({
                            sublistId: 'item',
                            fieldId: 'departament',
                            line: i
                        }),
                        class: recordData.getSublistValue({
                            sublistId: 'item',
                            fieldId: 'class',
                            line: i
                        }),
                        company: recordData.getSublistValue({
                            sublistId: 'item',
                            fieldId: 'cseg_pslad_sub',
                            line: i
                        }),
                        project: recordData.getSublistValue({
                            sublistId: 'item',
                            fieldId: 'cseg_pslad_pro',
                            line: i
                        }),
                        control: recordData.getSublistValue({
                            sublistId: 'item',
                            fieldId: 'cseg_pslad_cont',
                            line: i
                        }),
                        especialItem: recordData.getSublistValue({
                            sublistId: 'item',
                            fieldId: 'cseg_pslad_ite',
                            line: i
                        }),
                        cfop: recordData.getSublistValue({
                            sublistId: 'item',
                            fieldId: 'custcol_psg_br_tran_incoming_cfop',
                            line: i
                        }),
                        amount: recordData.getSublistValue({
                            sublistId: 'item',
                            fieldId: 'amount',
                            line: i
                        })

                    }
                    sublist.push(line)
                } 
                for (var i = 0; i < sublist.length; i++){
                    recordData.removeLine({
                        sublistId: 'item',
                        line: 0,
                    }); 
                }
                
                var itemLines = []   
                for(var count = 0; count < sublist.length; count++) {
                    for(var i = 0; i < apportionmentArray.length; i++) {
                        if(apportionmentArray[i].item == sublist[count].item){
                            itemLines.push({
                                item: sublist[count].item,
                                quantity: (sublist[count].quantity * apportionmentArray[i].weight) / 100,
                                unityValue: sublist[count].unityValue,
                                grossAmount: (sublist[count].grossAmount * apportionmentArray[i].weight) / 100,
                                description: sublist[count].description,
                                departament: sublist[count].departament,
                                class: sublist[count].class,
                                company: sublist[count].company,
                                project: apportionmentArray[i].project,
                                control: sublist[count].control,
                                especialItem: sublist[count].especialItem,
                                cfop: sublist[count].cfop,
                                amount: (sublist[count].amount * apportionmentArray[i].weight) / 100
                            })
                        }
                    }
                }
                for(var i = 0; i < itemLines.length; i++){
                    createItem(itemLines[i], i)
                }
            
                
            }            
            

        if(expense) {   
            if(countWeight/expense > 100) {
                alert('O peso total de rateio por item/despesa deve ser 100%.')
                return false
            }
            if(countWeight/expense < 100) {
                alert('O peso total de rateio por item/despesa deve ser 100%.')
                return false
            }
            var line
            for(var i = 0; i < expense; i++) { 
                line = {
                    category: recordData.getSublistValue({
                        sublistId: 'expense',
                        fieldId: 'category',
                        line: i
                    }),
                    account: recordData.getSublistValue({
                        sublistId: 'expense',
                        fieldId: 'account',
                        line: i
                    }),
                    amount: recordData.getSublistValue({
                        sublistId: 'expense',
                        fieldId: 'amount',
                        line: i
                    }),
                    grossAmount: recordData.getSublistValue({
                        sublistId: 'expense',
                        fieldId: 'grossamt',
                        line: i
                    }),
                    description: recordData.getSublistText({
                        sublistId: 'expense',
                        fieldId: 'memo',
                        line: i
                    }),
                    departament: recordData.getSublistValue({
                        sublistId: 'expense',
                        fieldId: 'departament',
                        line: i
                    }),
                    class: recordData.getSublistValue({
                        sublistId: 'expense',
                        fieldId: 'class',
                        line: i
                    }),
                    company: recordData.getSublistValue({
                        sublistId: 'expense',
                        fieldId: 'cseg_pslad_sub',
                        line: i
                    }),
                    project: recordData.getSublistValue({
                        sublistId: 'expense',
                        fieldId: 'cseg_pslad_pro',
                        line: i
                    }),
                    control: recordData.getSublistValue({
                        sublistId: 'expense',
                        fieldId: 'cseg_pslad_cont',
                        line: i
                    }),
                    especialItem: recordData.getSublistValue({
                        sublistId: 'expense',
                        fieldId: 'cseg_pslad_ite',
                        line: i
                    })
                }                    
                sublist.push(line)          
            } 
            
            for (var i = 0; i < sublist.length; i++){
                recordData.removeLine({
                    sublistId: 'expense',
                    line: 0,
                }); 
            } 
            var expenseLines = []   
            for(var count = 0; count < sublist.length; count++) {
                for(var i = 0; i < apportionmentArray.length; i++) {
                    if(apportionmentArray[i].category == sublist[count].category){
                        expenseLines.push({
                            category: sublist[count].category,
                            account: sublist[count].account,
                            amount: (sublist[count].amount * apportionmentArray[i].weight) / 100,
                            grossAmount: (sublist[count].grossAmount * apportionmentArray[i].weight) / 100,
                            description: sublist[count].description,
                            departament: sublist[count].departament,
                            class: sublist[count].class,
                            company: sublist[count].company,
                            project: apportionmentArray[i].project,
                            control: sublist[count].control,
                            especialItem: sublist[count].especialItem
                        })
                    }
                }
            }
            for(var i = 0; i < expenseLines.length; i++){
                createExpense(expenseLines[i], i)
            }          
        }

        function createItem (line, i){
            recordData.insertLine({
                sublistId: 'item',
                line: i,
            });
            recordData.setCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'item',
                value: line.item ? line.item : '',
                ignoreFieldChange: true
            });                                 
            recordData.setCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'quantity',
                value: line.quantity ? line.quantity : '',
                ignoreFieldChange: true
            }); 
            recordData.setCurrentSublistValue({
                sublistId: 'item',
                fieldId: amountItem,
                value:  line.unityValue ? line.unityValue : '',
            });
            recordData.setCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'description',
                value: line.description ? line.description : '',
            });
            recordData.setCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'departament',
                value: line.departament ? line.departament : '',
                ignoreFieldChange: true
            });
            recordData.setCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'class',
                value: line.class ? line.class : '',
                ignoreFieldChange: true
            });
            recordData.setCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'cseg_pslad_sub',
                value: line.company ? line.company: '',
                ignoreFieldChange: true
            });
            recordData.setCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'cseg_pslad_pro',
                value: line.project ? line.project: '',
                ignoreFieldChange: true
            });
            recordData.setCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'cseg_pslad_cont',
                value: line.control ? line.control : '',
                ignoreFieldChange: true
            });
            recordData.setCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'cseg_pslad_ite',
                value: line.especialItem ? line.especialItem : '',
                ignoreFieldChange: true
            }); 
            recordData.setCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'custcol_psg_br_tran_incoming_cfop',
                value: line.cfop ? line.cfop : '',
                ignoreFieldChange: true
            }); 
            recordData.setCurrentSublistValue({
                sublistId: 'item',
                fieldId: 'taxdetailsreference',
                value: 'NEW' + i,
                ignoreFieldChange: true
            }); 
            recordData.commitLine({
                sublistId: 'item'
            }) 
        }

        function createExpense(line, i) {        
            recordData.insertLine({
                sublistId: 'expense',
                line: i,
            });
            recordData.setCurrentSublistValue({
                sublistId: 'expense',
                fieldId: 'category',
                value: line.category ?  line.category: '',
                ignoreFieldChange: true
            });                                 
            recordData.setCurrentSublistValue({
                sublistId: 'expense',
                fieldId: 'account',
                value: line.account ? line.account: '',
                ignoreFieldChange: true
            }); 
            recordData.setCurrentSublistValue({
                sublistId: 'expense',
                fieldId: 'amount',
                value: line.amount ? line.amount: '',
                ignoreFieldChange: true
            });
            recordData.setCurrentSublistValue({
                sublistId: 'expense',
                fieldId: 'grossamt',
                value:  line.grossAmount ? line.grossAmount: '',
                ignoreFieldChange: true
            });
            recordData.setCurrentSublistValue({
                sublistId: 'expense',
                fieldId: 'memo',
                value: line.description ? line.description: '',
                ignoreFieldChange: true
            });
            recordData.setCurrentSublistValue({
                sublistId: 'expense',
                fieldId: 'departamen',
                value: line.departament ? line.departament: '' ,
                ignoreFieldChange: true
            });
            recordData.setCurrentSublistValue({
                sublistId: 'expense',
                fieldId: 'class',
                value: line.class ? line.class: '',
                ignoreFieldChange: true
            });
            recordData.setCurrentSublistValue({
                sublistId: 'expense',
                fieldId: 'cseg_pslad_sub',
                value: line.company ? line.company: '',
                ignoreFieldChange: true
            });
            recordData.setCurrentSublistValue({
                sublistId: 'expense',
                fieldId: 'cseg_pslad_pro',
                value: line.project ? line.project: '',
                ignoreFieldChange: true
            });
            recordData.setCurrentSublistValue({
                sublistId: 'expense',
                fieldId: 'cseg_pslad_cont',
                value: line.control ? line.control: '',
                ignoreFieldChange: true
            });
            recordData.setCurrentSublistValue({
                sublistId: 'expense',
                fieldId: 'cseg_pslad_ite',
                value: line.especialItem ? line.especialItem: '',
                ignoreFieldChange: true
            }); 
            recordData.commitLine({
                sublistId: 'expense'
            })
            
            
        }
    }
    return true;
}


function sublistChanged(context) {
    var recordData = context.currentRecord    

    if(context.sublistId == 'recmachcustrecord_ps_rateio_transacao') {
        item = recordData.getLineCount('item')
        expense = recordData.getLineCount('expense')
        var itemExpense = item + expense

        lineRateio = recordData.getLineCount('recmachcustrecord_ps_rateio_transacao')

        if(lineRateio > 0) {
            if(!itemExpense) {
                alert('Adicione ao menos um item ou uma despesa.')
                recordData.removeLine({
                    sublistId: 'recmachcustrecord_ps_rateio_transacao',
                    line: 0,
                });
            }                   
        }          
    }
}

return {
    saveRecord: saveRecord,
    sublistChanged: sublistChanged
}
});
