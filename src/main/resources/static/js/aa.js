$(function() {
	console.log("get")

	let webSocket;
	let msg =document.getElementById("msg");
	let log =document.getElementById("log");
	let uid =document.getElementById("uid");

	$("#start").on("click", function() {
		connect();
	})
	$("#send").on("click",function(){
		let message ={
			message:msg.value,
			uid:uid.value,
		}
		webSocket.send(JSON.stringify(message));
		msg.value="";
	})
	start.style.display = "block";
	msgDiv.style.display = "none";

	function connect() {
		let roomid =$("#room").val();
		console.log("connecting....")
		webSocket = new WebSocket("ws://localhost:8080/websocket/"+roomid);
		webSocket.roomId=roomid;
		$("#room").prop("disabled",true);$("#uid").prop("disabled",true);
		webSocket.onerror = function(event) {
			console.log("onerror")
		};
		webSocket.onopen = function(event) {
			console.log("open")
			start.style.display = "none";
			msgDiv.style.display = "block";
		};
		webSocket.onclose = function(event) {
			console.log("close");
			start.style.display = "block";
			msgDiv.style.display = "none";
		}
		webSocket.onmessage =function(event){
			//event.data
			let ud =$("#uid").val();
			let obj=JSON.parse(event.data);
			if(obj.uid==ud){
				log.innerHTML+="<span>"+obj.uid+":"+obj.message	+"</span>"+"<br>"
			}else{
				log.innerHTML+="<span style='float: right;'>"+obj.uid+":"+obj.message	+"</span>"+"<br>"
			}

		}
	}
})


/*

 socket.send(JSON.stringify({ action: 'getRoomForUser', session: session }));
};

*/