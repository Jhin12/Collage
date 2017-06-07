var SITO = 'https://collage-jhin.c9users.io'
var request = require('request');
var express = require('express');
var router = express.Router();
var login = require('./login');
var server = require('../server');

var key = require('../key');
/*----------------- FIREBASE INIT --------------*/
var FIREBASE_SECRET = key.firebase_secret;
var FirebaseTokenGenerator = require("firebase-token-generator");
var tokenGenerator = new FirebaseTokenGenerator(FIREBASE_SECRET);
var token = tokenGenerator.createToken({
  uid: key.uid_firebase
});

/*--------------- INIT TOKEN PER FIREBASE -------------*/
var jsonwebtoken = require("jsonwebtoken");
var SECRET = key.secret;



/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});


/*funzione invocata al click del bottone per login facebook*/

router.get('/FBLogin', function(req, res, next) {
  res.redirect(SITO + '/users/FBLogin/confirm');
});


router.get('/FBLogin/confirm', [login.callback_0, login.callback_1, login.callback_2, login.callback_3, login.callback_4, login.callback_5, login.callback_6]);

router.post('/collage', function(req, res) {

  var amqp = require('amqplib/callback_api');
  var myname = req.body.myname;
  var id = req.body.id;
  var url_collage = req.body.url_collage;
  var FIREBASE_URL = 'https://collage-a1e2f.firebaseio.com/Users/' + id + '.json';
  if (url_collage != 'need_more_photos') {
    request.get({
      url: FIREBASE_URL,
      qs: {
        auth: token
      },
      json: true, //parsa il testo di risposta nel body trasformandolo in JSON
      headers: {
        "content-type": "application/json"
      }
    }, function(error, response, body) {
      var persona = response.body;
      var collage = [];

      if (persona.Person.hasOwnProperty('collage')) {
        var dim_collage = persona.Person.collage.length;
        collage.push(url_collage);
        while (dim_collage > 0) {
          collage.push(persona.Person.collage[dim_collage - 1]);
          dim_collage = dim_collage - 1;
        }
      }
      else {
        collage.push(url_collage);
      }
      var requestData = {
        "Person": {
          user: persona.Person.user,
          email: persona.Person.email,
          image: persona.Person.image,
          photos: persona.Person.photos,
          friends: persona.Person.friends,
          notifications: persona.Person.notifications,
          number: persona.Person.number,
          collage: collage,
          collage_amici: persona.Person.collage_amici
        }
      };
      request.put({
        url: FIREBASE_URL,
        qs: {
          auth: token
        },
        json: true,
        headers: {
          "content-type": "application/json"
        },
        body: requestData
      }, function(error, response, body) {
        var persona = response.body;
        var friends = persona.Person.friends;
        if (!error && response.statusCode == 200) {
          amqp.connect('amqp://localhost', function(err, conn) {
            conn.createChannel(function(err, ch) {
              console.log('channel amqp' + ch);
              for (var i = 0; i < friends.length; i++) {
                var q = friends[i].id;
                var msg = myname + ' ha creato un nuovo collage!$' + url_collage;
                ch.assertQueue(q, {
                  durable: false
                });
                ch.sendToQueue(q, new Buffer(msg));
                console.log(" [x] Sent" + msg);
              }
            });
            setTimeout(function() {
              conn.close();
            }, 500);
          });

          res.render('yourcollages', {
            url_collage: url_collage //è l'ultimo collage fatto
          });
        }
        else {
          res.send(body).end();
        }

      });

    });
  }
  else { //l'utente non ha abbastanza foto per fare il collage
    res.render('yourcollages', {
      url_collage: url_collage
    });
  }

});

router.post('/notifications', function(req, res) {
  var id = req.body.id;
  var FIREBASE_URL = 'https://collage-a1e2f.firebaseio.com/Users/' + id + '.json';
  request.get({
      url: FIREBASE_URL,
      qs: {
        auth: token
      },
      json: true, //parsa il testo di risposta nel body trasformandolo in JSON
      headers: {
        "content-type": "application/json"
      }
    },
    function(error, response, body) {
      var persona = response.body;
      var number = 0;
      var array_notifiche = [];
      var requestData = {
        "Person": {
          user: persona.Person.user,
          email: persona.Person.email,
          image: persona.Person.image,
          photos: persona.Person.photos,
          friends: persona.Person.friends,
          notifications: array_notifiche,
          number: number,
          collage: persona.Person.collage,
          collage_amici: persona.Person.collage_amici
        }
      };
      request.put({
        url: FIREBASE_URL,
        qs: {
          auth: token
        },
        json: true,
        headers: {
          "content-type": "application/json"
        },
        body: requestData
      }, function(error, response, body) {
        if (!error && response.statusCode == 200) {
          console.log('azzeramento notifiche effettuato con successo');
        }
        else console.log('errore azzeramento notifiche');
      })
    })
});

