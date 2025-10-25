
import { GoogleGenAI, Modality } from "@google/genai";
import { GeneratedImage } from '../types';

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const VIEW_PROMPTS = [
  { title: "Top View (Site Plan)", prompt: "Generate a photorealistic, high-resolution top-down site plan view of this building. Show immediate surroundings like landscaping and walkways. Strictly preserve the original architectural style, materials, and all fine details. Render in PNG format with realistic lighting and shadows." },
  { title: "Front Facade", prompt: "Generate a photorealistic, high-resolution, eye-level view of the front facade of this building. Strictly preserve the original architectural style, materials, and all fine details. Render in PNG format with dynamic daylight, light, and shadow to create a sense of life." },
  { title: "Rear Facade", prompt: "Generate a photorealistic, high-resolution, eye-level view of the rear facade of this building. Strictly preserve the original architectural style, materials, and all fine details. Render in PNG format with dynamic daylight, light, and shadow to create a sense of life." },
  { title: "Left Side Facade", prompt: "Generate a photorealistic, high-resolution, eye-level view of the left side facade of this building. Strictly preserve the original architectural style, materials, and all fine details. Render in PNG format with dynamic daylight, light, and shadow to create a sense of life." },
  { title: "Right Side Facade", prompt: "Generate a photorealistic, high-resolution, eye-level view of the right side facade of this building. Strictly preserve the original architectural style, materials, and all fine details. Render in PNG format with dynamic daylight, light, and shadow to create a sense of life." },
  { title: "Isometric 3D View", prompt: "Generate a photorealistic, high-resolution isometric 3D view of this building from a high angle. Strictly preserve the original architectural style, materials, and all fine details. Render in PNG format with clear, crisp lighting and shadows to emphasize its form." },
  { title: "Human-Eye Perspective (Street)", prompt: "Generate a photorealistic, high-resolution human-eye perspective shot from across the street. Capture the building's presence in its environment. Strictly preserve the original architectural style, materials, and all fine details. Render in PNG format, making it feel full of life with realistic light and shadow." },
  { title: "Human-Eye Perspective (Angle 1)", prompt: "Generate a photorealistic, high-resolution human-eye perspective shot from a front-left angle, looking up slightly. Emphasize the vertical lines and entrance. Strictly preserve the original architectural style, materials, and all fine details. Render in PNG format with beautiful, lifelike lighting." },
  { title: "Human-Eye Perspective (Angle 2)", prompt: "Generate a photorealistic, high-resolution human-eye perspective shot from a rear-right angle. Showcase the building's depth and form. Strictly preserve the original architectural style, materials, and all fine details. Render in PNG format with realistic afternoon light and shadows." },
  { title: "Close-up Detail Shot", prompt: "Generate a photorealistic, high-resolution close-up shot focusing on an interesting architectural detail of this building (like the entrance, a window, or material junction). Strictly preserve the original architectural style and material textures. Render in PNG format with dramatic lighting to highlight the details." },
];

export async function generateArchitecturalViews(
  imageBase64: string,
  mimeType: string,
  onProgress: (message: string) => void
): Promise<GeneratedImage[]> {

  onProgress(`Preparing to generate ${VIEW_PROMPTS.length} views...`);

  const imagePart = {
    inlineData: {
      data: imageBase64,
      mimeType: mimeType,
    },
  };

  const generationPromises = VIEW_PROMPTS.map(async ({ title, prompt }, index) => {
    try {
      onProgress(`Generating: ${title} (${index + 1}/${VIEW_PROMPTS.length})`);
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [imagePart, { text: prompt }],
        },
        config: {
          responseModalities: [Modality.IMAGE],
        },
      });
      
      // FIX: Renamed `imagePart` to avoid a variable naming conflict with the `imagePart` in the outer scope.
      const generatedImagePart = response.candidates?.[0]?.content?.parts?.find(part => part.inlineData);
      
      if (generatedImagePart && generatedImagePart.inlineData) {
        const generatedMimeType = generatedImagePart.inlineData.mimeType;
        const base64Data = generatedImagePart.inlineData.data;
        return {
          status: 'fulfilled',
          value: {
            title,
            url: `data:${generatedMimeType};base64,${base64Data}`,
            mimeType: generatedMimeType
          }
        };
      } else {
        throw new Error(`No image data returned for: ${title}`);
      }

    } catch (error) {
      console.error(`Failed to generate view for "${title}":`, error);
      return { status: 'rejected', reason: new Error(`Failed to generate: ${title}`) };
    }
  });

  const results = await Promise.allSettled(generationPromises);
  
  const successfulImages: GeneratedImage[] = [];
  results.forEach(result => {
    if (result.status === 'fulfilled' && result.value.status === 'fulfilled') {
      successfulImages.push(result.value.value);
    }
  });

  if (successfulImages.length === 0) {
    throw new Error('All image generation requests failed. Please check the console for details and try again.');
  }

  onProgress('All views generated successfully!');
  return successfulImages;
}
