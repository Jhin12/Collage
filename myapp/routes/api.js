var express = require('express');
var router = express.Router();
var request = require('request');
var jsonwebtoken = require("jsonwebtoken");


router.get('/collage', function(req, res){
   var id = req.body.id;
   var FIREBASE_URL = 'https://collage-a1e2f.firebaseio.com/Users/' + id + '.json';
   request.get({
       url: FIREBASE_URL,
       json: true,
       headers: {
           "content-type": "application/json"
       }
       
   }, function(error, response, body){
        if(!error && response.statusCode==200){
            var collage = response.body.Person.collage;
            res.json({collage: collage});
            
        }
        else{
            console.log(error);
            res.json({status:error});
        }
    });
});

router.get('/collage_amici', function(req, res){
   var id = req.body.id;
   var FIREBASE_URL = 'https://collage-a1e2f.firebaseio.com/Users/' + id + '.json';
   request.get({
       url: FIREBASE_URL,
       json: true,
       headers: {
           "content-type": "application/json"
       }
       
   }, function(error, response, body){
        if(!error && response.statusCode==200){
            var collage_amici = response.body.Person.collage_amici;
            res.json({collage_amici: collage_amici});
            
        }
        else{
            console.log(error);
            res.json({status:error});
        }
    });
});


module.exports = router;
