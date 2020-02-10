let temporaryHints;

let apiBaseURL = 'http://ec2-34-245-97-253.eu-west-1.compute.amazonaws.com:3000';
if(window.location.hostname != 'ec2-34-245-97-253.eu-west-1.compute.amazonaws.com:3000')
    apiBaseURL = 'http://localhost:3000';

$( "#searchBar" ).keyup(() => {
    console.log("" + $( "#searchBar" ).val());
    $( "#searchBar" ).autocomplete({
        
        source: function( request, response ) {
            $.ajax({
            url: apiBaseURL+"/videogame?name="+$( "#searchBar" ).val()+"&details=false&offers=false",
            dataType: "json",
            success: function( data ) {
                
                temporaryHints = data;
                
                let hints = [];
                for(let hint of data)
                    hints.push(hint['name']);

                response( hints );
            }
            });
        },

        select: function( event, ui ) {
            console.log( ui.item ?
            "Selected: " + ui.item.label :
            "Nothing selected, input was " + this.value);

            let steamID;

            for(let hint of temporaryHints)
                if(hint['name'] === ui.item.label){
                    steamID = hint['steamID'];
                    break;
                }
            
            console.log("Found game with steamID " + steamID); //TODO redirect
            window.location.replace('/gameSearch?steamID=' + steamID);

        },
        open: function() {
            $( this ).removeClass( "ui-corner-all" ).addClass( "ui-corner-top" );
        },
        close: function() {
            $( this ).removeClass( "ui-corner-top" ).addClass( "ui-corner-all" );
        }
        
    }); 
});


$("#searchBtn").click(() => {
    window.location.replace('/gameSearch?name=' + $("#searchBar").val());
});

$("#searchBar").keyup(() => {
    if (event.keyCode === 13) {
        event.preventDefault();
        $("#searchBtn").click();
    }
});

