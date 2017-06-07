function apri_notifiche(){
    var contenuto = '';
    for(var i = 0; i < array_notifiche.length; i++){
        contenuto += array_notifiche[i] + '<br>';
    }
    console.log(contenuto);
     array_notifiche = [];
     $("#numNotifiche").html(parseInt(0));
     $("#notif").html("<tr><td>" + contenuto + "</td></tr>");
     number = 0;
     $.post('https://collage-jhin.c9users.io/users/notifications', {
        id: id
    }, function(data) {
        console.log("tutto ok");
    });
}