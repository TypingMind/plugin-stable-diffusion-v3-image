async function image_generation_via_stable_diffusion_3(params, userSettings) {
  const { prompt, negative_prompt } = params;
  const { stabilityAPIKey, output_format, aspect_ratio, model } = userSettings;
  validateAPIKey(stabilityAPIKey);

  try {
    const imageData = await generateImageFromStabilityAPI(
      stabilityAPIKey,
      prompt,
      {
        output_format,
        aspect_ratio,
        model,
        negative_prompt
      }
    );

    return imageData;
  } catch (error) {
    console.error('Error generating image:', error);
    throw new Error('Error: ' + error.message);
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
