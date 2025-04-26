import React, { useState, useRef, useEffect } from 'react';
import { Button, Box } from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import axios from 'axios';
import Recorder from 'recorder-js';

const Microphone: React.FC = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
    const recorderRef = useRef<Recorder | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            const recorder = new Recorder(audioContext, {
                numChannels: 1,
                sampleRate: 44100,
            });
            recorderRef.current = recorder;

            await recorder.init(stream);
            recorder.start();
            setIsRecording(true);

            // Send audio chunks every 5 seconds
            intervalRef.current = setInterval(async () => {
                if (recorderRef.current) {
                    const { buffer } = await recorderRef.current.stop();
                    const blob = new Blob([buffer], { type: 'audio/wav' });
                    setAudioChunks((prev) => [...prev, blob]);
                    recorderRef.current.start(); // Start recording again
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
        setIsRecording(false);
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
                        animation: 'wave 1s infinite',
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
                                animation: `wave ${0.5 + i * 0.1}s infinite`,
                            }}
                        />
                    ))}
                </Box>
            )}
        </Box>
    );
};

export default Microphone; 