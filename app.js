var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var xlsxj = require("xlsx-to-json");
var fs = require('fs'), obj, tempdata;
var Converter=require("csvtojson").core.Converter;


var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();
var debug = require('debug')('bmtest');

//server
app.set('port', process.env.PORT || 3000);

var server = app.listen(app.get('port'), function() {
  debug('Express server listening on port ' + server.address().port);
});

//#####################################################################################
// Scans datapath and converts files into json, uploads them to the cloudant database
//#####################################################################################
//DB connection is established
var me ="your_username";
var pw = "your_password";
var cloudant = require('cloudant')({account:me, password:pw});


//variables for the test and the disease db
var testdb = cloudant.use("testdata");
var ddb = cloudant.use("disease_data");

// data parsing
// ################# This path must be changed to a new one as soon as
// there is a new source for the data ############
var datapath = "path_to_your_data"

//get database content
ddb.list(function(err, body) {
  if (!err) {

      // read the datapath
      fs.readdir(datapath, function(e,r){

      // iterate through the items and convert/ upload them
        r.forEach(function(item){

         // destroy already existing documents
         body.rows.forEach(function(doc) {
           if(doc.id == item){
             ddb.destroy(item, doc.value.rev, function(err, body) {
              if (!err)
                console.log(item + "destroyed!");
            });
           }
         });

         // ########## first for Excel ###########
         if (item.indexOf(".xlsx") > -1 && item.indexOf(".xlsx.json") == -1 ){

           //take items and convert them into json
           xlsxj({
              input: datapath + "/" + item,
              output: datapath + "/JSON/" + item + ".json"
            }, function(err, result) {
              if(err) {
                console.error(err);
              }else {

                // Read the file and send to the callback
                fs.readFile(datapath + "/JSON/" + item + ".json", handleFile);

                // Callback function for the data
                function handleFile(err, data) {
                    if (err) throw err
                    else{
                      obj = JSON.parse(data);

                      ddb.insert({"_id": item, "data":obj}, function(error, result){
                        if(error) {
                          console.error(error);
                        }else console.log(item + "uploaded");
                      })
                    }
                }
              }
            });

            // ############### Then for CSV ###############
            }else if (item.indexOf(".csv") > -1 && item.indexOf(".csv.json") == -1 ) {

              var fileStream=fs.createReadStream(datapath + "/" + item);
              //new converter instance
              var csvConverter=new Converter({constructResult:true});

              //end_parsed will be emitted once parsing finished
              csvConverter.on("end_parsed",function(jsonObj){

                // put it in the database
                ddb.insert({"_id": item, "data":jsonObj}, function(error, result){
                  if(error) {
                    console.error(error);
                  }else console.log(item + "uploaded");
                })
              });

              //read from file - not sure if that is necessary - I lave it for now
              fileStream.pipe(csvConverter);
            }
         });
      });
  }
});


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
module.exports.person = "b";
