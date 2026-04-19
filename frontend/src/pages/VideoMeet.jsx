import React, { useRef, useState, useEffect } from 'react'
import { io } from 'socket.io-client';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Badge from '@mui/material/Badge';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import CallEndIcon from '@mui/icons-material/CallEnd';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EditIcon from '@mui/icons-material/Edit';
import { useNavigate } from 'react-router';
import server from '../environment';
import styles from "../styles/videoComponent.module.css";

const server_url = server;

const peerConfigConnections = {
    "iceServers": [
        {"urls": "stun:stun.l.google.com:19302"}
    ]
}

function VideoMeetComponent() {
    const socketRef = useRef();
    const localVideoRef = useRef();

    const [videoAvailable, setVideoAvailable] = useState(true);
    const [audioAvailable, setAudioAvailable] = useState(true);
    const [video, setVideo] = useState(false);
    const [audio, setAudio] = useState(false);
    const [lobbyVideo, setLobbyVideo] = useState(true);
    const [lobbyAudio, setLobbyAudio] = useState(true);
    const [screen, setScreen] = useState(false);
    const [showModal, setModal] = useState(false);
    const [screenAvailable, setScreenAvailable] = useState(false);
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");
    const [newMessages, setNewMessages] = useState(0);
    const [askForUsername, setAskForUsername] = useState(true);
    const [username, setUsername] = useState("");
    const [videos, setVideos] = useState([]);

    const [whiteboard, setWhiteboard] = useState(false);
    const isDrawing = useRef(false);
    const canvasRef = useRef(null);
    const ctxRef = useRef(null);

    const connections = useRef({});
    const routeTo = useNavigate();

    const getPermissions = async () => {
        try {
            const userMediaStream = await navigator.mediaDevices.getUserMedia({ 
                video: true, 
                audio: true 
            });

            if (userMediaStream) {
                setVideoAvailable(true);
                setAudioAvailable(true);
                window.localStream = userMediaStream;
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = userMediaStream;
                }
                
                // Mute audio initially in lobby
                userMediaStream.getAudioTracks().forEach(track => {
                    track.enabled = false;
                });
            }

            if (navigator.mediaDevices.getDisplayMedia) {
                setScreenAvailable(true);
            } else {
                setScreenAvailable(false);
            }
        } catch (err) {
            console.log("Permission error:", err);
            setVideoAvailable(false);
            setAudioAvailable(false);
        }
    }

    useEffect(() => {
        getPermissions();
    }, []);

    const silence = () => {
        const ctx = new AudioContext();
        const oscillator = ctx.createOscillator();
        const dst = oscillator.connect(ctx.createMediaStreamDestination());
        oscillator.start();
        ctx.resume();
        return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false });
    }

    const black = ({ width = 640, height = 480 } = {}) => {
        const canvas = Object.assign(document.createElement("canvas"), { width, height });
        canvas.getContext('2d').fillRect(0, 0, width, height);
        const stream = canvas.captureStream();
        return Object.assign(stream.getVideoTracks()[0], { enabled: false });
    }

    const getUserMediaSuccess = (stream) => {
        try {
            if (window.localStream) {
                window.localStream.getTracks().forEach(track => track.stop());
            }
        } catch (e) { console.log(e) }

        window.localStream = stream;
        if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
        }

        for (let id in connections.current) {
            if (id === socketRef.current?.id) continue;

            connections.current[id].getSenders().forEach(sender => {
                if (sender.track && sender.track.kind === 'video') {
                    connections.current[id].removeTrack(sender);
                }
            });
            
            stream.getTracks().forEach(track => {
                connections.current[id].addTrack(track, stream);
            });

            connections.current[id].createOffer().then((description) => {
                connections.current[id].setLocalDescription(description)
                    .then(() => {
                        socketRef.current.emit("signal", id, JSON.stringify({ "sdp": connections.current[id].localDescription }));
                    }).catch(e => console.log(e));
            });
        }

        stream.getTracks().forEach(track => track.onended = () => {
            setVideo(false);
            setAudio(false);

            try {
                if (localVideoRef.current?.srcObject) {
                    const tracks = localVideoRef.current.srcObject.getTracks();
                    tracks.forEach(track => track.stop());
                }
            } catch (e) { console.log(e) }

            const blackSilence = (...args) => new MediaStream([black(...args), silence()]);
            window.localStream = blackSilence();
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = window.localStream;
            }

            for (let id in connections.current) {
                connections.current[id].getSenders().forEach(sender => {
                    if (sender.track) {
                        connections.current[id].removeTrack(sender);
                    }
                });
                
                window.localStream.getTracks().forEach(track => {
                    connections.current[id].addTrack(track, window.localStream);
                });

                connections.current[id].createOffer().then((description) => {
                    connections.current[id].setLocalDescription(description)
                        .then(() => {
                            socketRef.current.emit("signal", id, JSON.stringify({ "sdp": connections.current[id].localDescription }));
                        }).catch(e => console.log(e));
                });
            }
        });
    }

    const getUserMedia = () => {
        if ((video && videoAvailable) || (audio && audioAvailable)) {
            navigator.mediaDevices.getUserMedia({ video: video, audio: audio })
                .then(getUserMediaSuccess)
                .catch((e) => console.log(e));
        } else {
            try {
                if (localVideoRef.current?.srcObject) {
                    const tracks = localVideoRef.current.srcObject.getTracks();
                    tracks.forEach(track => track.stop());
                }
            } catch (e) { console.log(e) }
        }
    }

    useEffect(() => {
        if (video !== undefined && audio !== undefined) {
            getUserMedia();
        }
    }, [audio, video]);

    const gotMessageFromServer = (fromId, message) => {
        const signal = JSON.parse(message);

        if (fromId !== socketRef.current?.id) {
            if (signal.sdp) {
                connections.current[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(() => {
                    if (signal.sdp.type === "offer") {
                        connections.current[fromId].createAnswer().then((description) => {
                            connections.current[fromId].setLocalDescription(description).then(() => {
                                socketRef.current.emit("signal", fromId, JSON.stringify({ "sdp": connections.current[fromId].localDescription }));
                            }).catch(e => console.log(e));
                        }).catch(e => console.log(e));
                    }
                }).catch(e => console.log(e));
            }
            
            if (signal.ice) {
                connections.current[fromId].addIceCandidate(new RTCIceCandidate(signal.ice)).catch(e => console.log(e));
            }
        }
    }

    let addMessage = (data, sender, socketIdSender) => {
        setMessages((prevMessages) => [
            ...prevMessages,
            { sender: sender, data: data }
        ]);
        if (socketIdSender !== socketRef.current?.id) {
            setNewMessages((prev) => prev + 1);
        }
    }

    const connectToSocketServer = () => {
        socketRef.current = io.connect(server_url, { secure: false });

        socketRef.current.on('signal', gotMessageFromServer);

        socketRef.current.on("connect", () => {
            socketRef.current.emit("join-call", window.location.href);

            socketRef.current.on("chat-message", addMessage);

            socketRef.current.on("whiteboardData", (data) => {
                if (!ctxRef.current) return;
                if (data.type === "start") {
                    ctxRef.current.beginPath();
                    ctxRef.current.moveTo(data.x, data.y);
                } else if (data.type === "draw") {
                    ctxRef.current.lineTo(data.x, data.y);
                    ctxRef.current.stroke();
                } else if (data.type === "stop") {
                    ctxRef.current.closePath();
                } else if (data.type === "clear") {
                    if(canvasRef.current) {
                        ctxRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
                    }
                }
            });

            socketRef.current.on("user-left", (id) => {
                setVideos(videos => videos.filter((video) => video.socketId !== id));
                
                if (connections.current[id]) {
                    connections.current[id].close();
                    delete connections.current[id];
                }
            });

            socketRef.current.on("user-joined", (id, clients) => {
                clients.forEach((socketListId) => {
                    if (connections.current[socketListId]) return;

                    connections.current[socketListId] = new RTCPeerConnection(peerConfigConnections);

                    connections.current[socketListId].onicecandidate = (event) => {
                        if (event.candidate !== null) {
                            socketRef.current.emit("signal", socketListId, JSON.stringify({ 'ice': event.candidate }));
                        }
                    };

                    connections.current[socketListId].ontrack = (event) => {
                        const socketId = socketListId;
                        
                        setVideos(currentVideos => {
                            const videoExists = currentVideos.find(video => video.socketId === socketId);
                            if (videoExists) {
                                return currentVideos.map(video =>
                                    video.socketId === socketId ? { ...video, stream: event.streams[0] } : video
                                );
                            } else {
                                const newVideo = {
                                    socketId: socketId,
                                    stream: event.streams[0],
                                    autoplay: true,
                                    playsinline: true
                                };
                                return [...currentVideos, newVideo];
                            }
                        });
                    };

                    if (window.localStream) {
                        window.localStream.getTracks().forEach(track => {
                            connections.current[socketListId].addTrack(track, window.localStream);
                        });
                    }
                });

                if (id === socketRef.current.id) {
                    for (let id2 in connections.current) {
                        if (id2 === socketRef.current.id) continue;

                        if (window.localStream) {
                            window.localStream.getTracks().forEach(track => {
                                connections.current[id2].addTrack(track, window.localStream);
                            });
                        }

                        connections.current[id2].createOffer().then((description) => {
                            connections.current[id2].setLocalDescription(description)
                                .then(() => {
                                    socketRef.current.emit("signal", id2, JSON.stringify({ "sdp": connections.current[id2].localDescription }));
                                })
                                .catch(e => console.log(e));
                        });
                    }
                }
            });
        });
    }

    const getMedia = () => {
        setVideo(videoAvailable);
        setAudio(audioAvailable);
        connectToSocketServer();
    }

    const connect = () => {
        if (!username.trim()) {
            alert("Please enter a username");
            return;
        }
        setAskForUsername(false);
        getMedia();
    }

    const handleLobbyVideo = () => {
        if (window.localStream) {
            const videoTrack = window.localStream.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !lobbyVideo;
                setLobbyVideo(!lobbyVideo);
            }
        }
    }

    const handleLobbyAudio = () => {
        if (window.localStream) {
            const audioTrack = window.localStream.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !lobbyAudio;
                setLobbyAudio(!lobbyAudio);
            }
        }
    }

    let handleVideo = () => {
        setVideo(!video);
    }

    let handleAudio = () => {
        setAudio(!audio);
    }

    let getDisplayMediaSuccess = (stream) => {
        try {
            window.localStream.getTracks().forEach(track => track.stop())
        } catch (e) { console.log(e) }

        window.localStream = stream;
        localVideoRef.current.srcObject = stream;

        for (let id in connections.current) {
            if (id === socketRef.current?.id) continue;

            connections.current[id].getSenders().forEach(sender => {
                connections.current[id].removeTrack(sender);
            });

            stream.getTracks().forEach(track => {
                connections.current[id].addTrack(track, stream);
            });

            connections.current[id].createOffer().then((description) => {
                connections.current[id].setLocalDescription(description)
                    .then(() => {
                        socketRef.current.emit("signal", id, JSON.stringify({ "sdp": connections.current[id].localDescription }))
                    })
                    .catch(e => console.log(e))
            })
        }

        stream.getTracks().forEach(track => track.onended = () => {
            setScreen(false);

            try {
                if (localVideoRef.current?.srcObject) {
                    const tracks = localVideoRef.current.srcObject.getTracks();
                    tracks.forEach(track => track.stop());
                }
            } catch (e) { console.log(e) }

            const blackSilence = (...args) => new MediaStream([black(...args), silence()]);
            window.localStream = blackSilence();
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = window.localStream;
            }

            getUserMedia();
        });
    }

    let getDisplayMedia = () => {
        if (screen) {
            if (navigator.mediaDevices.getDisplayMedia) {
                navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
                    .then(getDisplayMediaSuccess)
                    .catch((e) => console.log(e))
            }
        }
    }

    useEffect(() => {
        if (screen !== undefined) {
            getDisplayMedia();
        }
    }, [screen])

    let handleScreen = () => {
        setScreen(!screen)
    }

    let sendMessage = () => {
        if (message.trim()) {
            socketRef.current.emit("chat-message", message, username);
            setMessage("");
        }
    }

    const handleChatToggle = () => {
        setModal(!showModal);
        if (!showModal) {
            setNewMessages(0);
        }
    }

    let handleEndCall = () => {
        try {
            let tracks = localVideoRef.current.srcObject.getTracks();
            tracks.forEach(track => track.stop())
        } catch (e) { }

        routeTo("/home")
    }

    useEffect(() => {
        if (whiteboard && canvasRef.current) {
            const canvas = canvasRef.current;
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            const ctx = canvas.getContext("2d");
            ctx.lineCap = "round";
            ctx.strokeStyle = "black";
            ctx.lineWidth = 5;
            ctxRef.current = ctx;
        }
    }, [whiteboard]);

    const startDrawing = (e) => {
        if(!whiteboard) return;
        const { offsetX, offsetY } = e.nativeEvent;
        ctxRef.current.beginPath();
        ctxRef.current.moveTo(offsetX, offsetY);
        isDrawing.current = true;
        socketRef.current.emit("whiteboardData", { x: offsetX, y: offsetY, type: 'start' });
    }

    const draw = (e) => {
        if (!isDrawing.current || !whiteboard) return;
        const { offsetX, offsetY } = e.nativeEvent;
        ctxRef.current.lineTo(offsetX, offsetY);
        ctxRef.current.stroke();
        socketRef.current.emit("whiteboardData", { x: offsetX, y: offsetY, type: 'draw' });
    }

    const stopDrawing = () => {
        if(!whiteboard) return;
        ctxRef.current.closePath();
        isDrawing.current = false;
        socketRef.current.emit("whiteboardData", { type: 'stop' });
    }

    const handleWhiteboard = () => {
        setWhiteboard(!whiteboard);
    }

    return (
        <div>
            {askForUsername === true ?
                <div className={styles.lobbyContainer}>
                    {/* Left Side - Form */}
                    <div className={styles.lobbyLeft}>
                        <div className={styles.lobbyContent}>
                            <h2 className={styles.lobbyTitle}>Ready to join?</h2>
                            <p className={styles.lobbySubtitle}>
                                Enter your name to join the video call
                            </p>

                            <div className={styles.lobbyInputGroup}>
                                <TextField
                                    id="username-input"
                                    label="Your name"
                                    value={username}
                                    onChange={e => setUsername(e.target.value)}
                                    variant="outlined"
                                    onKeyPress={(e) => e.key === 'Enter' && connect()}
                                    fullWidth
                                />
                                <Button 
                                    className={styles.lobbyButton}
                                    variant="contained" 
                                    onClick={connect}
                                    size="large"
                                >
                                    Join now
                                </Button>
                            </div>

                            <div className={styles.lobbyFeatures}>
                                <h3>Before you join:</h3>
                                <div className={styles.lobbyFeatureItem}>
                                    <CheckCircleIcon />
                                    <span>Check your camera and microphone</span>
                                </div>
                                <div className={styles.lobbyFeatureItem}>
                                    <CheckCircleIcon />
                                    <span>Make sure you're in a quiet place</span>
                                </div>
                                <div className={styles.lobbyFeatureItem}>
                                    <CheckCircleIcon />
                                    <span>Test your connection</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Side - Video Preview */}
                    <div className={styles.lobbyRight}>
                        <div className={styles.lobbyVideoContainer}>
                            <video
                                ref={localVideoRef}
                                autoPlay
                                muted
                                playsInline
                                className={styles.lobbyVideo}
                            ></video>
                            
                            <div className={styles.lobbyVideoOverlay}>
                                <div 
                                    className={styles.lobbyVideoControls}
                                    onClick={handleLobbyVideo}
                                >
                                    {lobbyVideo ? <VideocamIcon /> : <VideocamOffIcon />}
                                </div>
                                <div 
                                    className={styles.lobbyVideoControls}
                                    onClick={handleLobbyAudio}
                                >
                                    {lobbyAudio ? <MicIcon /> : <MicOffIcon />}
                                </div>
                            </div>
                        </div>
                    </div>
                </div> :
                <div className={styles.meetVideoContainer}>
                    {/* Chat Room */}
                    {showModal &&
                        <div className={styles.chatRoom}>
                            <div className={styles.chatContainer}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <h1>Chat</h1>
                                    <IconButton onClick={handleChatToggle} size="small">
                                        <CloseIcon />
                                    </IconButton>
                                </div>

                                <div className={styles.chattingDisplay}>
                                    {messages.length > 0 ? messages.map((item, index) => {
                                        return (
                                            <div key={index}>
                                                <p>{item.sender}</p>
                                                <p>{item.data}</p>
                                            </div>
                                        )
                                    }) : <p style={{ color: '#5f6368', textAlign: 'center' }}>No messages yet</p>}
                                </div>

                                <div className={styles.chattingArea}>
                                    <TextField
                                        value={message}
                                        onChange={e => setMessage(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                                        id="outlined-basic"
                                        label="Type a message"
                                        variant='outlined'
                                        size="small"
                                    />
                                    <Button variant='contained' onClick={sendMessage}>Send</Button>
                                </div>
                            </div>
                        </div>
                    }

                    {whiteboard && (
                        <div className={styles.whiteboardContainer}>
                            <canvas
                                onMouseDown={startDrawing}
                                onMouseMove={draw}
                                onMouseUp={stopDrawing}
                                onMouseOut={stopDrawing}
                                ref={canvasRef}
                                className={styles.whiteboardCanvas}
                            />
                            <Button onClick={() => {
                                const canvas = canvasRef.current;
                                ctxRef.current.clearRect(0, 0, canvas.width, canvas.height);
                                socketRef.current.emit("whiteboardData", { type: 'clear' });
                            }} variant="contained" color="error" style={{position: 'absolute', top: 20, right: 20, zIndex: 1000}}>Clear Whiteboard</Button>
                        </div>
                    )}

                    {/* Conference View - Grid of Remote Videos */}
                    <div className={`${styles.conferenceView} ${showModal ? styles.withChat : ''}`}>
                        {videos.map((video) => (
                            <div key={video.socketId}>
                                <video
                                    data-socket={video.socketId}
                                    ref={ref => {
                                        if (ref && video.stream) {
                                            ref.srcObject = video.stream;
                                        }
                                    }}
                                    autoPlay
                                    playsInline
                                ></video>
                            </div>
                        ))}
                    </div>

                    {/* Local Video - Bottom Left */}
                    <video className={styles.meetUserVideo} ref={localVideoRef} autoPlay muted playsInline></video>

                    {/* Control Buttons - Bottom Center */}
                    <div className={styles.buttonContainers}>
                        <IconButton onClick={handleVideo} style={{ color: "white" }}>
                            {video === true ? <VideocamIcon /> : <VideocamOffIcon />}
                        </IconButton>

                        <IconButton onClick={handleAudio} style={{ color: "white" }}>
                            {audio === true ? <MicIcon /> : <MicOffIcon />}
                        </IconButton>

                        <IconButton onClick={handleEndCall} style={{ color: "white", background: "#ea4335" }}>
                            <CallEndIcon />
                        </IconButton>

                        {screenAvailable === true &&
                            <IconButton onClick={handleScreen} style={{ color: "white" }}>
                                {screen === true ? <StopScreenShareIcon /> : <ScreenShareIcon />}
                            </IconButton>
                        }

                        <IconButton onClick={handleWhiteboard} style={{ color: whiteboard ? "#8ab4f8" : "white" }}>
                            <EditIcon />
                        </IconButton>

                        <Badge badgeContent={newMessages} max={999} color='error'>
                            <IconButton onClick={handleChatToggle} style={{ color: "white" }}>
                                <ChatIcon />
                            </IconButton>
                        </Badge>
                    </div>
                </div>
            }
        </div>
    )
}

export default VideoMeetComponent