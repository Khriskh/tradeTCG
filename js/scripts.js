$(document).ready(function() {
    URL = 'https://itechs.ngrok.io/tcgpocket';
    //login
    if(localStorage.getItem('uuid') == "undefined" || localStorage.getItem('name') == "undefined"){
        localStorage.removeItem('uuid');
        localStorage.removeItem('name');
    }

    if (localStorage.getItem('uuid') && localStorage.getItem('name')) {
        $('#login_').html("");
        $('#login_').hide();
        $.ajax({
            url: URL + '/userCards/',
            method: 'POST',
            data: {
                uuid: localStorage.getItem('uuid'),
            },
            success: function(response) {
                let cardsSearch = response.cardsSearch_.split(',');
                cardsSearch = cardsSearch.filter(item => item.trim() !== "");
                
                cardsSearch.forEach(function(elemento) {
                    showCard(elemento, "listCardSearch");
                });

                let cardsSwap = response.cardsSwap_.split(',');
                cardsSwap = cardsSwap.filter(item => item.trim() !== "");
                
                cardsSwap.forEach(function(elemento) {
                    showCard(elemento, "listCardSwap");
                });
            },
            error: function() {
                alert('Server Error');
            }
        });

        $('#welcome #name').html("Welcome "+ localStorage.getItem('name'));
    } else {
        $('#welcome').html("");
        $('#welcome').hide();
    }

    $('#loginForm').on('submit', function(event) {
        event.preventDefault();
        var username = $('#username').val();
        var idFriend = $('#idFriend').val();

        $.ajax({
            url: URL + '/user/',
            method: 'POST',
            data: {
                username: username,
                idFriend: idFriend
            },
            success: function(response) {
                if (response && response.uuid != "" && response.name != "") {
                    localStorage.setItem('uuid', response.uuid);
                    localStorage.setItem('name', response.name);
                    location.reload();
                }
            },
            error: function() {
                alert('Server Error');
            }
        });
    });


    //tabs
    $("#tabstrip").kendoTabStrip({
        animation:  {
            open: {
                effects: "none"
            }
        }
    });

    $("#username").kendoTextBox({
        placeholder: "Username",
        size: "small",
    });
    $("#idFriend").kendoTextBox({
        placeholder: "ID Friend",
        size: "small",
    });

    $("#login").kendoButton({
        size: "small",
    });



    $("#toolbarSearch").kendoToolBar({
        resizable: false,
        items: [
            { template: "<button id='saveSearch'>Save</button>"},
            { type: "separator" },
            { template: "<input class='widthComboBox' id='listSearch' />" },
            { template: "<button id='addSearch' title='Add'></button>" },
        ],
    });

    $("#saveSearch").kendoButton({
        icon: "save",
        click: function(){
            if (localStorage.getItem('uuid')) {
                let cardArray = idsCards("listCardSearch");
                $.ajax({
                    url: URL + '/saveSearch/',
                    method: 'POST',
                    data: {
                        uuid: localStorage.getItem('uuid'),
                        cardsSearch: JSON.stringify(cardArray),
                    },
                    success: function() {
                        alert("Save");
                    },
                    error: function() {
                        alert('Server Error');
                    }
                });
            } else {
                alert("User does not exist")
            }
        }
    });

    $("#addSearch").kendoButton({
        icon: "plus",
        click: function(){
            let idCard = $("#listSearch").data("kendoComboBox").value();
            showCard(idCard, "listCardSearch");
        }
    });

    $("#listSearch").kendoComboBox({
        placeholder: "Select card",
        dataTextField: "cardName",
        dataValueField: "cardID",
        filter: "contains",
        autoBind: false,
        minLength: 3,
        dataSource: {
            transport: {
                read: {
                   dataType: "json",
                   url: URL + '/listcard/',
                }
             }
        }
    });

    $("#toolbarSwap").kendoToolBar({
        resizable: false,
        items: [
            { template: "<button id='saveSwap'>Save</button>"},
            { type: "separator" },
            { template: "<input  class='widthComboBox' id='listSwap' />" },
            { template: "<button id='addSwap' title='Add'></button>" },

        ],
    });

    $("#saveSwap").kendoButton({
        icon: "save",
        click: function(){
            if (localStorage.getItem('uuid')) {
                let cardArray = idsCards("listCardSwap");
                $.ajax({
                    url: URL + '/saveSwap/',
                    method: 'POST',
                    data: {
                        uuid: localStorage.getItem('uuid'),
                        cardsSwap: JSON.stringify(cardArray),
                    },
                    success: function() {
                        alert("Save");
                    },
                    error: function() {
                        alert('Server Error');
                    }
                });
            } else {
                alert("User does not exist")
            }
        }
    });

    $("#addSwap").kendoButton({
        icon: "plus",
        click: function(){
            let idCard = $("#listSwap").data("kendoComboBox").value();

            showCard(idCard, "listCardSwap");
        }
    });

    $("#listSwap").kendoComboBox({
        placeholder: "Select card",
        dataTextField: "cardName",
        dataValueField: "cardID",
        filter: "contains",
        autoBind: false,
        minLength: 3,
        dataSource: {
            transport: {
                read: {
                   dataType: "json",
                   url: URL + '/listcard/',
                }
             }
        }
    });

    $("#toolbarFilter").kendoToolBar({
        resizable: false,
        items: [
            { template: "<button id='filterCard'>Filter</button>"},
        ],
    });

    $("#filterCard").kendoButton({
        icon: "filter",
        click: function(){
            $(`#listCardFilter`).html("");

            let cSearch = idsCards("listCardSearch");
            let cSwap = idsCards("listCardSwap");

            [cSearch, cSwap] = removeNonMatchingKeys(cSearch,cSwap);
            let conbinations = combineValues(cSearch,cSwap);

            $.ajax({
                url: URL + '/search/',
                method: 'POST',
                data: {
                    conbinations: conbinations
                },
                success: function(response) {
                    response.forEach(function(card) {
                        let msgID = randomID();
                        $(`#listCardFilter`).append('<table>' +
                            '<tr>' +
                                '<td><img class="cardTrade" src="' + card.search + '"></td>' +
                                '<td><div class="iconTrade"></div></td>' +
                                '<td><img class="cardTrade" src="' + card.swap + '"></td>' +
                                '<td>' +
                                '<input class="nameTrade" value="' + card.alias +'" />' +
                                '<textarea class="descriptionTrade" id="description' + msgID + '"></textarea>' +
                                '<button class="sendTrade" data-search="' + card.search + '" data-swap="' + card.swap + '"  data-uuid="' + card.msg + '" data-send="' + msgID +'" id="' + msgID +'">Send Message</button>' +
                                '</td>' +
                            '</tr>' +
                        '</table>');
                    });
                    
                    $(".descriptionTrade").kendoTextArea({
                        rows: 4,
                        maxLength:200,
                        placeholder: "Message"
                     });

                     $(".sendTrade").kendoButton({
                        click: function(){
                            let send = this.element[0].id;
                            let message = $(`#description${send}`).val();
                            let uuid = $(`#${send}`).data("uuid");
                            let swap = $(`#${send}`).data("swap");
                            let search = $(`#${send}`).data("search");

                            sendMsg(message,uuid,search,swap);
                            $(`#description${send}`).val("");
                        }
                    });

                    $(".nameTrade").kendoTextBox({
                        clearButton: false,
                        readonly: true,
                        prefixOptions: {
                            template: () => `User: `,
                            separator: false
                        },
            
                    });
                },
                error: function() {
                    alert('Server Error');
                }
            });
        }
    });

    $("#toolbarMessage").kendoToolBar({
        resizable: false,
        items: [
            { template: "<button id='messageCard'>Reload</button>"},
        ],
    });

    $("#messageCard").kendoButton({
        //icon: "reload",
        click: function(){
            $.ajax({
                url: URL + '/message/',
                method: 'POST',
                data: {
                    message: localStorage.getItem('uuid'),
                },
                success: function(response) {
                    
                    let listMessage = "";
                    response.forEach(function(msg) {
                        listMessage = listMessage +
                            '<tr>' +
                                '<td><img width=50 src="' + msg.cardSwap + '"></td>' +
                                '<td><img width=50 src="' + msg.cardSearch + '"></td>' +
                                '<td>' + msg.msg + '</td>' +
                            '</tr>';
                    });
                    $(`#listCardMessage`).append('<table class="listCardTrade">' + listMessage + '</table>');
                    
                },
                error: function() {
                    alert('Server Error');
                }
            });
        }
    });

    $("#welcome #logout_").kendoButton({
        size: "small",
        click: function() {
            localStorage.removeItem('uuid');
            localStorage.removeItem('name');
            localStorage.removeItem('cardsSearch');
            localStorage.removeItem('cardsSwap');
            location.reload();
        }
    });

});

