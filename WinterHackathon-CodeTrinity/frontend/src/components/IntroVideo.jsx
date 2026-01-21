import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Volume2, VolumeX, ArrowRight } from 'lucide-react';
import Button from './ui/Button';

const IntroVideo = ({ onComplete }) => {
    const videoRef = useRef(null);
    const [isMuted, setIsMuted] = useState(true);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.play().catch(error => {
                // Autoplay prevented is expected in some browsers/configs
                // console.log("Autoplay prevented:", error);
            });
        }
    }, []);

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            const current = videoRef.current.currentTime;
            const total = videoRef.current.duration;
            setProgress((current / total) * 100);
        }
    };

    const toggleMute = () => {
        if (videoRef.current) {
            videoRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-[100] bg-black flex items-center justify-center overflow-hidden"
        >
            {/* Video Background */}
            <video
                ref={videoRef}
                className="w-full h-full object-cover"
                onEnded={onComplete}
                onTimeUpdate={handleTimeUpdate}
                muted={isMuted}
                playsInline
                autoPlay
            >
                <source src="/Video_Generation_With_Music_And_Laos.mp4" type="video/mp4" />
                Your browser does not support the video tag.
            </video>

            {/* Overlay Content */}
            <div className="absolute inset-0 bg-black/30 pointer-events-none"></div>

            {/* Controls */}
            <div className="absolute top-6 right-6 z-10 flex items-center space-x-4">
                <button
                    onClick={toggleMute}
                    className="p-2 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-colors"
                >
                    {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>
                <Button
                    variant="outline"
                    className="bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20 rounded-full px-6"
                    onClick={onComplete}
                >
                    Skip Intro <ArrowRight size={16} className="ml-2 inline" />
                </Button>
            </div>

            {/* Branding Overlay (Optional) */}
            <div className="absolute bottom-10 left-10 text-white z-10">
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="text-4xl font-bold font-display tracking-tight"
                >
                    GreenPulse
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="text-lg text-white/80"
                >
                    Building a sustainable future, together.
                </motion.p>
            </div>

            {/* Progress Bar */}
            <div className="absolute bottom-0 left-0 w-full h-1 bg-white/20">
                <motion.div
                    className="h-full bg-primary-500"
                    style={{ width: `${progress}%` }}
                />
            </div>
        </motion.div>
    );
};

export default IntroVideo;
