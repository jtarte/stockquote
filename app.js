const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

// define the server 
var app = express();
const port = 3000
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// define the list of inital stocks 
var symbolList = ['AMZN','AAPL','FB','GOOG','IBM','MSFT']

// Display the stock quotes list
function getQuotes(res,err_msg) {
  var ec = 0;
  if (err_msg != ''){
    ec=2
  } 
  getQuotesList(symbolList).then(data=> {
      res.render('index',{'result':data,'err_code':ec,'err_msg':err_msg})
    }   
  )
}

// Get a list of quotes
const getQuotesList = stockList => new Promise((resolve, reject) => {
  if (!stockList) return reject(Error('Stock symbol list required'));
  if (!Array.isArray(stockList)) return reject(Error('Invalid argument type. Array required.'));
  
  const list = [...stockList];
  if (!list.length || list.length < 1) return Promise.resolve([]);
  
  const promises = list.map(getQuote);
  return resolve(Promise.all(promises));
});

// get a quote
const getQuote = ns => new Promise((resolve,reject) => {
  if (!ns) return resolve(Error('Stock symbol required'));
  if (typeof ns !== 'string') return resolve(Error(`Invalid argument type. Required: string. Found: ${typeof ns}`));
    
  const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${ns}`;
  axios.get(url).then(res => {
    const { data } = res;
        if (!data || !data.quoteResponse || !data.quoteResponse.result || data.quoteResponse.result.length === 0) {
            return resolve(new Error(`Error retrieving info for symbol ${ns}`));
        }
        return resolve(data.quoteResponse.result[0]);
    }).catch(err => reject(err));
})

//handling the home page 
app.get('/', function(_req, res){
  getQuotes(res,'')
});

//handling the post to add an new quotes
app.post("/", function(req, res){
  var ns=req.body.symbol;
  getQuote(ns).then((result, err) =>{
    if (err == 'undefined' ){
      getQuotes(res,'error during the quote query')
    }
    else {
      if (result instanceof Error){
        getQuotes(res,result.message)
      }
      else
      {
        symbolList.push(ns)
        getQuotes(res,'')
      }
    }
  })
});

//Start the server
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})