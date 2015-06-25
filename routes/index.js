var express = require('express');
var router = express.Router();
var app = require('express');

/* GET home page. */

router.get('/', function(req, res) {
  res.render('index', { title: "lala" });
});



module.exports = router;
