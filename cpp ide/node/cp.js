const { spawn } = require('child_process');
var runResult = {
   'compileCode':-1,
   'compileOut':'',
   'compileErr':'',
   'runCode':-1,
   'runOut':'',
   'runErr':''

};
function onCompiled(fileName,res){
  var ls1 = spawn('./'+fileName, []);// abc.cpp -o abc.out

  ls1.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
    //console.log(typeof data);
    runResult.runOut= String(data);  

  });

  ls1.stderr.on('data', (data) => {
    console.log(`stderr: ${data}`);
    runResult.runErr=String(data);
  });

  ls1.on('close', (code) => {
    console.log(`code:${code}`);
    runResult.runCode = code;
 console.log('out:'+runResult.runOut);
    res.json(runResult);
    
  });
}

function resetRunResult(){
runResult = {
   'compileCode':-1,
   'compileOut':'',
   'compileErr':'',
   'runCode':-1,
   'runOut':'',
   'runErr':''

};


}

module.exports={
//compile('abc.cpp');

compile: function(fileName,res){
  resetRunResult();
  var ls = spawn('g++', [fileName,'-o',fileName+'.out']);// abc.cpp -o abc.out

  ls.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
    runResult.compileOut = String(data);

  });

  ls.stderr.on('data', (data) => {
    console.log(`stderr: ${data}`);
    runResult.compileErr = String(data);
  });

  ls.on('close', (code) => {
    console.log(`code:${code}`);
    runResult.compileCode = code;
    if(code === 0){
      onCompiled(fileName+'.out',res);
    }
    else{//compile failure, directly return result and not run
	res.json(runResult);
    }
  });  
}


//onCompiled();

};
