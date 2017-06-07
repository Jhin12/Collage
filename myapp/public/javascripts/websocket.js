
var socket = io.connect("https://collage-jhin.c9users.io",{secure:true});

setInterval(function() {
  socket.emit('inizio', {
    id: id,
    array_notifiche: JSON.stringify(array_notifiche),
    collage_amici: JSON.stringify(collage_amici)
  })
}, 2000)

socket.on(id, function(msg){
  
  $("#numNotifiche").html(parseInt(number) + 1);
  console.log('number '+ number)
  number = parseInt(number)+1;
  
  
  
 
  var index = 0;
  var mex = msg;
  var msg_notif = '';
  for(var i = 0; i < mex.length; i++){
    if(mex[i] == '$'){
      index = i + 1;
      i = mex.length;
    }else{
    msg_notif += mex[i];
      
    }
  }
  var url_collage = '';
  for(i = index; i < mex.length; i++){
    url_collage += mex[i];
  }
  
  array_notifiche.push(msg_notif);
  console.log('websocket------> socket.on id = '+id);
 
})


  