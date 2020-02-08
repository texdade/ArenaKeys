let temporaryHints;
        
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
        },
        open: function() {
            $( this ).removeClass( "ui-corner-all" ).addClass( "ui-corner-top" );
        },
        close: function() {
            $( this ).removeClass( "ui-corner-top" ).addClass( "ui-corner-all" );
        }
        
    }); 
});