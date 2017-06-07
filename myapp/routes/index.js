var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    //res.render('index', { title: 'Express' });
    var option = {
        root: __dirname + "/../public/html",
        headers: {
            'x-timestamp': Date.now(),
            'x-sent': true
        }
    }
    
    var fileName = 'welcome.html';
    
    res.sendFile(fileName, option, function(err){
        if(err){
            console.log(err);
            res.status(err.status)
        }
        else{
            console.log('Sent: ', fileName);
        }
    })
});

module.exports = router;
