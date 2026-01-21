import React, { createContext, useState, useContext } from 'react';

const translations = {
    en: {
        dashboard: "Dashboard",
        newReport: "New Report",
        map: "Map Visualization",
        profile: "Profile",
        stats: "Impact Stats",
        language: "Language",
        welcome: "Welcome back",
        heatIsland: "Heat Island",
        treeLoss: "Tree Loss",
        unusedSpace: "Unused Space"
    },
    es: {
        dashboard: "Panel de Control",
        newReport: "Nuevo Reporte",
        map: "Mapa",
        profile: "Perfil",
        stats: "Estadísticas",
        language: "Idioma",
        welcome: "Bienvenido de nuevo",
        heatIsland: "Isla de Calor",
        treeLoss: "Pérdida de Árboles",
        unusedSpace: "Espacio Sin Uso"
    },
    hi: {
        dashboard: "डैशबोर्ड",
        newReport: "नई रिपोर्ट",
        map: "मानचित्र",
        profile: "प्रोफ़ाइल",
        stats: "प्रभाव आँकड़े",
        language: "भाषा",
        welcome: "वापसी पर स्वागत है",
        heatIsland: "हीट आइलैंड",
        treeLoss: "पेड़ों की कटाई",
        unusedSpace: "खाली जगह"
    }
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState('en');

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t: translations[language] }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => useContext(LanguageContext);
