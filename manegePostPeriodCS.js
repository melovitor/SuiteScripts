/**
*@NApiVersion 2.1
*@NScriptType ClientScript
*@NAuthor Vitor de Melo - vitormelobatista@gmail.com
*@NDescription Esse script é responsável por pegar a data de criação da transação e formatá-la no padrão Mês/Ano 
    e colocar essa informação em outro campo.
*/
define([], function() {

    function pageInit(context) {
        var recordData = context.currentRecord
        var trandate = recordData.getValue('trandate')
        var date = new Date(trandate)
        var year = date.getFullYear()
        var month = date.getMonth() + 1

        switch(month){
            case 1: 
            month = 'Jan'
            case 2: 
            month = 'Fev'
            case 3: 
            month = 'Mar'
            case 4: 
            month = 'Abr'
            case 5: 
            month = 'Mai'
            case 6: 
            month = 'Jun'
            case 7: 
            month = 'Jul'
            case 8: 
            month = 'Ago'
            case 9: 
            month = 'Set'
            case 10: 
            month = 'Out'
            case 11: 
            month = 'Nov'
            case 12: 
            month = 'Dez'
        }
        recordData.setText('postingperiod', `${month} ${year}` )
    }

    return {
        pageInit: pageInit
    }
});
