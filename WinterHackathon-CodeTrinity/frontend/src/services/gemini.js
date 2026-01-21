import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

let genAI = null;
if (API_KEY) {
    genAI = new GoogleGenerativeAI(API_KEY);
} else {
    console.warn("VITE_GEMINI_API_KEY is missing in .env file. AI features will be simulated.");
}

export const analyzeImageWithGemini = async (imageBase64, mimeType = "image/jpeg", reportType = "general") => {
    if (!genAI) {
        // Instead of throwing, return a structured error so the UI can handle it gracefully check
        console.error("Gemini API Key is missing");
        return {
            isRelevant: false,
            spamReason: "Configuration Error: API Key missing",
            recommendation: "Error"
        };
    }

    try {
        // Use specific version to avoid alias resolution issues
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            safetySettings: [
                {
                    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
                    threshold: HarmBlockThreshold.BLOCK_NONE,
                },
                {
                    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
                    threshold: HarmBlockThreshold.BLOCK_NONE,
                },
                {
                    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
                    threshold: HarmBlockThreshold.BLOCK_NONE,
                },
                {
                    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
                    threshold: HarmBlockThreshold.BLOCK_NONE,
                },
            ],
        });

        const prompt = `
        You are acting as a "Cloud Vision API" agent for the GreenPulse app.
        The user reported this image as: ${reportType}.
        
        CRITICAL: DETERMINE RELEVANCE FIRST.
        If the image is:
        - Indoor environment (room, office, home, wall, floor)
        - A screenshot, document, meme, or text
        - A selfie, person, or body part
        - A generic object (computer, cup, car, etc.) without environmental context
        - Completely blurry or dark
        ...then it is IRRELEVANT. Return "isRelevant": false.

        Only if it is a VALID outdoor, nature, city street, or environmental scene:
        - Analyze for greening potential (planting trees, cleaning waste, etc.)
        - Set "isRelevant": true.

        Return STRICT JSON:
        {
            "isRelevant": boolean,
            "spamReason": "string (Why it is rejected, e.g. 'Indoor/Office image detected')",
            "visionTags": ["list", "of", "detected", "objects"],
            "riskLevel": "Low" | "Medium" | "High",
            "confidence": number (0-1),
            "recommendation": "Native plant suggestions or action items (Max 15 words)",
            "environmentalImpact": "Short description of impact",
            "nativeSpecies": ["List", "of", "3", "species"],
            "typeConfirmed": boolean
        }
        Only return the JSON. Do not include markdown formatting.
        `;

        const imagePart = {
            inlineData: {
                data: imageBase64.split(',')[1] || imageBase64, // Remove header if present
                mimeType
            }
        };

        const result = await model.generateContent([prompt, imagePart]);
        const response = await result.response;
        const text = response.text();

        // Robust JSON extraction
        let jsonStr = text.trim();
        const firstBrace = jsonStr.indexOf('{');
        const lastBrace = jsonStr.lastIndexOf('}');

        if (firstBrace !== -1 && lastBrace !== -1) {
            jsonStr = jsonStr.substring(firstBrace, lastBrace + 1);
        } else {
            // Fallback cleanup if regex matching fails (rare)
            jsonStr = jsonStr.replace(/```json/g, '').replace(/```/g, '').trim();
        }

        try {
            return JSON.parse(jsonStr);
        } catch (parseError) {
            console.error("JSON Parse Error:", parseError, "Text:", text);
            return {
                isRelevant: false,
                spamReason: "AI Response Error: Invalid JSON",
                recommendation: "Error"
            };
        }

    } catch (error) {
        console.error("Gemini Analysis Failed:", error);
        // Return a safe object that indicates failure rather than throwing, 
        // allowing the caller to handle the "spamReason".
        return {
            isRelevant: false,
            spamReason: "AI Service Error: " + (error.message || "Unknown error"),
            recommendation: "Error"
        };
    }
};
