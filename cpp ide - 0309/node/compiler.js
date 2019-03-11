/*
const http = require('http');

const hostname = '0.0.0.0';
const port = 8888;


const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Access-Control-Allow-Origin', '*');

  //res.end('Hello, World!\n');
  if(req.method === 'POST'){
    collectReq(req,result =>{
      console.log(result);
      res.end('end of post request');
    });
  }


});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});

function collectReq(request,callback){
  const URL
}
*/

var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var cp = require('./cp.js');



const fs = require('fs');


var app = express();

app.use(cors());

var jsonParser = bodyParser.json();

var urlencodedParser = bodyParser.urlencoded({extended:false});

//app.use(bodyParser.json({ type: 'application/*+json' }))

app.post('/', jsonParser, function (req, res) {
  // create user in req.body
  console.log(req.body.fileName);
  fs.writeFile('./'+req.body.file, req.body.content,function(err){
     if(err) {
        console.log('fs failure');
        //must handle error response here
        res.json({'compileCode':-1,'compileErr':'fs failure'+err});
     }
     else {
        console.log('fs success');
        cp.compile(req.body.file,res);
     }
  });
  //res.sendStatus(200);
  //res.end("ok\n\r");
 //res.send('ok lar');


 //res.json({"abc":"ok"});
});






app.listen(8888,function(){
  console.log('started on 8888')
});