function randomID() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    return Array.from({ length: 10 }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
}

function showCard(id, div)
{
    let idrandom =  randomID();

    $.ajax({
        url: URL + '/card/',
        method: 'POST',
        data: {
            idCard: id,
        },
        success: function(response) {
            $(`#${div}`).append('<div class="contentCard" id="contentCard' + idrandom + '">' +
                '<img class="card" data-idCard=' + response.id +' data-rarityText=' + response.rarityText + ' src="' + response.image + '">' +
                '<div class="deleteCard" onclick="deleteCard(' +"'" + idrandom + "'" + ')"><i class="fas fa-trash"></i> </div>' +
                "</div>")
        },
        error: function() {
            alert('Server Error');
        }
    });
}

function sendMsg(message, uuid, search, swap)
{
    $.ajax({
        url: URL + '/send/',
        method: 'POST',
        data: {
            message: message,
            uuidSwap: uuid,
            search: search,
            swap: swap,
            uuidSearch: localStorage.getItem('uuid'),
        },
        success: function(response) {
            
        },
        error: function() {
            alert('Server Error');
        }
    });
}

function deleteCard(id){
    $(`#contentCard${id}`).remove();
}

function idsCards(listcard) {
    let cardArray = {};
    $(`#${listcard} img.card`).each(function() {
        let rarityText = $(this).data('raritytext');
        let idCard = $(this).data('idcard');
        if (cardArray[rarityText]) {
            cardArray[rarityText] += ',' + idCard;
        } else {
            cardArray[rarityText] = idCard;
        }
    });

    return cardArray;
}

function removeNonMatchingKeys(obj1, obj2) {
    // Obtener las claves de ambos objetos
    let keys1 = Object.keys(obj1);
    let keys2 = Object.keys(obj2);
    
    // Filtrar claves que se repiten en ambos objetos
    let matchingKeys = keys1.filter(key => keys2.includes(key));
    
    // Crear nuevos objetos solo con las claves que se repiten
    let filteredObj1 = {};
    let filteredObj2 = {};
    
    matchingKeys.forEach(key => {
        filteredObj1[key] = obj1[key];
        filteredObj2[key] = obj2[key];
    });
    
    return [filteredObj1, filteredObj2];
}

function combineValues(obj1, obj2) {
    let result = [];
    
    for (let key in obj1) {
        if (obj2.hasOwnProperty(key)) {
            let values1 = obj1[key].toString().split(',');
            let values2 = obj2[key].toString().split(',');
            
            values1.forEach(val1 => {
                values2.forEach(val2 => {
                    result.push([key, val1,val2]);
                });
            });
        }
    }
    
    return result;
}
