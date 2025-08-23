// Test JSON extraction function
function extractJSONFromResponse(content) {
  let jsonContent = content.trim()
  
  // Remove markdown code blocks
  jsonContent = jsonContent.replace(/```json\s*/g, '').replace(/```\s*/g, '')
  
  // Find JSON object in the response
  const jsonMatch = jsonContent.match(/\{[\s\S]*\}/)
  if (jsonMatch) {
    return jsonMatch[0]
  }
  
  // If no JSON object found, return the original content
  return jsonContent
}

// Test cases
const testResponses = [
  // Clean JSON
  '{"detectedColors": ["Red", "Blue"], "suggestedVariants": []}',
  
  // JSON with markdown
  '```json\n{"detectedColors": ["Red", "Blue"], "suggestedVariants": []}\n```',
  
  // JSON with text before and after
  'Here is my analysis:\n\n```json\n{"detectedColors": ["Red", "Blue"], "suggestedVariants": []}\n```\n\nI hope this helps!',
  
  // JSON with code block without json specifier
  '```\n{"detectedColors": ["Red", "Blue"], "suggestedVariants": []}\n```',
  
  // Mixed content
  'I analyzed the images and found:\n\n```json\n{"detectedColors": ["Red", "Blue"], "suggestedVariants": []}\n```\n\nThese are the detected colors.'
]

console.log("JSON Extraction Test:")
console.log("====================")

testResponses.forEach((response, index) => {
  console.log(`\nTest ${index + 1}:`)
  console.log("Original:", JSON.stringify(response))
  
  try {
    const extracted = extractJSONFromResponse(response)
    console.log("Extracted:", extracted)
    
    const parsed = JSON.parse(extracted)
    console.log("✅ Successfully parsed:", parsed)
  } catch (error) {
    console.log("❌ Failed to parse:", error.message)
  }
}) 