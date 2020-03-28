const express = require('express');
const yahooFinance = require('yahoo-finance');
const bodyParser = require('body-parser');


var app = express();
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var symbolList = ['AMZN','AAPL','FB','GOOG','IBM','MSFT']


function getQuotes(res,err_msg) {
  yahooFinance.quote({
    symbols: symbolList,
    modules: [ 'price', 'summaryDetail' ] // see the docs for the full list
    }, function (err, quotes){
      if(err) {
        res.render('index',{err_code: 1, err_msg:"error occur during the quote interogation. Please retry later."})
      }
      else
      {
        if (err_msg == undefined)
        {
          res.render('index',{result:quotes, err_code:0});
        }
        else
        {
          res.render('index',{result:quotes, err_code:2,err_msg:err_msg});
        }
      }
    })
}

function checkSymbol(sb,callback){
  yahooFinance.quote({
    symbol: sb,
    modules: ['summaryProfile' ] // see the docs for the full list
  }, function (err, quotes) {
    if(err) {
       callback(false);
    }
    else
    {
      callback(true);
    }
  })
}

app.get('/', function(req, res){
  //res.send("Hello from Appsody!");
  getQuotes(res)
});

app.post("/", function(req, res){
  ns=req.body.symbol;
  checkSymbol(ns, function(result){
    if(result){
      symbolList.push(ns)
      getQuotes(res)
    }else{
      console.error("Symbol "+ns+" not found.");
      err_msg = "symbol "+ns+" not found. Please verify your value."
      getQuotes(res, err_msg)
    }
  })
});
 
module.exports.app = app;
