window.addEventListener("DOMContentLoaded", ()=>{
    const socket = io();
    console.log("socket", socket);
    const videoGrid = document.getElementById("video-grid");
    const myVideo = document.createElement("video");
    const showChat = document.querySelector("#showChat");
    const backBtn = document.querySelector(".header__back");
    myVideo.muted = true;

    backBtn.addEventListener("click", () => {
        document.querySelector(".main__left").style.display = "flex";
        document.querySelector(".main__left").style.flex = "1";
        document.querySelector(".main__right").style.display = "none";
        document.querySelector(".header__back").style.display = "none";
    });

    showChat.addEventListener("click", () => {
        document.querySelector(".main__right").style.display = "flex";
        document.querySelector(".main__right").style.flex = "1";
        document.querySelector(".main__left").style.display = "none";
        document.querySelector(".header__back").style.display = "block";
    });

    const user = prompt("Enter your name");

    if(window.location.hostname == "localhost"){
        var peer = new Peer(undefined, {
            path: '/peerjs',
            host: window.location.hostname,
            port: 5000
        });
    }else{
        var peer = new Peer(undefined, {
            path: '/peerjs',
            host: window.location.hostname
        });    
    }
    let myVideoStream;
    navigator.mediaDevices
    .getUserMedia({
        audio: true,
        video: true,
    })
    .then((stream) => {
        myVideoStream = stream;
        addVideoStream(myVideo, stream);

        socket.on("user-connected", (userId) => {
            console.log(userId, "user");
            const call = peer.call(userId, stream);
            console.log("New User Connected", call);
            const vid = document.createElement("video");
            call.on('stream', (remoteStream) => {
                console.log("video stream new", remoteStream);
                vid.srcObject = remoteStream;
                vid.addEventListener("loadedmetadata", () => {
                    vid.play();
                    videoGrid.append(vid);
                });
            });
        });
    });

    peer.on("call", call => {
        navigator.mediaDevices
        .getUserMedia({
            audio: true,
            video: true,
        })
        .then((stream) => {
            myVideoStream = stream;
            call.answer(stream);
            const video = document.createElement("video");
            call.on("stream", (peerVideoStream) => {
                console.log("video stream new peer", peerVideoStream);
                addVideoStream(video, peerVideoStream, true);
            });
        });
    });

    peer.on("open", (id) => {
        console.log(id, " user ", user);
        socket.emit("join-room", ROOM_ID, id, user);
    });

    const addVideoStream = (video, stream, peer=false) => {
        if(peer) console.log("peer video being added", video);
        else console.log("video being added", video);
        video.srcObject = stream;
        video.addEventListener("loadedmetadata", () => {
            video.play();
            videoGrid.append(video);
        });
    };

    let text = document.querySelector("#chat_message");
    let send = document.getElementById("send");
    let messages = document.querySelector(".messages");

    send.addEventListener("click", (e) => {
        if (text.value.length !== 0) {
            console.log("test", text.value);
            socket.emit("message", text.value);
            text.value = "";
        }
    });

    text.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && text.value.length !== 0) {
            socket.emit("message", text.value);
            console.log("test", text.value);
            text.value = "";
        }
    });

    const inviteButton = document.querySelector("#inviteButton");
    const muteButton = document.querySelector("#muteButton");
    const stopVideo = document.querySelector("#stopVideo");
    muteButton.addEventListener("click", () => {
    const enabled = myVideoStream.getAudioTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getAudioTracks()[0].enabled = false;
        html = `<i class="fas fa-microphone-slash"></i>`;
        muteButton.classList.toggle("background__red");
        muteButton.innerHTML = html;
    } else {
        myVideoStream.getAudioTracks()[0].enabled = true;
        html = `<i class="fas fa-microphone"></i>`;
        muteButton.classList.toggle("background__red");
        muteButton.innerHTML = html;
    }
    });

    stopVideo.addEventListener("click", () => {
    const enabled = myVideoStream.getVideoTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getVideoTracks()[0].enabled = false;
        html = `<i class="fas fa-video-slash"></i>`;
        stopVideo.classList.toggle("background__red");
        stopVideo.innerHTML = html;
    } else {
        myVideoStream.getVideoTracks()[0].enabled = true;
        html = `<i class="fas fa-video"></i>`;
        stopVideo.classList.toggle("background__red");
        stopVideo.innerHTML = html;
    }
    });

    inviteButton.addEventListener("click", (e) => {
        prompt(
            "Copy this link and send it to people you want to meet with",
            window.location.href
        );
    });

    socket.on("serverMessage", (message, userName) => {
        console.log("testing0", messages);
        messages.innerHTML = messages.innerHTML +
            `<div class="message">
                <b><i class="far fa-user-circle"></i> <span> ${
                userName === user ? "me" : userName
                }</span> </b>
                <span>${message}</span>
            </div>`;
    });
})