var io = server.io;
var index = 0;
var msg_notif = '';
var url_collage = '';
var amqp = require('amqplib/callback_api');
io.on('connection', function(socket) {
  socket.on('inizio', function(msg) {
    console.log(msg.id + ' connected');
    var id = msg.id;
    var array_notifiche = JSON.parse(msg.array_notifiche);
    var collage_amici = JSON.parse(msg.collage_amici);
    var FIREBASE_URL = 'https://collage-a1e2f.firebaseio.com/Users/' + id + '.json';
    amqp.connect('amqp://localhost', function(err, conn) {
      console.log('error: ' + err);
      conn.createChannel(function(err, ch) {
        ch.assertQueue(id, {
          durable: false
        });
        console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", id);
        ch.consume(id, function(msg_text) {
          var mex = msg_text.content.toString();
          msg_notif = '';
          for (var i = 0; i < mex.length; i++) {
            if (mex[i] == '$') {
              index = i + 1;
              i = mex.length;
            }
            else {
              msg_notif += mex[i];
            }
          }
          url_collage = '';
          for (i = index; i < mex.length; i++) {
            url_collage += mex[i];
          }
          socket.emit(id, msg_text.content.toString());
          request.get({
            url: FIREBASE_URL,
            qs: {
              auth: token
            },
            json: true,
            headers: {
              "content-type": "application/json"
            }
          }, function(error, response, body) {
            var persona = response.body;
            if (persona.Person.hasOwnProperty('collage_amici')) {
              var cola = persona.Person.collage_amici;
              cola.push(url_collage);
            }
            else {
              var cola = [];
              cola.push(url_collage);
            }
            if (persona.Person.hasOwnProperty('notifications')) {
              var new_notifications = persona.Person.notifications;
              new_notifications.push(msg_notif);
            }
            else {
              var new_notifications = [];
              new_notifications.push(msg_notif);
            }
            var requestData = {
              "Person": {
                user: persona.Person.user,
                email: persona.Person.email,
                image: persona.Person.image,
                photos: persona.Person.photos,
                friends: persona.Person.friends,
                notifications: new_notifications,
                number: persona.Person.number + 1,
                collage: persona.Person.collage,
                collage_amici: cola
              }
            };
            request.put({
              url: FIREBASE_URL,
              qs: {
                auth: token
              },
              json: true,
              headers: {
                "content-type": "application/json"
              },
              body: requestData
            }, function(error, response, body) {
              if (!error && response.statusCode == 200) {
                console.log('notifica inserita');
              }
              else console.log('errore inserimento notifica');
            })
          })
        }, {
          noAck: true
        });

        setTimeout(function() {
          conn.close();
          console.log("[*] Exit to %s", id);
        }, 5000);
      });
    });
  });
});

router.post('/collages', function(req, res) {
  var id = req.body.id;
  var FIREBASE_URL = 'https://collage-a1e2f.firebaseio.com/Users/' + id + '.json';
  request.get({
    url: FIREBASE_URL,
    qs: {
      auth: token
    },
    json: true, //parsa il testo di risposta nel body trasformandolo in JSON
    headers: {
      "content-type": "application/json"
    }
  }, function(error, response, body) {
    var persona = response.body;
    var string = '';
    if (!persona.Person.hasOwnProperty('collage')) {
      string = '£';
    }
    else {
      string = persona.Person.collage;
    }
    res.render('mostra_collages', {
      id: id,
      collage: string
    })
  });
});


router.post('/collages_amici', function(req, res) {
  var id = req.body.id;
  var FIREBASE_URL = 'https://collage-a1e2f.firebaseio.com/Users/' + id + '.json';
  request.get({
    url: FIREBASE_URL,
    qs: {
      auth: token
    },
    json: true, //parsa il testo di risposta nel body trasformandolo in JSON
    headers: {
      "content-type": "application/json"
    }
  }, function(error, response, body) {
    var persona = response.body;
    var string = '';
    if (!persona.Person.hasOwnProperty('collage_amici')) {
      string = '£';
    }
    else {
      string = persona.Person.collage_amici
    }
    res.render('mostra_collages', {
      collage: string
    })
  });
});


router.post('/logout', function(req, res){
  res.redirect(SITO);
})


module.exports = router;
