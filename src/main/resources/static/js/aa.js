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
    let imgSender = "";


    function dataURItoBuffer(dataURI) {
        let byteString = atob(dataURI.split(",")[1]);
        let buffer = new ArrayBuffer(byteString.length);
        let view = new Uint8Array(buffer);
        totalChunks = 0;     //

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
        sendmessage();
    });
    $("#msg").on("keydown",function (){
        if (event.keyCode === 13) {
            event.preventDefault();
            sendmessage();
        }
    })
    function sendmessage() {
        if (webSocket.readyState === WebSocket.CLOSED) {
            connect();
        } else {
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
                if(msg.value!==""){
                    let message1 = {
                        message: msg.value,
                        type: "text",
                        uid: uid.value,
                    };
                    webSocket.send(JSON.stringify(message1));
                }
                console.log(imagedata);
                let chunkSize = 8192;
                totalChunks = Math.ceil(imagedata.byteLength / chunkSize);
                let currentChunk = 0;

                while (currentChunk < totalChunks) {
                    let start = currentChunk * chunkSize;
                    let end = start + chunkSize;
                    let chunk = imagedata.slice(start, end);
                    webSocket.send(chunk);
                    if (currentChunk === (totalChunks - 1)) {
                        let message = {
                            type: "image",
                            uid: uid.value,
                            chuncks: totalChunks,
                        }
                        webSocket.send(JSON.stringify(message));
                    }
                    currentChunk++;
                }

                msg.value = "";
                imagedata = "";
                $('#fileInput').val(null);
                $("#imageElement").attr("src", "");
            }
        }
    }

    let start = document.getElementById("start");
    let msgDiv = document.getElementById("msgDiv");

    start.style.display = "block";
    msgDiv.style.display = "none";

    function connect() {
        totalChunks = 0;
        receivedChunkCount = 0;
        blobContainer = [];
        let roomid = $("#room").val();

        console.log("connecting....");
        webSocket = new WebSocket("ws://10.0.104.120:8080/websocket/" + roomid);
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
            // console.log("WebSocket close：" + event.code + "，原因：" + event.reason);
            // start.style.display = "block";
            // msgDiv.style.display = "none";
        };
        webSocket.onmessage = function (event) {

            let ud = $("#uid").val();
            // console.log("Received data:", event.data);
            if (typeof event.data === "string") {

                try {
                    let obj = JSON.parse(event.data);
                    if (obj.type == "image") {
                        receivedChunkCount = obj.chuncks;
                        imgSender = obj.uid;
                        startTimer();
                    } else if (obj.type == "error") {
                        // console.log(obj.content);
                    } else if (obj.type == "text") {
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
                    totalChunks++;
                    // console.log(totalChunks);
                    // console.log(blobContainer);
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
            imageElement.height = 100;
            imageElement.width = 120;
            let br = document.createElement("br");

            let divContainer = document.createElement("div");
            if ($("#uid").val() === imgSender) {
                divContainer.style.textAlign = "left";
            } else {
                divContainer.style.textAlign = "right";
            }

            let spanElement = document.createElement("span");
            spanElement.textContent = imgSender + ": ";

            divContainer.appendChild(spanElement);
            divContainer.appendChild(imageElement);
            divContainer.appendChild(br);

            log.appendChild(divContainer);
            blobContainer = [];
        }

        function concatenateUint8Arrays(a, b) {
            let length = a.length + b.length;
            let result = new Uint8Array(length);
            result.set(a, 0);
            result.set(b, a.length);
            return result;
        }


        //timer
        function listenToSomething() {
            if (totalChunks >= receivedChunkCount) {
                mergeBlobs();
                stopTimer();
                totalChunks = 0;
                receivedChunkCount = 0;
                // console.log("tc:" + totalChunks + ",rc:" + receivedChunkCount)
            }
        }

        let interval = 1000; // 監聽間隔時間（毫秒）
        let timerID = null; // 定時器ID，初始為null

        // 啟動定時器
        function startTimer() {
            if (timerID === null) {
                timerID = setInterval(listenToSomething, interval);
                // console.log("image:get");
            }
        }

        // 停止定時器
        function stopTimer() {
            if (timerID !== null) {
                clearInterval(timerID);
                timerID = null;
                // console.log("merge:ok");
            }
        }

        // 預設為關閉狀態
        stopTimer();

    }

});
