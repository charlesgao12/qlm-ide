const LOGIN = '~';
const STUDENT_SELECTION = '!';
const CONTENT_REPLACEMENT = '^';
const CURSOR_MOVE = '>';
const STUDENT_UNSELECTION = '@';

var _class = require('./class.js');

var ws = require("nodejs-websocket");
console.log("start ws")

//var game1 = null,game2 = null , game1Ready = false , game2Ready = false;
var student_conn = new Map();
var teacher_conn = null;
var sharing_student = null;
var ws_student = ws.createServer(function(conn){
    
    conn.on("text", function (str) {//recevied msg from student client
        console.log("stu rcv:"+str);
        var type = str.substring(0,1);

        if (type == '~'){//student login
             const jsonstr = str.substring(1);
           var student_login = JSON.parse(jsonstr);

          //console.log(req.body);
          var login_res = {'result':false, 'student':null};

          if(student_login.class_id === _class.class.class_id){//class id ok
            var students = _class.class.students;
            for (var i = 0; i < students.length; i++) {
                var stu = _class.class.students[i];
                  if(stu.student_id === student_login.student_id){//the student is in the list
                    login_res.result = true;
                    login_res.student = _class.class.students[i];                   

                    student_conn.set(student_login.student_id, conn);//update conn map
                    break;
                  }
            }
            

          }
          conn.sendText('~'+JSON.stringify(login_res));

          //res.json(login_res);

        }
        else if (type =='!'){//student return the real time content
            teacher_conn.sendText(str);//just send out student's reply

        }

        else{
            //TODO, shold check when to send the content update to teacher
            teacher_conn.sendText(str);//send the student's msg to teacher
        }


        //conn.sendText(str+" ok")
       
    })
    conn.on("close", function (code, reason) {
        console.log("ws closed",code,reason)
    });
    conn.on("error", function (code, reason) {
        console.log("ws error",code, reason)
    });
}).listen(8889);

console.log("student websocket ok");

var ws_teacher = ws.createServer(function(conn){
    teacher_conn = conn;
    conn.on("text", function (str) {
        console.log("tch rcv:"+str);

        var type = str.substring(0,1);
        console.log(type)

        if(type == '!'){//select student tab, check status and then get content if online
            const jsonstr = str.substring(1);
            student_id = JSON.parse(jsonstr).student_id;

            var stu_conn = student_conn.get(student_id);
            var student ={
                'student_id':student_id,
                'status':'offline',
                'file':'',
                'content':''
            }
            console.log('update student:',sharing_student,student_id)
            if(stu_conn == undefined){//student not connected
                conn.sendText('!'+JSON.stringify(student));
            }else{//created connection before
                
                if(sharing_student != student_id){//if same student selected, nth to do

                    var old_conn = student_conn.get(sharing_student); 

                    if(old_conn!=undefined)old_conn.sendText('@');//notify the exisitng selected student that u are not sharing any more

                    
                    stu_conn.sendText('!');//send ! for getting latest content from new selected student
                }
                
            }

            sharing_student = student_id;// need to update sharing in all cases (even the selected student is not online)

            


        }else if (type == '~'){//teacher login
             const jsonstr = str.substring(1);
           var teacher_login = JSON.parse(jsonstr);

          //console.log(req.body);
          var login_res = {'result':false, 'class':null};

          if(teacher_login.class_id === _class.class.class_id && _class.class.teacher_id === teacher_login.teacher_id){
            login_res.result=true;
            login_res.class=_class.class;
          } 

          teacher_conn.sendText('~'+JSON.stringify(login_res));
          sharing_student = null;//reset sharing_student if teacher connection was reset

          //res.json(login_res);

        }

        else{
            student_conn.get(sharing_student).sendText(str);//send teacher's msg to the active student
        }
        

        //conn.sendText(str+" ok")
        
    })
    conn.on("close", function (code, reason) {
        console.log("tch ws closed",code,reason)
    });


    conn.on("error", function (code, reason) {
        console.log("tch ws error",code, reason)
    });
}).listen(8890);



console.log("teacher websocket ok");


// app.post('/teacher_login', jsonParser, function (req, res) {
//   console.log(req.body);
//   var login_res = {'result':false, 'class':null};
//   if(req.body.class_id === _class.class.class_id && _class.class.teacher_id === req.body.teacher_id){
//     login_res.result=true;
//     login_res.class=_class.class;
//   } 

//   res.json(login_res);

// });



// app.post('/student_login', jsonParser, function (req, res) {
//   console.log(req.body);
//   var login_res = {'result':false, 'student':null};
//   if(req.body.class_id === _class.class.class_id){
//     for (var i = 0; i < _class.class.students.length; i++) {
//       var stu = _class.class.students[i];
//       if(stu.student_id === req.body.student_id){
//         login_res.result = true;
//         login_res.student = _class.class.students[i];
//         break;
//       }
//     }
//   } 

//   res.json(login_res);

// });