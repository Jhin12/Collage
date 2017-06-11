var request = require('request');
var crypto = require('crypto');
var key = require('../key');


var APP_ID_FB = key.app_id_fb;
var APP_SECRET_FB = key.app_secret_fb;

var URL_OAUTH = 'https://graph.facebook.com/v2.8/oauth/access_token';
var URL = 'https://www.facebook.com/dialog/oauth?client_id=' + APP_ID_FB + '&redirect_uri=https://collage-jhin.c9users.io/users/FBLogin/confirm&scope=email,user_location,user_hometown,user_tagged_places,user_photos,user_friends,publish_actions,user_posts';

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

//faccio il login con facebook
var callback_0 = function(req, res, next) {
    if (!req.query.hasOwnProperty('code')) {
        res.redirect(URL);
    }
    else {
        var code = req.query.code;
        request.get({
            url: URL_OAUTH,
            qs: {
                client_id: APP_ID_FB,
                client_secret: APP_SECRET_FB,
                redirect_uri: 'https://collage-jhin.c9users.io/users/FBLogin/confirm',
                code: code
            }
        }, function(error, response, body) {
            if (!error && response.statusCode == 200) {
                var element = JSON.parse(body);
                console.log('expires_in = ' + element.expires_in);
                req.ACCESS_TOKEN = element.access_token;
                req.APPSECRET_PROOF = crypto.createHmac('SHA256', APP_SECRET_FB).update(req.ACCESS_TOKEN).digest('hex');

                var cipher_accessToken = crypto.createCipher(ALGORITHM, CRYPTO_PASS);
                req.crypted_accessToken = cipher_accessToken.update(req.ACCESS_TOKEN, 'utf8', 'hex');
                req.crypted_accessToken += cipher_accessToken.final('hex');

                var cipher_appsecretProof = crypto.createCipher(ALGORITHM, CRYPTO_PASS);
                req.crypted_appsecretProof = cipher_appsecretProof.update(req.APPSECRET_PROOF, 'utf8', 'hex');
                req.crypted_appsecretProof += cipher_appsecretProof.final('hex');
                //  res.redirect('https://collage-jhin.c9users.io');
                next();

            }
            else {
                console.log("errore callback 0");
                res.send(body).end();
            }
        })
    }
};

//prendo le immagini da facebook salvandole temporaneamente in req

var callback_1 = function(req, res, next) {
    req.PHOTOS = [];
    request.get({
        url: 'https://graph.facebook.com/v2.8/me/photos?limit=75',
        qs: {
            fields: "images,place",
            access_token: req.ACCESS_TOKEN,
            appsecret_proof: req.APPSECRET_PROOF
        }
    }, function(error, response, body) {
        //  console.log('error:', error); // Print the error if one occurred
        // console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
        //  console.log('body:', body); // Print the HTML for the Google homepage
        if (!error && response.statusCode == 200) {
            var array = JSON.parse(body).data;
            for (var i = 0; i < array.length; i++) {
                req.PHOTOS.push(array[i]);
            }
        }
        else {
            res.send(body).end();
            console.log("errore callback 1");
        }
        next();

    })

};
//prendo altri campi da facebook salvandoli temporaneamente in req

var callback_2 = function(req, res, next) {
    request.get({
        url: 'https://graph.facebook.com/v2.6/me',
        qs: {
            fields: "name, first_name, last_name, email, picture.width(200).height(200), friends",
            access_token: req.ACCESS_TOKEN,
            appsecret_proof: req.APPSECRET_PROOF
        }
    }, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            req.USERNAME = JSON.parse(body).name;
            req.FIRSTNAME = JSON.parse(body).first_name;
            req.LASTNAME = JSON.parse(body).last_name;
            req.ID = JSON.parse(body).id;
            req.EMAIL = JSON.parse(body).email;
            req.IMAGE = JSON.parse(body).picture.data.url;
            if (JSON.parse(body).hasOwnProperty('friends') && JSON.parse(body).friends.hasOwnProperty('data')) {
                req.FRIENDS = JSON.parse(body).friends.data;
            }
            else {
                req.FRIENDS = [];
            }
            //var cipher = crypto.createCipher(ALGORITHM, CRYPTO_PASS_RABBIT);
            //req.crypted_id = cipher.update(JSON.parse(body).id, 'utf8', 'hex');
            //req.crypted_id += cipher.final('hex');
            next();
        }
        else {
            console.log("errore callback 2");
            res.send(body).end();
        }
    })
};



