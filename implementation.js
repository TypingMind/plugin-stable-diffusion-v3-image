const MODEL_NAMES = {
  SD3_5_MEDIUM: 'sd3.5-medium',
  SD3_5_LARGE: 'sd3.5-large',
  SD3_5_LARGE_TURBO: 'sd3.5-large-turbo',
  SD3_MEDIUM: 'sd3-medium',
  SD3_LARGE: 'sd3-large',
  SD3_LARGE_TURBO: 'sd3-large-turbo',
};

const UNSUPPORTED_NEGATIVE_PROMP_MODELS = [MODEL_NAMES.SD3_LARGE_TURBO];

async function image_generation_via_stable_diffusion_3(params, userSettings) {
  const { prompt, negative_prompt } = params;
  const { stabilityAPIKey, output_format, aspect_ratio, model } = userSettings;
  validateAPIKey(stabilityAPIKey);
  validateNegativePrompt(model, negative_prompt);

  try {
    const imageData = await generateImageFromStabilityAPI(
      stabilityAPIKey,
      prompt,
      {
        output_format,
        aspect_ratio,
        model,
        negative_prompt: UNSUPPORTED_NEGATIVE_PROMP_MODELS.includes(model) ? negative_prompt : undefined,
      }
    );
    return imageData;
  } catch (error) {
    console.error('Error generating image:', error);
    throw new Error('Error: ' + error.message);
  }
}

function isNonEmptyString(param) {
  return typeof param === 'string' && param.trim() !== '';
}

function validateNegativePrompt(model, negative_prompt) {
  // Validate negative prompt available with selected model  
  if (UNSUPPORTED_NEGATIVE_PROMP_MODELS.includes(model) && isNonEmptyString(negative_prompt)) {
    throw new Error(`Negative prompts are not supported with ${model} model. Please select a different model in the Plugin User Settings.`) 
  }
}

function validateAPIKey(apiKey) {
  if (!apiKey) {
    throw new Error(
      'Please set a Stable Diffusion API Key in the plugin settings.'
    );
  }
}
async function generateImageFromStabilityAPI(
  apiKey,
  prompt,
  { output_format, aspect_ratio, model, negative_prompt } = {}
) {
  const apiUrl = 'https://api.stability.ai/v2beta/stable-image/generate/sd3';

  const body = new FormData();

  body.append('prompt', prompt);

  output_format && body.append('output_format', output_format);
  aspect_ratio && body.append('aspect_ratio', aspect_ratio);
  model && body.append('model', model);
  negative_prompt && body.append("negative_prompt", negative_prompt);

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + apiKey,
      Accept: 'application/json; type=image/*',
    },
    body: body,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Stability API error: ${response.status}, Message: ${errorText}`
    );
  }

  const data = await response.json();
  return `![${prompt}](data:image/${output_format || 'png'};base64,${
    data.image
  })`;
}
