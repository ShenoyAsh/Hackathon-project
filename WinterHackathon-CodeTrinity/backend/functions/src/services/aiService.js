const { GoogleGenerativeAI } = require("@google/generative-ai");
const { ImageAnnotatorClient } = require("@google-cloud/vision");
const logger = require("firebase-functions/logger");

// Initialize services
// Note: In a real production env, ensure GOOGLE_APPLICATION_CREDENTIALS is set for Vision API
// and GEMINI_API_KEY is available.
// Initialize services
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "YOUR_API_KEY_HERE");
const visionClient = new ImageAnnotatorClient();

/**
 * Analyzes an image using Google Cloud Vision API
 * @param {string} imageUrlOrBase64 - URL or Base64 string
 * @returns {Promise<Object>} Analysis results
 */
exports.analyzeImage = async (imageUrlOrBase64) => {
    if (!imageUrlOrBase64) return null;

    try {
        let request = {};
        // Check if it's a data URI (base64)
        if (imageUrlOrBase64.startsWith('data:image')) {
            const base64Content = imageUrlOrBase64.split(';base64,').pop();
            request = {
                image: { content: base64Content },
                features: [
                    { type: 'LABEL_DETECTION', maxResults: 10 },
                    { type: 'OBJECT_LOCALIZATION', maxResults: 10 },
                    { type: 'LANDMARK_DETECTION', maxResults: 5 }
                ]
            };
        } else {
            request = {
                image: { source: { imageUri: imageUrlOrBase64 } },
                features: [
                    { type: 'LABEL_DETECTION', maxResults: 10 },
                    { type: 'OBJECT_LOCALIZATION', maxResults: 10 },
                    { type: 'LANDMARK_DETECTION', maxResults: 5 }
                ]
            };
        }

        const [result] = await visionClient.annotateImage(request);

        return {
            labels: result.labelAnnotations?.map(label => ({
                description: label.description,
                score: label.score
            })) || [],
            objects: result.localizedObjectAnnotations?.map(obj => ({
                name: obj.name,
                score: obj.score,
                boundingBox: obj.boundingPoly
            })) || [],
            landmarks: result.landmarkAnnotations?.map(landmark => ({
                description: landmark.description,
                score: landmark.score,
                locations: landmark.locations
            })) || []
        };
    } catch (error) {
        logger.warn('Image analysis failed:', error);
        return { error: 'Image analysis failed' };
    }
};

/**
 * Generates an analysis of the greening proposal using Gemini
 */
exports.generateReportAnalysis = async (data) => {
    const { reportType, location, description, imageAnalysis } = data;

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
Analyze this urban greening proposal. return VALID JSON only.

Report Type: ${reportType}
Description: ${description}
Location: ${location?.address || 'Unknown'}

${imageAnalysis ? `
Vision Analysis:
Labels: ${imageAnalysis.labels?.map(l => l.description).join(', ')}
Objects: ${imageAnalysis.objects?.map(o => o.name).join(', ')}
` : ''}

Task:
1. Feasibility (0-100): Can trees be planted here?
2. Impact: Cooling effect?
3. Ownership: Public or Private (guess based on visual cues)?
4. Category: confirm report type.
5. Species: Recommend 3 native plant/tree species suitable for this specific location/climate.
6. Carbon: Estimate CO2 sequestration potential (kg/year) if greened.
7. Summary: 1 sentence summary.

Output JSON scheme:
{
  "feasibilityScore": number,
  "plantation_possible": boolean,
  "land_ownership_estimate": "Public" | "Private" | "Unknown",
  "suggested_category": "tree_loss" | "heat_hotspot" | "unused_space",
  "cooling_impact": "High" | "Medium" | "Low",
  "native_species_recommendations": ["string", "string", "string"],
  "estimated_carbon_offset": "string" (e.g. "25 kg/year"),
  "summary": "string",
  "recommendations": ["string"]
}
`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Robust cleaning
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();

        // Find the first '{' and last '}' to handle any preamble text
        const firstBrace = jsonStr.indexOf('{');
        const lastBrace = jsonStr.lastIndexOf('}');

        if (firstBrace !== -1 && lastBrace !== -1) {
            const cleanJson = jsonStr.substring(firstBrace, lastBrace + 1);
            return JSON.parse(cleanJson);
        }

        return JSON.parse(jsonStr);

    } catch (error) {
        logger.error('Gemini analysis failed:', error);
        return {
            feasibilityScore: 50,
            plantation_possible: true,
            land_ownership_estimate: "Unknown",
            suggested_category: reportType,
            cooling_impact: "Medium",
            native_species_recommendations: ["Neem", "Peepal", "Ashoka"],
            estimated_carbon_offset: "Unknown",
            summary: "Analysis pending manual review.",
            recommendations: ["Site check required"],
            error: 'AI analysis failed'
        };
    }
};