var callback_3 = function(req, res, next) {
    var FIREBASE_URL = 'https://collage-a1e2f.firebaseio.com/Users/' + req.ID + '.json';
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
        if (!error && response.statusCode == 200) {
            var persona = response.body;
            if (persona == null) {
                req.NOTIFICATIONS = [];
                req.number = 0;
            }
            else if (persona.Person.hasOwnProperty('notifications')) {
                req.NOTIFICATIONS = persona.Person.notifications;
                req.number = persona.Person.number;
            }
            else {
                req.NOTIFICATIONS = [];
                req.number = 0;
            }
            next();
        }
        else {
            console.log("errore callback 3");
            res.send(body).end();
        }
    })
};

//funzione per i collages

var callback_4 = function(req, res, next) {
    var FIREBASE_URL = 'https://collage-a1e2f.firebaseio.com/Users/' + req.ID + '.json';
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
        if (!error && response.statusCode == 200) {
            var persona = response.body;
            if (persona == null) {
                req.COLLAGE = [];
            }
            else if (persona.Person.hasOwnProperty('collage')) {
                req.COLLAGE = persona.Person.collage;
            }
            else {
                req.COLLAGE = [];
            }
            next();
        }
        else {
            res.send(body).end();
        }
    })
};

var callback_5 = function(req, res, next) {
    var FIREBASE_URL = 'https://collage-a1e2f.firebaseio.com/Users/' + req.ID + '.json';
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
        if (!error && response.statusCode == 200) {
            var persona = response.body;
            if (persona == null) {
                req.COLLAGE_AMICI = [];
            }
            else if (persona.Person.hasOwnProperty('collage_amici')) {
                req.COLLAGE_AMICI = persona.Person.collage_amici;
            }
            else {
                req.COLLAGE_AMICI = [];
            }
            next();
        }
        else {
            res.send(body).end();
        }
    })
};


//salvo i dati presi dalle callback precedenti in firebase

var callback_6 = function(req, res, next) {
    var FIREBASE_URL = 'https://collage-a1e2f.firebaseio.com/Users/' + req.ID + '.json';
    var requestData = {
        "Person": {
            user: req.USERNAME,
            email: req.EMAIL,
            image: req.IMAGE,
            photos: req.PHOTOS,
            friends: req.FRIENDS,
            notifications: req.NOTIFICATIONS,
            number: req.number,
            collage: req.COLLAGE,
            collage_amici: req.COLLAGE_AMICI
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
        //console.log('error:', error); // Print the error if one occurred
        //console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
        //  console.log('body:', body); // Print the HTML for the Google homepage
        if (!error && response.statusCode == 200) {
            var profile = {
                id: req.ID
            };
            var TOKEN = jsonwebtoken.sign(profile, SECRET, {
                expiresIn: 1800
            }); //1800s = 30 min
            res.render("home", {
                name: req.USERNAME,
                first_name: req.FIRSTNAME,
                last_name: req.LASTNAME,
                email: req.EMAIL,
                photo: req.IMAGE,
                photos: JSON.stringify(req.PHOTOS),
                friends: JSON.stringify(req.FRIENDS),
                id: req.ID,
                at: req.crypted_accessToken,
                asp: req.crypted_appsecretProof,
                notifications: JSON.stringify(req.NOTIFICATIONS),
                number_notifications: req.number,
                token: TOKEN,
                collage_amici: JSON.stringify(req.COLLAGE_AMICI)
            });
        }
        else {
            res.send(body).end();
        }

    })
};

var obj_login = {
    callback_0: callback_0,
    callback_1: callback_1,
    callback_2: callback_2,
    callback_3: callback_3,
    callback_4: callback_4,
    callback_5: callback_5,
    callback_6: callback_6
};

module.exports = obj_login;
