import React, { useState, useRef, useEffect } from 'react';
import { Button, Box } from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import axios from 'axios';
import Recorder from 'recorder-js';

const Microphone: React.FC = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isActuallySpeaking, setIsActuallySpeaking] = useState(false);
    const recorderRef = useRef<Recorder | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const animationFrameRef = useRef<number | null>(null);
    const speakingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const silenceCounterRef = useRef<number>(0);

    const checkAudioLevel = () => {
        if (!analyserRef.current) return;

        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);

        // Calculate average volume
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;

        // Update actual speaking state based on volume threshold
        const currentlySpeaking = average > 20; // Lowered threshold
        setIsActuallySpeaking(currentlySpeaking);

        if (currentlySpeaking) {
            silenceCounterRef.current = 0;
            setIsSpeaking(true);
            if (speakingTimeoutRef.current) {
                clearTimeout(speakingTimeoutRef.current);
                speakingTimeoutRef.current = null;
            }
        } else {
            silenceCounterRef.current++;
            if (silenceCounterRef.current >= 10) { // Increased from 5 to 10 (about 1 second of silence)
                if (!speakingTimeoutRef.current) {
                    speakingTimeoutRef.current = setTimeout(() => {
                        setIsSpeaking(false);
                        speakingTimeoutRef.current = null;
                    }, 1000); // Increased from 500ms to 1000ms
                }
            }
        }

        animationFrameRef.current = requestAnimationFrame(checkAudioLevel);
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

            // Set up audio analyzer
            const analyser = audioContext.createAnalyser();
            analyser.fftSize = 256;
            const source = audioContext.createMediaStreamSource(stream);
            source.connect(analyser);
            analyserRef.current = analyser;

            const recorder = new Recorder(audioContext, {
                numChannels: 1,
                sampleRate: 44100,
            });
            recorderRef.current = recorder;

            await recorder.init(stream);
            recorder.start();
            setIsRecording(true);
            checkAudioLevel();

            // Send audio chunks every 5 seconds
            intervalRef.current = setInterval(async () => {
                if (recorderRef.current) {
                    const { buffer } = await recorderRef.current.stop();
                    const blob = new Blob([buffer], { type: 'audio/wav' });
                    setAudioChunks((prev) => [...prev, blob]);
                    recorderRef.current.start();
                }
            }, 5000);

        } catch (error) {
            console.error('Error accessing microphone:', error);
        }
    };

    const stopRecording = async () => {
        if (recorderRef.current) {
            await recorderRef.current.stop();
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
        }
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        }
        if (speakingTimeoutRef.current) {
            clearTimeout(speakingTimeoutRef.current);
        }
        setIsRecording(false);
        setIsSpeaking(false);
        setIsActuallySpeaking(false);
        silenceCounterRef.current = 0;
    };

    useEffect(() => {
        if (audioChunks.length > 0) {
            const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
            sendAudioToBackend(audioBlob);
            setAudioChunks([]);
        }
    }, [audioChunks]);

    const sendAudioToBackend = async (audioBlob: Blob) => {
        try {
            const formData = new FormData();
            formData.append('audio', audioBlob);

            console.log("Sending audio to backend");

            await axios.patch('https://la-hacks-project.onrender.com/api/updateInfo?snap_user_id=test_user&lecture_id=2e312afe-b903-4da3-959d-235e3e3f8fc6', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
        } catch (error) {
            console.error('Error sending audio to backend:', error);
        }
    };

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
            }}
        >
            <Button
                variant="contained"
                color={isRecording ? 'error' : 'primary'}
                onClick={isRecording ? stopRecording : startRecording}
                sx={{
                    width: '150px',
                    height: '150px',
                    borderRadius: '50%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: 'none',
                    '&:hover': {
                        boxShadow: 'none',
                    },
                }}
            >
                {isRecording ? <MicOffIcon sx={{ fontSize: 60 }} /> : <MicIcon sx={{ fontSize: 60 }} />}
            </Button>
            {isRecording && (
                <Box
                    sx={{
                        marginTop: 3,
                        display: 'flex',
                        gap: 2,
                        animation: isSpeaking ? 'wave 1s infinite' : 'none',
                        '@keyframes wave': {
                            '0%': { transform: 'scaleY(0.5)' },
                            '50%': { transform: 'scaleY(1.5)' },
                            '100%': { transform: 'scaleY(0.5)' },
                        },
                    }}
                >
                    {[...Array(5)].map((_, i) => (
                        <Box
                            key={i}
                            sx={{
                                width: '8px',
                                height: '40px',
                                backgroundColor: '#1976d2',
                                borderRadius: '4px',
                                animation: isSpeaking ? `wave ${0.5 + i * 0.1}s infinite` : 'none',
                            }}
                        />
                    ))}
                </Box>
            )}
        </Box>
    );
};

export default Microphone; 