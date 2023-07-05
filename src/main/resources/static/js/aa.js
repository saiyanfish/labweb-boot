$(function () {

    let receivedChunks = [];   //存放多個blob
    let totalimgChunks = 0;     //
    let receivedImgChunkCount = 0;
    let imagedata = "";
    let webSocket;
    let msg = document.getElementById("msg");
    let log = document.getElementById("log");
    let uid = document.getElementById("uid");
    let blobContainer = [];
    let imgSender = "";


    //audio
    let chunks = [];
    let isRecording = false;
    let mediaRecorder;
    let stream;
    let receivedAudioChunks = [];   //存放多個blob
    let receivedAudioChunkCount = 0;
    let audioSender = "";
    let audioBlobContainer = [];
    let totalaudioChunks = 0;

    function dataURItoBuffer(dataURI) {
        let byteString = atob(dataURI.split(",")[1]);
        let buffer = new ArrayBuffer(byteString.length);
        let view = new Uint8Array(buffer);
        totalimgChunks = 0;     //

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
    $("#msg").on("keydown", function () {
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
                chunks =[];

            } else {
                if (msg.value !== "") {
                    let message1 = {
                        message: msg.value,
                        type: "text",
                        uid: uid.value,
                    };
                    webSocket.send(JSON.stringify(message1));
                }
                // console.log(imagedata);
                let chunkSize = 8192;
                totalimgChunks = Math.ceil(imagedata.byteLength / chunkSize);
                let currentChunk = 0;

                while (currentChunk < totalimgChunks) {
                    let start = currentChunk * chunkSize;
                    let end = start + chunkSize;
                    let chunk = imagedata.slice(start, end);
                    if (currentChunk === 0) {
                        let message = {
                            type: "image",
                            uid: uid.value,
                            chunks: totalimgChunks,
                        }
                        webSocket.send(JSON.stringify(message));
                    }
                    webSocket.send(chunk);
                    currentChunk++;
                }

                msg.value = "";
                imagedata = "";
                chunks =[];
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
        totalimgChunks = 0;
        receivedImgChunkCount = 0;
        blobContainer = [];
        totalaudioChunks = 0;
        receivedAudioChunkCount = 0;
        audioBlobContainer = [];

        let roomid = $("#room").val();

        console.log("connecting....");
        webSocket = new WebSocket("ws://10.0.104.120:8080/websocket/" + roomid);
        // webSocket = new WebSocket("ws://localhost:8080/websocket/" + roomid);

        webSocket.roomId = roomid;
        $("#room").prop("disabled", true);
        $("#uid").prop("disabled", true);
        webSocket.onerror = function (event) {
            // console.log("onerror");
        };
        webSocket.onopen = function (event) {
            // console.log("open");
            start.style.display = "none";
            msgDiv.style.display = "block";
        };
        webSocket.onclose = function (event) {
            console.log("WebSocket close：" + event.code + "，原因：" + event.reason);
            // start.style.display = "block";
            // msgDiv.style.display = "none";
        };
        webSocket.onmessage = function (event) {

            let ud = $("#uid").val();
            // console.log("Received data:", event.data);
            if (typeof event.data === "string") {
                console.log(event.data)
                try {
                    let obj = JSON.parse(event.data);
                    if (obj.type == "image") {
                        receivedImgChunkCount = obj.chunks;
                        imgSender = obj.uid;
                        startTimer();
                    } else if (obj.type == "error") {
                        // console.log(obj.content);
                    } else if (obj.type == "audio") {
                        receivedAudioChunkCount = obj.chunks;
                        audioSender = obj.uid;
                        startaudioTimer();
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
                if (receivedAudioChunkCount !== 0) {
                    let reader = new FileReader();
                    reader.onload = function (e) {
                        let audio = e.target.result;
                        audioBlobContainer.push(audio);
                        totalaudioChunks++;

                    };
                    reader.readAsDataURL(event.data);
                } else if (receivedImgChunkCount !== 0) {
                    let reader = new FileReader();
                    reader.onload = function (e) {
                        let image = e.target.result;
                        blobContainer.push(image);
                        totalimgChunks++;
                        // console.log(totalimgChunks);
                        // console.log(blobContainer);
                    };
                    reader.readAsDataURL(event.data);
                }

            }
        }

        function mergeimgBlobs() {
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
            console.log(imageURL)
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

        function mergeAudioBlobs() {
            let mergedArray = new Uint8Array(0);

            for (let i = 0; i < audioBlobContainer.length; i++) {
                let dataURI = audioBlobContainer[i];
                let base64Data = dataURI.split(",")[1];
                let decodedData = atob(base64Data);
                let dataArray = new Uint8Array(decodedData.length);

                for (let j = 0; j < decodedData.length; j++) {
                    dataArray[j] = decodedData.charCodeAt(j);
                }

                mergedArray = concatenateUint8Arrays(mergedArray, dataArray);
            }

            let mergedBlob = new Blob([mergedArray], {type: 'audio/wav'});
            let audioURL = URL.createObjectURL(mergedBlob);


            console.log(audioBlobContainer);
            console.log(mergedBlob);
            console.log(audioURL);

            let audio = document.createElement("audio");
            audio.src = audioURL;
            audio.controls=true;
            // audio.autoplay=true;
            let br = document.createElement("br");

            let divContainer = document.createElement("div");
            if ($("#uid").val() === audioSender) {
                divContainer.style.textAlign = "left";
            } else {
                divContainer.style.textAlign = "right";
            }

            const spanElement = document.createElement("span");
            spanElement.textContent = audioSender + ": ";

            divContainer.appendChild(spanElement);
            divContainer.appendChild(audio);
            divContainer.appendChild(br);
            log.appendChild(divContainer);

            audioBlobContainer = [];
        }





        function concatenateUint8Arrays(a, b) {
            let length = a.length + b.length;
            let result = new Uint8Array(length);
            result.set(a, 0);
            result.set(b, a.length);
            return result;
        }


        //timer
        function awaitMedia() {
            if (totalimgChunks >= receivedImgChunkCount) {
                mergeimgBlobs();
                stopTimer();
                totalimgChunks = 0;
                receivedImgChunkCount = 0;
                // console.log("tc:" + totalimgChunks + ",rc:" + receivedImgChunkCount)
            }
        }

        let interval = 1000; // 監聽間隔時間（毫秒）
        let timerID = null; // 定時器ID，初始為null

        // 啟動定時器
        function startTimer() {
            if (timerID === null) {
                timerID = setInterval(awaitMedia, interval);
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

        function awaitAudio() {
            if (totalaudioChunks >= receivedAudioChunkCount) {
                mergeAudioBlobs();
                stopaudioTimer();
                totalaudioChunks = 0;
                receivedAudioChunkCount = 0;
                // console.log("tc:" + totalimgChunks + ",rc:" + receivedImgChunkCount)
            }
        }

        let intervalimg = 1000; // 監聽間隔時間（毫秒）
        let timerimgID = null; // 定時器ID，初始為null

        // 啟動定時器
        function startaudioTimer() {
            if (timerimgID === null) {
                timerimgID = setInterval(awaitAudio, intervalimg);
                // console.log("image:get");
            }
        }

        // 停止定時器
        function stopaudioTimer() {
            if (timerimgID !== null) {
                clearInterval(timerimgID);
                timerimgID = null;
                // console.log("merge:ok");
            }
        }

        // 預設為關閉狀態
        stopaudioTimer();

        $('#recordButton').click( function () {
            if (!isRecording) {
                chunks = [];
                isRecording = true;

                navigator.mediaDevices.getUserMedia({audio: true})
                    .then(function (mediaStream) {
                        stream = mediaStream;
                        mediaRecorder = new MediaRecorder(mediaStream);

                        mediaRecorder.addEventListener('dataavailable',  function (event) {
                            chunks.push(event.data);
                            console.log('Received data chunk:', event.data);
                        });

                        mediaRecorder.start();
                        $('#recordButton').text('');
                        $('#recordButton').css({"background-image":'url(/images/record.gif)','background-size': 'cover',})
                    })
                    .catch(function (error) {
                        console.error('麥克風不給:', error);
                    });
            } else if (isRecording === true) {
                mediaRecorder.addEventListener('stop', function () {
                    isRecording = false;
                    stream.getTracks().forEach(function (track) {
                        track.stop();
                    });
                    $('#recordButton').text('start');
                    $('#recordButton').css("background-image",'url()')
                    sendAudio();
                });

                mediaRecorder.stop();
            }
        });
        $("#checked").on('click',()=>{
            sendAudio();
        })
        function sendAudio(){
            let chunkSize = 8192;
            let currentChunk = 0;
            let blob = chunks[0];
            let chunksCapacity = blob.size;
            let parts = Math.ceil(chunksCapacity / chunkSize);

            while (currentChunk < parts) {
                let start = currentChunk * chunkSize;
                let end = start + chunkSize;
                let chunk = blob.slice(start, end);
                if (currentChunk === 0) {
                    let message = {
                        "type": "audio",
                        "uid": uid.value,
                        "chunks": parts
                    }
                    webSocket.send(JSON.stringify(message));
                }
                webSocket.send(chunk);
                currentChunk++;
            }


        }

    }
})
