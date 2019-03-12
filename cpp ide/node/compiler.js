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

  function writeSrcFile(){
    fs.writeFile(req.body.people_id+'/'+req.body.file, req.body.content,function(err){
       if(err) {
          console.log('fs failure');
          //must handle error response here
          res.json({'compileCode':-1,'compileErr':'fs failure'+err});
       }
       else {
          console.log('fs success');
          cp.compile(req.body.people_id+'/'+req.body.file,req.body.people_id+'-'+req.body.file+'.out',res);
       }
    });
  }


  // create user in req.body
  console.log(req.body);
  fs.access(req.body.people_id,fs.constants.F_OK|fs.constants.W_OK, (err)=>{
    if (err){
      if(err.code === 'ENOENT'){
        console.log(req.body.people_id+' not exist, create it');
        fs.mkdir(req.body.people_id, { recursive: true }, (err) => {
          if (err) {res.json({'compileCode':-1,'compileErr':'fs failure'+err});}
          else{
            //created
            writeSrcFile();

          }
        });
      }else{//other error
        res.json({'compileCode':-1,'compileErr':'fs failure'+err});
      }
      
      //console.log(
      //"${req.body.people_id} ${err.code === 'ENOENT' ? 'does not exist' : 'is read-only'}");

    }else{
      console.log('folder exists, and it is writable');
      writeSrcFile();

    }
  });
  
  //res.sendStatus(200);
  //res.end("ok\n\r");
 //res.send('ok lar');


 //res.json({"abc":"ok"});
});


app.post('/getFiles', jsonParser, function (req, res) {

  console.log(req.body);

  var people_id =req.body.people_id;
  console.log(people_id)

  fs.readdir(people_id,function(err, files){
    console.log(people_id, files);
    req.body.files = files;
    res.json(req.body);
  })

});





app.post('/readFile', jsonParser, function (req, res) {

  console.log(req.body);

  var file =req.body.people_id+"/"+req.body.file;

  fs.readFile(file,function(err, data){
    //console.log(file, files);
    req.body.content = String(data);
    res.json(req.body);
  })

});



app.listen(8888,function(){
  console.log('started on 8888')
});
