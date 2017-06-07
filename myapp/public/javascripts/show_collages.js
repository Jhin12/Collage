function tuoi_collage(){
 
   var form = $('<form action="' + "https://collage-jhin.c9users.io/users/collages" + '" method="post">' +
                '<input type="hidden" name="id" value="' + id + '">'+
                '/form>');
    $('body').append(form);
    form.submit();
}

function collages_amici(){

var form = $('<form action="' + "https://collage-jhin.c9users.io/users/collages_amici" + '" method="post">' +
                '<input type="hidden" name="id" value="' + id + '">'+
                '/form>');
    $('body').append(form);
    form.submit();
    
}