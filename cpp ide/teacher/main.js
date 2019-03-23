const LOGIN = '~';
const LOGOUT = '`';
const STUDENT_SELECTION = '!';
const CONTENT_REPLACEMENT = '^';
const FILE_REPLACEMENT = '-';
const CURSOR_MOVE = '>';
const STUDENT_UNSELECTION = '@';
const ALREADY_LOG = 1;
const LOGIN_TEXT = '登录'
const LOGOUT_TEXT = '登出'

var ws = null;

var displaying = null;//null means the teacher has not login, once login, will be changed ot Teacher_tab

var teacher={
				
				'file':'',
				'status':'teacher',
				
				'content':''
			};


var display = undefined;


$(document).ready(
	function(){
		$("button#Login").attr("disabled",true);

		//change heading msg to be error msg
		function changeToErrorMsg(msg){
			$("#Message").removeClass("alert alert-primary");
			$("#Message").addClass("alert alert-danger");
			$("#Message").html(msg);
		}
		//change heading msg to be notice msg
		function changeToNoticeMsg(msg){			
			$("#Message").removeClass("alert alert-danger");	
			$("#Message").addClass("alert alert-primary");		
			$("#Message").html(msg);
		}

		function changeButToLogout(){
			$("button#Login").removeClass("btn btn-success");
			$("button#Login").addClass("btn btn-warning");
			$("button#Login").text(LOGOUT_TEXT);

		}
		function changeButToLogin(){
			$("button#Login").removeClass("btn btn-warning");
			$("button#Login").addClass("btn btn-success");
			$("button#Login").text(LOGIN_TEXT);
		}
		function loginResult(data){

			if(data.result){
				displaying = "Teacher_tab";
				changeToNoticeMsg("Hello "+ data.class.teacher_id);
				changeButToLogout();
				var students = data.class.students;
				for (var i = 0; i < students.length; i++) {
					var disabled = '';
					//if(students[i].status=='offline'){
					//	disabled = 'disabled';
					//}
					var element = '<li class="nav-item"><a class="nav-link" id="'+students[i].people_id+'" href="javascript:display(\''+students[i].people_id+'\')">'+students[i].people_id+ '</a></li>';
					$("#Tabs").append(element);
				}
			}else{
				if(data.errorCode == ALREADY_LOG){
					changeToErrorMsg("这个帐号已经登录，请先关闭已登录窗口再重试");
				}else{
					changeToErrorMsg("登录失败，请重试");

				}
				//changeToErrorMsg("登录失败，请重试");
				$("button#Login").text(LOGIN_TEXT);
				
			}
			$("button#Login").attr("disabled",false);
			//$("button#Login").html($("button#Login").val());

		}
		



		//$("button#Share").attr("disabled",true);
		var cppEditor = CodeMirror.fromTextArea(document.getElementById("cpp-code"), {
		        lineNumbers: true,
		        matchBrackets: true,
		        mode: "text/x-c++src"
		      });

		var sharing = false;//set to true when ws is open, only allow sharing when this is true
		var stopWatch = false;

		//update the global display function var

		display = function display(tab_id){
			console.log('change tab',displaying, tab_id)
			$(".nav-link.active").attr("class","nav-link");//deactivate the existing selection
			$("#"+tab_id).attr("class","nav-link active");//activate the new selection

			if(displaying == "Teacher_tab"){//previously displaying teacher tab, save the content
				//save teacher content:
				teacher.file = $("#file").val();
				teacher.content = cppEditor.getValue();
			}


			if(tab_id == "Teacher_tab"){//jump to teacher tab
				//$("#teacher_id").val();
				updateContent(teacher);
				//still need to send msg to ws server to notify changing of the tab
				ws.send("!"+JSON.stringify({'people_id':null}));

			}else{	
					ws.send("!"+JSON.stringify({'people_id':tab_id}));
				//	displaying = tab_id;


			}
			displaying = tab_id;

		}

		function updateContent(content_obj){
			console.log(content_obj)
			sharing = false;			
			if(content_obj.status == 'teacher'){//select teacher tag
				changeToNoticeMsg("Hello "+ $("#teacher_id").val());
			}else if(content_obj.status == 'sharing'){
				sharing = true;
				changeToNoticeMsg("现在控制的是"+content_obj.people_id+"的程序")
			}else{			
				changeToErrorMsg(content_obj.people_id+"还没有进入课室")
			}
			stopWatch = true;
			//if(content_obj.people_id == )
			cppEditor.setValue(content_obj.content);
			$("#file").val(content_obj.file);
			stopWatch = false;


		}

		ws = function(){
			if ("WebSocket" in window)
			            {
			               //alert("您的浏览器支持 WebSocket!");
			               
			               // 打开一个 web socket
			               var ws = new WebSocket("ws://qianlima.love:8890");
			                
			               ws.onopen = function()
			               {
			               		//sharing = true;
			                  console.log("teacher ws open");
			                  $("button#Login").attr("disabled",false);
			               };
			                
			               ws.onmessage = function (evt) 
			               { 
			                  //var received_msg = evt.data;
			                  console.log("teacher ws received:"+evt.data);

			                  //if (mine) return
			                  /*
			                  const index = op.length == 2 ? op[0] : 0
			                  const data = op.length === 2 ? op[1] : op[0]

			                  // insert operation if the op is of the form
			                  // op [<index>, <string>]
			                  if (typeof data === 'string') {
			                      const pos = ed.posFromIndex(index)

			                      sharing = false
			                      ed.replaceRange(data, pos, pos)
			                      sharing = true

			                  // otherwise we assume its a deletion of the form
			                  // op [<index>, { d: <char count> }]
			                  } else {
			                      const delCt = data.d
			                      const stPos = ed.posFromIndex(index)
			                      const edPos = ed.posFromIndex(index + delCt)
			                      const range = { start: stPos, end: edPos }
			                  */

			                  var  data = evt.data;
			                  const type = data.substring(0,1);
			                  if(type =='^'){//replace
			                  	var firstTagIndex = data.indexOf(' ');//find the first separation tag
			                  	const stPosIndex = parseInt(data.substring(1,firstTagIndex));//this is the index
			                  	const stPos = cppEditor.posFromIndex( stPosIndex);//this is the position object
			                  	data = data.substring(firstTagIndex+1);//trim first tag
			                  	
			                  	firstTagIndex = data.indexOf(' ');//find another separation tag
			                  	const delLength = parseInt(data.substring(0, firstTagIndex));
			                  	const edPos = cppEditor.posFromIndex(stPosIndex + delLength);//the end position
			                  	//console.log('delLength', delLength)

			                  	var replacement = '';
			                  	if(firstTagIndex < data.length){
			                  		replacement = data.substring(firstTagIndex+1)
			                  	}

			                  	console.log('replace',replacement,stPos,edPos)

			                  	stopWatch = true
			                  	cppEditor.replaceRange(replacement, stPos, edPos)
			                  	stopWatch = false	

			                  }

			                  else if (type == FILE_REPLACEMENT){
			                  	stopWatch = true
			                  	$("#file").val(data.substring(1));
			                  	stopWatch = false
			                  }

			                  else if(type =='>'){//cursor moved

			                  }else if(type =='~'){//handle login result
			                  	loginResult(JSON.parse(data.substring(1)));
			                  }
			                  else if (type =='!') {
			                  	updateContent(JSON.parse(data.substring(1)));

			                  }

			                  
			                  //}

			               };
			                
			               ws.onclose = function()
			               { 
			                  // 关闭 websocket
			                 console.log("teacher ws closed");
			               };

			               return ws;
			            }
			            
			else
			            {
			               // 浏览器不支持 WebSocket
			               alert("您的浏览器不支持 WebSocket!");
			               return null;
			            }
		}();

		cppEditor.on('change', (cppEditor, chg) => {//when the editor content changed (add or delete)
            if (sharing && !stopWatch) {
            	const stindex = cppEditor.indexFromPos(chg.from)
            	const delta = chg.removed.join('\n').length
            	const addedText = chg.text.join('\n')
            	//console.log(stindex,delta,addedText);
            	//console.log('onchange',stopWatch)
            	
            	ws.send("^"+stindex+" "+delta+" "+addedText);//make it as simple as possible, so do not use JSON.in the format of "0 1 ttt":0-stindex;1-delta;ttt-addedText
            
            	
            }
            
            //if (delta) sharedoc.submitOp([stindex, { d: delta }])
            //if (addedText) sharedoc.submitOp([stindex, addedText])
        });
        // Update the range in other editors when the selection changes
        cppEditor.on('cursorActivity', e => {//when the cursor changed
        	if(sharing){
        		const stPos = cppEditor.getCursor('start')
        		const edPos = cppEditor.getCursor('end')
        		const hdPos = cppEditor.getCursor('head')
        		const stindex = cppEditor.indexFromPos(stPos)
        		const edindex = cppEditor.indexFromPos(edPos)
        		const hdindex = cppEditor.indexFromPos(hdPos)
        		const prefixed = hdindex === stindex && stindex !== edindex
        		//console.log(stindex,edindex,prefixed);
        		ws.send(">"+stindex+" "+edindex+" "+prefixed);//make it as simple as possible, so do not use JSON.in the format of "0 1 false":0-stindex;1-edindex;false-prefixed
            
        		//io.emit('anchor-update', { stindex, edindex, prefixed })
        	}
            
        });



		$("button#Login").click(function(){
			if($("button#Login").text() == LOGIN_TEXT){
				$("button#Login").attr("disabled",true);
				$("button#Login").text("登录中……");
				var teacher_login ={
					'teacher_id':$("#teacher_id").val(),
					'class_id':$("#class_id").val()
					//'file':$("#file").val()
				};
				console.log(teacher_login);

				ws.send('~'+JSON.stringify(teacher_login));

			}

			else if ($("button#Login").text() == LOGOUT_TEXT){
				ws.send(LOGOUT+JSON.stringify({'people_id':$("#teacher_id").val()}));
				//$("button#Login").text(LOGIN_TEXT);
				changeButToLogin();

			}



			


			// $.ajax({
			// 	type:"POST",
			// 	url: "http://qianlima.love:8888/teacher_login",
			// 	data: JSON.stringify(teacher_login),
			// 	contentType:"application/json; charset=utf-8",
				
			// 	dataType:"json",
			// 	success: function(data){
			// 		//alert('ok');
			// 		console.log(data);
			// 		if(data.result){
			// 			changeToNoticeMsg("Hello "+ teacher_login.teacher_id);
			// 			var students = data.class.students;
			// 			for (var i = 0; i < students.length; i++) {
			// 				var disabled = '';
			// 				if(students[i].status=='offline'){
			// 					disabled = 'disabled';
			// 				}
			// 				var element = '<li class="nav-item"><a class="nav-link '+disabled+'" id="'+students[i].people_id+'" href="javascript:display(\''+students[i].people_id+'\')">'+students[i].people_id+ '</a></li>';
			// 				$("#Tabs").append(element);
			// 			}
			// 		}else{
			// 			console.log(data.result);
			// 			changeToErrorMsg("登录失败，请重试");
						
			// 		}

                                        
			// 		//resume button
			// 		$("button#Login").attr("disabled",false);
			// 		$("button#Login").html($("button#Login").val());
					
					
			// 	},
			// 	failure: function(err){
					
			// 		console.log(err);
			// 		changeToErrorMsg("登录失败，请重试");
			// 		$("button#Login").attr("disabled",false);
			// 		$("button#Login").html($("button#Login").val());
			// 	}
			// });

		});

		//return the people_id's id
		//if it's teacher, should return teacher's id not teacher tab
		function getAuthor(){

			var people_id = displaying;

			if(displaying == 'Teacher_tab'){
				people_id =  $("#teacher_id").val();
			}
			return people_id;



		}

		function getSrcJsonStr(){
			var src ={
				'people_id':getAuthor(),
				'file':$("#file").val(),
				'status':'sharing',
				'content':cppEditor.getValue()
			};
			return JSON.stringify(src);

		}

		

		$("button#Run").click(function(){
			$("button#Run").attr("disabled",true);
			$("button#Run").text("运行中……");


			// var srcCode = {
			// 	"people_id":"charles",
			// 	"fileName":"abc.cpp",
			// 	"content":cppEditor.getValue()
			// };
			// console.log(JSON.stringify(srcCode));



			$.ajax({
				type:"POST",
				url: "http://qianlima.love:8888/",
				data: getSrcJsonStr(),
				contentType:"application/json; charset=utf-8",
				
				dataType:"json",
				success: function(data){
					//alert('ok');
					console.log(data);
                                        var result = 'Compile result: '+ data.compileCode +'\n\r'+
                                                     data.compileOut +'\n\r'+
                                                     data.compileErr +'\n\r' +
                                                     'Run result: ' + data.runCode + '\n\r' +
                                                     data.runOut+ '\n\r' +
                                                     data.runErr;

					var compResult = '编译结果: '+data.compileCode+'\n\r'+
								data.compileOut+"\n\r"+
								data.compileErr;
					var runResult = '运行结果: '+data.runCode+'\n\r'+
								data.runOut+"\n\r"+
								data.runErr;
                    
                    if(data.compileCode == 0){
                    	//alert(compResult);
                    	$("#CompileOk").show();
                    	$("#CompileErr").hide();
                    	
                    	$("#CompileOk").text(compResult);

                    }else{
                    	$("#CompileOk").hide();
                    	$("#CompileErr").show();

                    	$("#CompileErr").text(compResult);

                    }

                    if(data.runCode == 0){
                    	$("#RunOk").show();
                    	$("#RunErr").hide();

                    	$("#RunOk").text(runResult);

                    }
                    else{
                    	$("#RunOk").hide();
                    	$("#RunErr").show();

                    	$("#RunErr").text(runResult);

                    }

                                        
					//resume button
					$("button#Run").attr("disabled",false);
					$("button#Run").html($("button#Run").val());
					
					
				},
				failure: function(err){
					alert(err);
					//resume button
					$("button#Run").attr("disabled",false);
					$("button#Run").text("Run");
				}
			});

			
		});



		
		
	}

);
