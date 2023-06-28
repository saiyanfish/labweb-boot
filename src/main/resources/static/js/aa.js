$(function () {

    let receivedChunks = [];   //存放多個blob
    let totalChunks = 0;     //
    let receivedChunkCount = 0;
    console.log("get");
    let imagedata = "";
    let webSocket;
    let msg = document.getElementById("msg");
    let log = document.getElementById("log");
    let uid = document.getElementById("uid");
    let blobContainer = [];

    function dataURItoBuffer(dataURI) {
        let byteString = atob(dataURI.split(",")[1]);
        let buffer = new ArrayBuffer(byteString.length);
        let view = new Uint8Array(buffer);

        for (let i = 0; i < byteString.length; i++) {
            view[i] = byteString.charCodeAt(i);
        }

        return buffer;
    }

    $('#fileInput').change(function (event) {

        let file = event.target.files[0];
        console.log('Selected file:', file);
        let img = '';
        let reader = new FileReader();

        reader.onload = function (event) {
            let imageData = event.target.result;
            $("#imageElement").attr("src", imageData);

            imagedata = dataURItoBuffer(imageData);
        };
        reader.readAsDataURL(file);
    });

    $("#start").on("click", function () {
        connect();
    });

    $("#send").on("click", function () {
        if (imagedata === "") {
            let message = {
                message: msg.value,
                type: "text",
                uid: uid.value,
            };
            webSocket.send(JSON.stringify(message));
            msg.value = "";
            imagedata = "";
        } else {
            console.log(imagedata);
            let chunkSize = 8192;
            let totalChunks = Math.ceil(imagedata.byteLength / chunkSize);
            let currentChunk = 0;

            while (currentChunk < totalChunks) {
                let start = currentChunk * chunkSize;
                let end = start + chunkSize;
                let chunk = imagedata.slice(start, end);
                webSocket.send(chunk);
                if(currentChunk===(totalChunks-1)){
                    let message ={
                        type: "image",
                        uid: uid.value,
                    }
                    webSocket.send(JSON.stringify(message));
                }
                currentChunk++;
            }


            msg.value = "";
            imagedata = "";
        }
    });

    let start = document.getElementById("start");
    let msgDiv = document.getElementById("msgDiv");

    start.style.display = "block";
    msgDiv.style.display = "none";

    function connect() {
        let roomid = $("#room").val();

        console.log("connecting....");
        webSocket = new WebSocket("ws://localhost:8080/websocket/" + roomid);
        webSocket.roomId = roomid;
        $("#room").prop("disabled", true);
        $("#uid").prop("disabled", true);
        webSocket.onerror = function (event) {
            console.log("onerror");
        };
        webSocket.onopen = function (event) {
            console.log("open");
            start.style.display = "none";
            msgDiv.style.display = "block";
        };
        webSocket.onclose = function (event) {
            console.log("WebSocket：" + event.code + "，原因：" + event.reason);
            start.style.display = "block";
            msgDiv.style.display = "none";
        };
        webSocket.onmessage = function (event) {

            let ud = $("#uid").val();
            console.log("Received data:", event.data);
            if (typeof event.data === "string") {

                try {
                    let obj = JSON.parse(event.data);
                    if(obj.type=="image"){
                        mergeBlobs();
                    }
                    else if(obj.type="text"){
                        if (obj.uid == ud) {
                            log.innerHTML += "<span>" + obj.uid + ":" + obj.message + "</span>" + "<br>";
                        } else {
                            log.innerHTML += "<span style='float: right;'>" + obj.uid + ":" + obj.message + "</span>" + "<br>";
                        }
                    }

                } catch (error) {
                    console.error("Error parsing JSON:", error);
                }
            } else if (event.data instanceof Blob) {
                let reader = new FileReader();
                reader.onload = function (e) {
                    let image = e.target.result;
                    blobContainer.push(image);
                    console.log(blobContainer);
                };
                reader.readAsDataURL(event.data);
            }
        }

        function mergeBlobs() {
            let mergedArray = new Uint8Array(0);

            for (let i = 0; i < blobContainer.length; i++) {
                let dataURI = blobContainer[i];
                let base64Data = dataURI.split(",")[1];
                let decodedData = atob(base64Data);
                let dataArray = new Uint8Array(decodedData.length);

                for (let j = 0; j < decodedData.length; j++) {
                    dataArray[j] = decodedData.charCodeAt(j);
                }

                mergedArray = concatenateUint8Arrays(mergedArray, dataArray);
            }

            let mergedBlob = new Blob([mergedArray]);
            let imageURL = URL.createObjectURL(mergedBlob);

            let imageElement = document.createElement("img");
            imageElement.src = imageURL;
            imageElement.height=120;
            imageElement.width=80;
            let br =document.createElement("br");
            log.appendChild(imageElement);
            log.append(br);
            blobContainer = [];
        }

        function concatenateUint8Arrays(a, b) {
            let length = a.length + b.length;
            let result = new Uint8Array(length);
            result.set(a, 0);
            result.set(b, a.length);
            return result;
        }


        $('#merge').on('click', function () {
            console.log(blobContainer);
            mergeBlobs();
        })

    }
});
