function esci(){
    var id = '';
    var form = $('<form action="' + "https://collage-jhin.c9users.io/users/logout" + '" method="post">' +
                '/form>');
    $('body').append(form);
    form.submit();
}