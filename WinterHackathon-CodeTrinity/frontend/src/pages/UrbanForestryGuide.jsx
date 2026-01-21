import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, TreePine, Leaf, Sun, Droplets } from 'lucide-react';

const GuideCard = ({ title, description, icon: Icon, color }) => (
    <motion.div
        whileHover={{ y: -5 }}
        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all"
    >
        <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center mb-4`}>
            <Icon className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
    </motion.div>
);

const UrbanForestryGuide = () => {
    const guides = [
        {
            title: "Vertical Gardens",
            description: "Green walls that act as sound barriers, air purifiers, and natural cooling agents for buildings. Ideal for dense urban areas with limited ground space.",
            icon: Leaf,
            color: "bg-green-500"
        },
        {
            title: "Permeable Pavements",
            description: "Porous surfaces that allow rainwater to infiltrate the ground, reducing runoff and recharging groundwater levels while preventing floods.",
            icon: Droplets,
            color: "bg-blue-500"
        },
        {
            title: "Miyawaki Forests",
            description: "A method of creating dense, native forests in small urban spaces. They grow 10x faster and are 30x denser than conventional plantations.",
            icon: TreePine,
            color: "bg-emerald-600"
        },
        {
            title: "Cool Roofs",
            description: "Reflective roofing materials that reflect more sunlight and absorb less heat, significantly lowering building temperatures and reducing energy use.",
            icon: Sun,
            color: "bg-orange-500"
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12 px-4">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-block p-3 bg-green-100 rounded-full text-green-700 mb-4"
                    >
                        <BookOpen className="w-6 h-6" />
                    </motion.div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Urban Forestry Guide</h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Learn about the innovative techniques transforming our concrete jungles into sustainable ecosystems.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
                    {guides.map((guide, index) => (
                        <GuideCard key={index} {...guide} />
                    ))}
                </div>

                <div className="mt-16 bg-white rounded-3xl p-8 shadow-xl border border-gray-100 text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Why Native Species?</h2>
                    <p className="text-gray-600 max-w-3xl mx-auto mb-6">
                        Planting native species is crucial because they are adapted to the local climate and soil conditions, require less water and fertilizer, and provide essential habitats for local wildlife like birds and butterflies.
                    </p>
                    <button className="px-8 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors shadow-lg shadow-green-200">
                        Download Full Guide (PDF)
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UrbanForestryGuide;
