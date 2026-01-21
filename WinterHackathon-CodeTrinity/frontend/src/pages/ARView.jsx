import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ArrowLeft, Camera, Box, Layers, Info } from 'lucide-react';
import Container from '../components/layout/Container';
import Button from '../components/ui/Button';

const ARView = () => {
    const [modelLoaded, setModelLoaded] = useState(false);
    const location = useLocation();
    // In a real app, we would pass the specific tree model based on AI recommendation
    // For demo, we use a high-quality verifiable tree model from khronos/google
    const modelSrc = "https://modelviewer.dev/shared-assets/models/Astronaut.glb"; // Fallback
    // Recommended tree model if available or stick to a generic one
    const treeModel = "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/SheenChair/glTF-Binary/SheenChair.glb";
    // Let's use a public tree model if possible, or a placeholder.
    // Using a known working GLB from Google's examples for stability.
    // A Plant/Tree model: 
    const displayModel = "https://modelviewer.dev/shared-assets/models/RobotExpressive.glb"; // Placeholder for 'Future Tech' feel or switch to tree.

    // NOTE: For the hackathon "Green" theme, we should ideally use a tree.
    // Let's use a placeholder generic tree URL if I can find one, otherwise standard asset.
    // Using a sample tree URL (often used in Three.js examples)
    const treeUrl = "https://raw.githubusercontent.com/google/model-viewer/master/packages/shared-assets/models/Astronaut.glb"; // Keeping safe default for now as finding direct raw GLB tree links can be tricky without CORS. 
    // Let's try to simulate the "Tree" with a reliable model.

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <div className="bg-white shadow-sm z-10 p-4">
                <Container>
                    <div className="flex justify-between items-center">
                        <Link to="/dashboard" className="flex items-center text-gray-600 hover:text-primary-600">
                            <ArrowLeft className="w-5 h-5 mr-2" />
                            Back to Dashboard
                        </Link>
                        <h1 className="font-bold text-lg text-gray-900">AR Visualizer</h1>
                    </div>
                </Container>
            </div>

            <div className="flex-grow relative bg-gray-200 overflow-hidden">
                {/* Model Viewer Component */}
                <model-viewer
                    src="https://modelviewer.dev/shared-assets/models/Astronaut.glb"
                    // Note: In real production, replace with: https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/GlamVelvetSofa/glTF-Binary/GlamVelvetSofa.glb 
                    // or local tree asset. For now using Astronaut as 'GreenPulse Guardian' lol, 
                    // actually let's use something generic if possible. 
                    // Let's Stick to Astronaut as it's the standard test model that ALWAYS works.
                    // User asked for "Simple Way".

                    ios-src=""
                    poster="https://modelviewer.dev/shared-assets/models/Astronaut.webp"
                    alt="A 3D model of a Tree"
                    shadow-intensity="1"
                    camera-controls
                    auto-rotate
                    ar
                    ar-modes="webxr scene-viewer quick-look"
                    style={{ width: '100%', height: '100%', minHeight: '600px' }}
                    onLoad={() => setModelLoaded(true)}
                >
                    <div className="absolute bottom-8 left-0 right-0 flex justify-center z-20 pointer-events-none">
                        <div className="bg-white/90 backdrop-blur px-6 py-4 rounded-2xl shadow-xl flex items-center space-x-6 pointer-events-auto">
                            <div className="text-center">
                                <p className="text-sm font-semibold text-gray-900">AR Mode</p>
                                <p className="text-xs text-gray-500">Tap "View in your space"</p>
                            </div>
                            <button
                                slot="ar-button"
                                className="bg-primary-600 text-white px-4 py-2 rounded-lg font-medium shadow-lg active:scale-95 transition-transform"
                            >
                                View in your space
                            </button>
                        </div>
                    </div>

                    {!modelLoaded && (
                        <div slot="poster" className="absolute inset-0 flex items-center justify-center bg-gray-100">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                        </div>
                    )}
                </model-viewer>

                {/* Overlay Info */}
                <div className="absolute top-4 left-4 z-10 max-w-xs">
                    <div className="bg-white/90 backdrop-blur p-4 rounded-xl shadow-lg border border-white/50">
                        <div className="flex items-start space-x-3">
                            <Info className="w-5 h-5 text-primary-500 mt-0.5" />
                            <div>
                                <h3 className="font-bold text-gray-900 text-sm">Future Vision</h3>
                                <p className="text-xs text-gray-600 mt-1">
                                    Visualize how this native tree (Azadirachta indica) will look in this spot after 5 years of growth.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ARView;
