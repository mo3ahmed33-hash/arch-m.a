import { GoogleGenAI, Modality } from "@google/genai";
import { GeneratedImage } from '../types';

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const VIEW_PROMPTS = [
  { title: "Top View (Site Plan)", prompt: "Generate a photorealistic, high-resolution top-down site plan view of this building. Render in 1080x1080 resolution. Show immediate surroundings like landscaping and walkways. Strictly preserve the original architectural style, materials, and all fine details. Render in PNG format with realistic lighting and shadows." },
  { title: "Front Facade", prompt: "Generate a photorealistic, high-resolution, eye-level view of the front facade of this building. Render in 1080x1080 resolution. Strictly preserve the original architectural style, materials, and all fine details. Render in PNG format with dynamic daylight, light, and shadow to create a sense of life." },
  { title: "Rear Facade", prompt: "Generate a photorealistic, high-resolution, eye-level view of the rear facade of this building. Render in 1080x1080 resolution. Strictly preserve the original architectural style, materials, and all fine details. Render in PNG format with dynamic daylight, light, and shadow to create a sense of life." },
  { title: "Left Side Facade", prompt: "Generate a photorealistic, high-resolution, eye-level view of the left side facade of this building. Render in 1080x1080 resolution. Strictly preserve the original architectural style, materials, and all fine details. Render in PNG format with dynamic daylight, light, and shadow to create a sense of life." },
  { title: "Right Side Facade", prompt: "Generate a photorealistic, high-resolution, eye-level view of the right side facade of this building. Render in 1080x1080 resolution. Strictly preserve the original architectural style, materials, and all fine details. Render in PNG format with dynamic daylight, light, and shadow to create a sense of life." },
  { title: "Isometric 3D View", prompt: "Generate a photorealistic, high-resolution isometric 3D view of this building from a high angle. Render in 1080x1080 resolution. Strictly preserve the original architectural style, materials, and all fine details. Render in PNG format with clear, crisp lighting and shadows to emphasize its form." },
  { title: "Human-Eye Perspective (Street)", prompt: "Generate a photorealistic, high-resolution human-eye perspective shot from across the street. Capture the building's presence in its environment. Render in 1080x1080 resolution. Strictly preserve the original architectural style, materials, and all fine details. Render in PNG format, making it feel full of life with realistic light and shadow." },
  { title: "Human-Eye Perspective (Angle 1)", prompt: "Generate a photorealistic, high-resolution human-eye perspective shot from a front-left angle, looking up slightly. Emphasize the vertical lines and entrance. Render in 1080x1080 resolution. Strictly preserve the original architectural style, materials, and all fine details. Render in PNG format with beautiful, lifelike lighting." },
  { title: "Human-Eye Perspective (Angle 2)", prompt: "Generate a photorealistic, high-resolution human-eye perspective shot from a rear-right angle. Showcase the building's depth and form. Render in 1080x1080 resolution. Strictly preserve the original architectural style, materials, and all fine details. Render in PNG format with realistic afternoon light and shadows." },
  { title: "Close-up Detail Shot", prompt: "Generate a photorealistic, high-resolution close-up shot focusing on an interesting architectural detail of this building (like the entrance, a window, or material junction). Render in 1080x1080 resolution. Strictly preserve the original architectural style and material textures. Render in PNG format with dramatic lighting to highlight the details." },
];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Wraps the AI content generation call with a retry mechanism to handle rate limiting.
 * @param request The generation request object.
 * @param maxRetries Maximum number of retries.
 * @param initialDelay Initial delay in milliseconds before the first retry.
 * @returns The generation response.
 */
async function generateContentWithRetry(
  request: Parameters<typeof ai.models.generateContent>[0],
  maxRetries = 3,
  initialDelay = 2000
) {
  let attempt = 0;
  let currentDelay = initialDelay;

  while (attempt < maxRetries) {
    try {
      const response = await ai.models.generateContent(request);
      return response;
    } catch (error) {
      const isRateLimitError = error instanceof Error && (error.message.includes('"status":"RESOURCE_EXHAUSTED"') || error.message.includes('"code":429'));
      
      if (isRateLimitError) {
        attempt++;
        if (attempt >= maxRetries) {
          console.error(`Final attempt failed for rate-limited request.`, error);
          throw error;
        }
        console.warn(`Rate limit hit. Retrying in ${currentDelay / 1000}s... (Attempt ${attempt}/${maxRetries})`);
        await delay(currentDelay);
        currentDelay *= 2; // Exponential backoff
      } else {
        // Not a rate limit error, rethrow immediately
        throw error;
      }
    }
  }
  // This should be unreachable, but it satisfies TypeScript's need for a return path.
  throw new Error('Image generation failed after multiple retries.');
}

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

  const successfulImages: GeneratedImage[] = [];

  let index = 0;
  for (const { title, prompt } of VIEW_PROMPTS) {
    index++;
    try {
      onProgress(`Generating: ${title} (${index}/${VIEW_PROMPTS.length})`);
      const response = await generateContentWithRetry({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [imagePart, { text: prompt }],
        },
        config: {
          responseModalities: [Modality.IMAGE],
        },
      });
      
      const generatedImagePart = response.candidates?.[0]?.content?.parts?.find(part => part.inlineData);
      
      if (generatedImagePart && generatedImagePart.inlineData) {
        const generatedMimeType = generatedImagePart.inlineData.mimeType;
        const base64Data = generatedImagePart.inlineData.data;
        successfulImages.push({
          title,
          url: `data:${generatedMimeType};base64,${base64Data}`,
          mimeType: generatedMimeType
        });
      } else {
        console.error(`No image data returned for: ${title}`);
      }
    } catch (error) {
      console.error(`Failed to generate view for "${title}":`, error);
      // Continue to the next image even if one fails after retries
    }

    // Add a courtesy delay between API calls to pace requests and avoid hitting rate limits
    if (index < VIEW_PROMPTS.length) {
      await delay(1000); // 1-second delay
    }
  }

  if (successfulImages.length === 0) {
    throw new Error('All image generation requests failed. This may be due to API rate limits. Please check your plan and billing details, and try again after a moment.');
  }

  if(successfulImages.length < VIEW_PROMPTS.length) {
      onProgress(`Generated ${successfulImages.length}/${VIEW_PROMPTS.length} views successfully. Some views may have failed due to rate limiting.`);
  } else {
      onProgress('All views generated successfully!');
  }
  
  return successfulImages;
}