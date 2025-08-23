  import OpenAI from 'openai'

// Initialize OpenAI client with error handling
let openai: OpenAI | null = null

try {
  const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY
  if (apiKey) {
    openai = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true // Note: In production, this should be server-side
    })
  }
} catch (error) {
  console.warn('OpenAI client initialization failed:', error)
}

export interface ProductInfo {
  name: string
  category?: string
  price?: number
  cost_price?: number
  variants?: Array<{
    sku: string
    color?: string
    size?: string
    gender?: string
    brand?: string
    price: number
    stock_quantity: number
    image_url?: string
  }>
  images?: string[]
  mainImage?: string
  unit?: string
  stock_quantity?: number
  min_stock_level?: number
  max_stock_level?: number
  discount_amount?: number
  discount_type?: 'percentage' | 'fixed'
  discount_description?: string
}

export interface GeneratedDescription {
  description: string
  marketing_copy?: string
  features?: string[]
  tags?: string[]
}

export interface GeneratedTitle {
  title: string
  alternative_titles?: string[]
  keywords?: string[]
}

export interface PriceOptimizationData {
  productId: string
  currentPrice: number
  costPrice?: number
  category?: string
  stockQuantity?: number
  salesHistory?: Array<{
    date: string
    quantity: number
    revenue: number
  }>
  competitorPrices?: Array<{
    competitor: string
    price: number
  }>
  marketTrends?: {
    demandTrend: 'increasing' | 'decreasing' | 'stable'
    priceTrend: 'increasing' | 'decreasing' | 'stable'
    seasonality?: string
  }
}

export interface PriceOptimizationSuggestion {
  suggestedPrice: number
  priceChangePercentage: number
  optimizationReason: string
  confidenceScore: number
  expectedImpact: {
    revenueChange: number
    profitChange: number
    demandChange: number
    marketPosition: 'improved' | 'maintained' | 'declined'
  }
  factors: string[]
  risks: string[]
}

/**
 * Generate product description using AI based on product information and images
 */
export async function generateProductDescription(productInfo: ProductInfo): Promise<GeneratedDescription> {
  try {
    // Check if OpenAI client is available
    if (!openai) {
      throw new Error('OpenAI API key is not configured. Please add NEXT_PUBLIC_OPENAI_API_KEY to your environment variables.')
    }

    // Prepare images for analysis
    const imagesToAnalyze = await prepareImagesForAnalysis(productInfo)
    
    // Build comprehensive prompt with all product information
    const prompt = buildProductDescriptionPrompt(productInfo)
    
    const messages: any[] = [
      {
        role: "system",
        content: `You are a helpful product description writer for a retail store. 
        
        **WRITING GUIDELINES:**
        - Analyze the product images carefully and describe what you actually see
        - Be honest and realistic - don't overpromise or use excessive hype
        - Focus on factual information about the product's design, style, and materials
        - Describe the visual appearance, colors, patterns, and design elements you observe
        - Mention practical benefits based on what you can see in the images
        - Keep descriptions concise (100-200 words)
        - Use clear, simple language that customers can understand
        - Don't mention specific prices (they can change)
        - Don't use marketing buzzwords like "unbeatable", "essential", "perfect"
        - Don't create urgency with "limited stock" or "don't miss out"
        - Focus on helping customers understand what the product looks like and its features
        
        **WHAT TO INCLUDE:**
        - Visual description of what you see in the images
        - Design elements, colors, patterns, and style
        - Materials and construction details visible in the images
        - Available options (sizes, colors, etc.)
        - Practical benefits based on visual analysis
        
        **WHAT TO AVOID:**
        - Overly promotional language
        - Price mentions
        - Exaggerated claims about quality
        - Creating false urgency
        - Generic marketing phrases
        - Describing features you cannot see in the images`
      }
    ]

    // Add images if available
    if (imagesToAnalyze.length > 0) {
      messages.push({
        role: "user",
        content: [
          {
            type: "text",
            text: prompt
          },
                     ...imagesToAnalyze.map((imageUrl: string) => ({
             type: "image_url",
             image_url: {
               url: imageUrl
             }
           }))
        ]
      })
    } else {
      messages.push({
        role: "user",
        content: prompt
      })
    }
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4o", // Using GPT-4o for vision capabilities
      messages,
      max_tokens: 500,
      temperature: 0.7
    })

    const response = completion.choices[0]?.message?.content || ''
    
    // Parse the response to extract different parts
    return parseAIResponse(response)
  } catch (error) {
    console.error('Error generating product description:', error)
    if (error instanceof Error && error.message.includes('API key')) {
      throw new Error('OpenAI API key is not configured. Please add NEXT_PUBLIC_OPENAI_API_KEY to your environment variables.')
    }
    throw new Error('Failed to generate product description. Please try again.')
  }
}

/**
 * Generate product title using AI based on product information and images
 */
export async function generateProductTitle(productInfo: ProductInfo): Promise<GeneratedTitle> {
  try {
    // Check if OpenAI client is available
    if (!openai) {
      throw new Error('OpenAI API key is not configured. Please add NEXT_PUBLIC_OPENAI_API_KEY to your environment variables.')
    }

    // Prepare images for analysis
    const imagesToAnalyze = await prepareImagesForAnalysis(productInfo)
    
    // Build comprehensive prompt for title generation
    const prompt = buildProductTitlePrompt(productInfo)
    
    const messages: any[] = [
      {
        role: "system",
        content: `You are a product title generator for a retail store. 
        
        **TITLE GUIDELINES:**
        - Create clear, descriptive titles that help customers understand what the product is
        - Analyze product images to identify key visual features and include them in the title
        - Keep titles concise (3-8 words) but informative
        - Include important details like color, size, material, or style when visible
        - Use proper capitalization and avoid excessive punctuation
        - Make titles searchable and SEO-friendly
        - Be specific about what you can see in the images
        - Don't use marketing hype or promotional language
        - Focus on factual, descriptive terms
        
        **IMPORTANT - BRAND NAME HANDLING:**
        - If you detect a brand name in the image (like Nike, Adidas, etc.), DO NOT include it in the title
        - Instead, describe the product type and features without mentioning the brand
        - Use generic terms like "Athletic Shoes", "Sports Apparel", "Casual Wear" instead of brand names
        - This helps avoid trademark issues and makes titles more generic
        
        **WHAT TO INCLUDE:**
        - Product type/category
        - Key visual features (color, pattern, style)
        - Material if clearly identifiable
        - Size or dimensions if relevant
        - Style descriptors (casual, formal, athletic, etc.)
        
        **WHAT TO AVOID:**
        - Brand names (Nike, Adidas, Apple, etc.)
        - Generic terms like "amazing", "best", "premium"
        - Price mentions
        - Marketing buzzwords
        - Overly long titles
        - Vague descriptions`
      }
    ]

    // Add images if available
    if (imagesToAnalyze.length > 0) {
      messages.push({
        role: "user",
        content: [
          {
            type: "text",
            text: prompt
          },
          ...imagesToAnalyze.map((imageUrl: string) => ({
            type: "image_url",
            image_url: {
              url: imageUrl
            }
          }))
        ]
      })
    } else {
      messages.push({
        role: "user",
        content: prompt
      })
    }
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4o", // Using GPT-4o for vision capabilities
      messages,
      max_tokens: 200,
      temperature: 0.7
    })

    const response = completion.choices[0]?.message?.content || ''
    
    // Parse the response to extract title and alternatives
    return parseTitleResponse(response)
  } catch (error) {
    console.error('Error generating product title:', error)
    if (error instanceof Error && error.message.includes('API key')) {
      throw new Error('OpenAI API key is not configured. Please add NEXT_PUBLIC_OPENAI_API_KEY to your environment variables.')
    }
    throw new Error('Failed to generate product title. Please try again.')
  }
}

/**
 * Generate AI-powered price optimization suggestions
 */
export async function generatePriceOptimizationSuggestions(
  optimizationData: PriceOptimizationData
): Promise<PriceOptimizationSuggestion> {
  try {
    if (!openai) {
      throw new Error('OpenAI API key is not configured')
    }

    const prompt = buildPriceOptimizationPrompt(optimizationData)

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert retail pricing analyst and AI consultant specializing in price optimization.

**ANALYSIS GUIDELINES:**
- Analyze current pricing, market conditions, and sales data
- Consider cost structure, competitor pricing, and demand elasticity
- Provide data-driven price recommendations with clear reasoning
- Assess potential impact on revenue, profit, and market position
- Identify risks and mitigating factors
- Provide confidence scores based on data quality and market conditions

**OUTPUT FORMAT:**
Return a JSON object with the following structure:
{
  "suggestedPrice": number,
  "priceChangePercentage": number,
  "optimizationReason": "detailed explanation",
  "confidenceScore": number (0-1),
  "expectedImpact": {
    "revenueChange": number (percentage),
    "profitChange": number (percentage),
    "demandChange": number (percentage),
    "marketPosition": "improved|maintained|declined"
  },
  "factors": ["factor1", "factor2", "factor3"],
  "risks": ["risk1", "risk2", "risk3"]
}

**IMPORTANT:**
- Be conservative with price changes (typically ±15% max)
- Consider seasonal factors and market conditions
- Account for competitor pricing and market positioning
- Provide realistic confidence scores based on available data
- Focus on long-term profitability, not just short-term gains`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 1000,
      temperature: 0.3
    })

    const response = completion.choices[0]?.message?.content || ''
    return parsePriceOptimizationResponse(response)
  } catch (error) {
    console.error('Error generating price optimization suggestions:', error)
    throw new Error('Failed to generate price optimization suggestions')
  }
}

/**
 * Generate bulk price optimization suggestions for multiple products
 */
export async function generateBulkPriceOptimizationSuggestions(
  productsData: PriceOptimizationData[]
): Promise<Array<PriceOptimizationSuggestion & { productId: string }>> {
  try {
    const suggestions = []
    
    for (const productData of productsData) {
      try {
        const suggestion = await generatePriceOptimizationSuggestions(productData)
        suggestions.push({
          ...suggestion,
          productId: productData.productId
        })
      } catch (error) {
        console.error(`Error generating suggestion for product ${productData.productId}:`, error)
        // Continue with other products
      }
    }
    
    return suggestions
  } catch (error) {
    console.error('Error generating bulk price optimization suggestions:', error)
    throw new Error('Failed to generate bulk price optimization suggestions')
  }
}

/**
 * Analyze market trends and competitor pricing
 */
export async function analyzeMarketTrends(
  category: string,
  currentPrice: number,
  competitorPrices: Array<{ competitor: string; price: number }>
): Promise<{
  marketAverage: number
  marketPosition: 'above' | 'below' | 'average'
  competitiveGap: number
  trendAnalysis: string
  recommendations: string[]
}> {
  try {
    if (!openai) {
      throw new Error('OpenAI API key is not configured')
    }

    const prompt = `Analyze the market position and competitive landscape for a product in the ${category} category.

Current Price: $${currentPrice}
Competitor Prices: ${competitorPrices.map(cp => `${cp.competitor}: $${cp.price}`).join(', ')}

Provide analysis in JSON format:
{
  "marketAverage": number,
  "marketPosition": "above|below|average",
  "competitiveGap": number (percentage difference from market average),
  "trendAnalysis": "detailed analysis of market trends",
  "recommendations": ["recommendation1", "recommendation2", "recommendation3"]
}`

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a market analysis expert. Provide concise, data-driven analysis of competitive positioning and market trends."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 500,
      temperature: 0.2
    })

    const response = completion.choices[0]?.message?.content || ''
    return JSON.parse(response)
  } catch (error) {
    console.error('Error analyzing market trends:', error)
    throw new Error('Failed to analyze market trends')
  }
}

/**
 * Convert blob URL to base64 data URL
 */
async function blobUrlToBase64(blobUrl: string): Promise<string> {
  try {
    const response = await fetch(blobUrl)
    const blob = await response.blob()
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  } catch (error) {
    console.error('Error converting blob URL to base64:', error)
    throw error
  }
}

/**
 * Check if URL is a blob URL
 */
function isBlobUrl(url: string): boolean {
  return url.startsWith('blob:')
}

/**
 * Common brand names that should be omitted from titles
 */
const BRAND_NAMES = [
  'nike', 'adidas', 'puma', 'reebok', 'converse', 'vans', 'new balance',
  'under armour', 'asics', 'skechers', 'timberland', 'clarks', 'dr martens',
  'levi\'s', 'calvin klein', 'tommy hilfiger', 'ralph lauren', 'polo',
  'gap', 'old navy', 'banana republic', 'h&m', 'zara', 'uniqlo',
  'apple', 'samsung', 'sony', 'lg', 'panasonic', 'philips',
  'coca cola', 'pepsi', 'starbucks', 'mcdonalds', 'kfc', 'burger king',
  'gucci', 'prada', 'louis vuitton', 'chanel', 'hermes', 'dior',
  'ray ban', 'oakley', 'maui jim', 'costa del mar'
]

/**
 * Check if text contains brand names
 */
function containsBrandName(text: string): boolean {
  const lowerText = text.toLowerCase()
  return BRAND_NAMES.some(brand => lowerText.includes(brand))
}

/**
 * Remove brand names from text
 */
function removeBrandNames(text: string): string {
  let cleanedText = text
  BRAND_NAMES.forEach(brand => {
    const regex = new RegExp(`\\b${brand}\\b`, 'gi')
    cleanedText = cleanedText.replace(regex, '')
  })
  // Clean up extra spaces and punctuation
  return cleanedText.replace(/\s+/g, ' ').replace(/\s*,\s*/g, ', ').trim()
}

/**
 * Generate alternative title without brand names
 */
function generateAlternativeTitle(originalTitle: string): string {
  const withoutBrand = removeBrandNames(originalTitle)
  if (withoutBrand.length < 3) {
    // If removing brand leaves too little, add generic terms
    return `Premium ${originalTitle.split(' ').slice(-2).join(' ')}`
  }
  return withoutBrand
}

/**
 * Extract JSON from AI response, handling various formats
 */
function extractJSONFromResponse(content: string): string {
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

/**
 * Prepare images for AI analysis
 */
async function prepareImagesForAnalysis(productInfo: ProductInfo): Promise<string[]> {
  const imagesToAnalyze: string[] = []
  
  // Helper function to process image URL
  const processImageUrl = async (imageUrl: string): Promise<string> => {
    if (isBlobUrl(imageUrl)) {
      return await blobUrlToBase64(imageUrl)
    }
    return imageUrl
  }
  
  // Add main image if available
  if (productInfo.mainImage) {
    try {
      const processedUrl = await processImageUrl(productInfo.mainImage)
      imagesToAnalyze.push(processedUrl)
    } catch (error) {
      console.warn('Failed to process main image:', error)
    }
  }
  
  // Add variant images if available
  if (productInfo.variants) {
    for (const variant of productInfo.variants) {
      if (variant.image_url && !imagesToAnalyze.includes(variant.image_url)) {
        try {
          const processedUrl = await processImageUrl(variant.image_url)
          imagesToAnalyze.push(processedUrl)
        } catch (error) {
          console.warn('Failed to process variant image:', error)
        }
      }
    }
  }
  
  // Add additional images if available (limit to 3 to avoid token limits)
  if (productInfo.images) {
    for (const image of productInfo.images) {
      if (!imagesToAnalyze.includes(image) && imagesToAnalyze.length < 3) {
        try {
          const processedUrl = await processImageUrl(image)
          imagesToAnalyze.push(processedUrl)
        } catch (error) {
          console.warn('Failed to process additional image:', error)
        }
      }
    }
  }
  
  return imagesToAnalyze
}

/**
 * Build a comprehensive prompt for the AI based on product information
 */
function buildProductDescriptionPrompt(productInfo: ProductInfo): string {
  let prompt = `Generate a compelling product description for: "${productInfo.name}"\n\n`
  
  // Basic product info
  prompt += `**Product Details:**\n`
  prompt += `- Name: ${productInfo.name}\n`
  if (productInfo.category) prompt += `- Category: ${productInfo.category}\n`
  if (productInfo.price) prompt += `- Price: $${productInfo.price}\n`
  if (productInfo.unit) prompt += `- Unit: ${productInfo.unit}\n`
  
  // Variants information
  if (productInfo.variants && productInfo.variants.length > 0) {
    prompt += `\n**Available Variants:**\n`
    productInfo.variants.forEach(variant => {
      prompt += `- SKU: ${variant.sku}`
      if (variant.color) prompt += ` | Color: ${variant.color}`
      if (variant.size) prompt += ` | Size: ${variant.size}`
      if (variant.gender) prompt += ` | Gender: ${variant.gender}`
      if (variant.brand) prompt += ` | Brand: ${variant.brand}`
      prompt += ` | Price: $${variant.price} | Stock: ${variant.stock_quantity}\n`
    })
  }
  
  // Stock information
  if (productInfo.stock_quantity !== undefined) {
    prompt += `\n**Stock Information:**\n`
    prompt += `- Current Stock: ${productInfo.stock_quantity} ${productInfo.unit || 'units'}\n`
    if (productInfo.min_stock_level) prompt += `- Minimum Stock Level: ${productInfo.min_stock_level}\n`
    if (productInfo.max_stock_level) prompt += `- Maximum Stock Level: ${productInfo.max_stock_level}\n`
  }
  
  // Discount information
  if (productInfo.discount_amount && productInfo.discount_type) {
    prompt += `\n**Special Offer:**\n`
    const discountText = productInfo.discount_type === 'percentage' 
      ? `${productInfo.discount_amount}% off`
      : `$${productInfo.discount_amount} off`
    prompt += `- ${discountText}`
    if (productInfo.discount_description) prompt += ` - ${productInfo.discount_description}\n`
  }
  
  // Images context
  if (productInfo.images && productInfo.images.length > 0) {
    prompt += `\n**Product Images:** Available (${productInfo.images.length} images)\n`
  }
  
  prompt += `\n**IMAGE ANALYSIS INSTRUCTIONS:**\n`
  prompt += `1. Carefully examine the product images provided\n`
  prompt += `2. Describe what you actually see in the images - design, colors, style, materials\n`
  prompt += `3. Mention visual details like patterns, textures, construction, and design elements\n`
  prompt += `4. Describe the overall appearance and aesthetic of the product\n`
  prompt += `5. If multiple images show different angles or variants, describe those differences\n`
  prompt += `6. Only describe features you can actually see in the images\n`
  prompt += `7. Use the product information as supplementary context, not as the main description\n`
  prompt += `8. Focus on helping customers understand what the product looks like\n`
  
  return prompt
}

/**
 * Build a comprehensive prompt for title generation
 */
function buildProductTitlePrompt(productInfo: ProductInfo): string {
  let prompt = `Generate a compelling product title for: "${productInfo.name}"\n\n`
  
  // Basic product info
  prompt += `**Product Details:**\n`
  prompt += `- Current Name: ${productInfo.name}\n`
  if (productInfo.category) prompt += `- Category: ${productInfo.category}\n`
  if (productInfo.price) prompt += `- Price: $${productInfo.price}\n`
  if (productInfo.unit) prompt += `- Unit: ${productInfo.unit}\n`
  
  // Variants information
  if (productInfo.variants && productInfo.variants.length > 0) {
    prompt += `\n**Available Variants:**\n`
    productInfo.variants.forEach(variant => {
      prompt += `- SKU: ${variant.sku}`
      if (variant.color) prompt += ` | Color: ${variant.color}`
      if (variant.size) prompt += ` | Size: ${variant.size}`
      if (variant.gender) prompt += ` | Gender: ${variant.gender}`
      if (variant.brand) prompt += ` | Brand: ${variant.brand}`
      prompt += ` | Price: $${variant.price}\n`
    })
  }
  
  // Stock information
  if (productInfo.stock_quantity !== undefined) {
    prompt += `\n**Stock Information:**\n`
    prompt += `- Current Stock: ${productInfo.stock_quantity} ${productInfo.unit || 'units'}\n`
    if (productInfo.min_stock_level !== undefined) prompt += `- Min Stock Level: ${productInfo.min_stock_level}\n`
    if (productInfo.max_stock_level !== undefined) prompt += `- Max Stock Level: ${productInfo.max_stock_level}\n`
  }
  
  // Discount information
  if (productInfo.discount_amount && productInfo.discount_type) {
    prompt += `\n**Discount Information:**\n`
    prompt += `- Discount: ${productInfo.discount_amount}${productInfo.discount_type === 'percentage' ? '%' : '$'} off\n`
    if (productInfo.discount_description) prompt += `- Description: ${productInfo.discount_description}\n`
  }
  
  prompt += `\n**Instructions:**\n`
  prompt += `1. Analyze the product images carefully to identify key visual features\n`
  prompt += `2. Create a clear, descriptive title that includes important details\n`
  prompt += `3. Provide 2-3 alternative title options\n`
  prompt += `4. Extract relevant keywords for search optimization\n`
  prompt += `5. Keep the main title concise but informative\n`
  
  prompt += `\n**Response Format:**\n`
  prompt += `Main Title: [Your main title here]\n`
  prompt += `Alternative 1: [Alternative title option]\n`
  prompt += `Alternative 2: [Alternative title option]\n`
  prompt += `Keywords: [keyword1, keyword2, keyword3]\n`
  
  return prompt
}

/**
 * Parse the AI response to extract different parts
 */
function parseAIResponse(response: string): GeneratedDescription {
  // For now, return the full response as description
  // In a more advanced implementation, you could parse structured responses
  return {
    description: response.trim(),
    marketing_copy: response.trim(),
    features: extractFeatures(response),
    tags: extractTags(response)
  }
}

/**
 * Parse AI response for title generation
 */
function parseTitleResponse(response: string): GeneratedTitle {
  const lines = response.split('\n').map(line => line.trim()).filter(line => line.length > 0)
  
  let title = ''
  const alternativeTitles: string[] = []
  const keywords: string[] = []
  
  for (const line of lines) {
    if (line.toLowerCase().startsWith('main title:')) {
      title = line.replace(/^main title:\s*/i, '').trim()
    } else if (line.toLowerCase().startsWith('alternative')) {
      const altTitle = line.replace(/^alternative\s*\d+:\s*/i, '').trim()
      if (altTitle) alternativeTitles.push(altTitle)
    } else if (line.toLowerCase().startsWith('keywords:')) {
      const keywordsStr = line.replace(/^keywords:\s*/i, '').trim()
      keywords.push(...keywordsStr.split(',').map(k => k.trim()).filter(k => k.length > 0))
    }
  }
  
  // If no structured response, try to extract title from the response
  if (!title && response.trim()) {
    title = response.trim()
  }
  
  // Check if title contains brand names and generate alternatives
  if (title && containsBrandName(title)) {
    const brandFreeTitle = removeBrandNames(title)
    if (brandFreeTitle.length > 2) {
      // Add brand-free version as first alternative
      alternativeTitles.unshift(brandFreeTitle)
    }
    
    // Also generate a generic alternative
    const genericAlternative = generateAlternativeTitle(title)
    if (genericAlternative !== title && !alternativeTitles.includes(genericAlternative)) {
      alternativeTitles.push(genericAlternative)
    }
  }
  
  return {
    title: title || 'Product Title',
    alternative_titles: alternativeTitles,
    keywords: keywords
  }
}

/**
 * Extract features from the description
 */
function extractFeatures(description: string): string[] {
  // Simple feature extraction - look for bullet points or numbered lists
  const features: string[] = []
  const lines = description.split('\n')
  
  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed.match(/^[•\-\*]\s/) || trimmed.match(/^\d+\.\s/)) {
      features.push(trimmed.replace(/^[•\-\*]\s/, '').replace(/^\d+\.\s/, ''))
    }
  }
  
  return features
}

/**
 * Extract tags/keywords from the description
 */
function extractTags(description: string): string[] {
  // Simple keyword extraction
  const words = description.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 3)
  
  // Remove common words
  const commonWords = ['the', 'and', 'for', 'with', 'this', 'that', 'have', 'from', 'they', 'will', 'been', 'good', 'very', 'when', 'your', 'said', 'each', 'which', 'their', 'time', 'would', 'there', 'could', 'other', 'than', 'first', 'then', 'more', 'about', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'between', 'among', 'product', 'quality', 'available', 'perfect', 'great', 'excellent', 'amazing', 'wonderful', 'beautiful', 'stunning', 'gorgeous', 'fabulous', 'fantastic', 'incredible', 'outstanding', 'superior', 'premium', 'luxury', 'comfortable', 'durable', 'versatile', 'stylish', 'modern', 'classic', 'elegant', 'sophisticated', 'trendy', 'fashionable', 'attractive', 'appealing', 'desirable', 'essential', 'practical', 'functional', 'reliable', 'trusted', 'popular', 'favorite', 'best', 'top', 'leading', 'preferred', 'chosen', 'selected', 'recommended', 'suggested', 'ideal', 'perfect', 'suitable', 'appropriate', 'proper', 'correct', 'right', 'exact', 'precise', 'accurate', 'detailed', 'comprehensive', 'complete', 'thorough', 'extensive', 'wide', 'broad', 'various', 'different', 'diverse', 'multiple', 'several', 'many', 'numerous', 'countless', 'endless', 'infinite', 'unlimited', 'boundless', 'limitless', 'unrestricted', 'free', 'open', 'accessible', 'available', 'ready', 'prepared', 'set', 'arranged', 'organized', 'structured', 'systematic', 'methodical', 'logical', 'rational', 'reasonable', 'sensible', 'practical', 'realistic', 'achievable', 'attainable', 'reachable', 'obtainable', 'accessible', 'available', 'ready', 'prepared', 'set', 'arranged', 'organized', 'structured', 'systematic', 'methodical', 'logical', 'rational', 'reasonable', 'sensible', 'practical', 'realistic', 'achievable', 'attainable', 'reachable', 'obtainable']
  
  const uniqueWords = [...new Set(words.filter(word => !commonWords.includes(word)))]
  
  return uniqueWords.slice(0, 10) // Return top 10 keywords
}

/**
 * Generate a shorter marketing copy for social media or quick descriptions
 */
export async function generateMarketingCopy(productInfo: ProductInfo): Promise<string> {
  try {
    // Check if OpenAI client is available
    if (!openai) {
      throw new Error('OpenAI API key is not configured. Please add NEXT_PUBLIC_OPENAI_API_KEY to your environment variables.')
    }

    const prompt = `Create a brief, factual product summary (30-60 words) for: "${productInfo.name}"
    
    Product Details:
    - Name: ${productInfo.name}
    ${productInfo.category ? `- Category: ${productInfo.category}` : ''}
    ${productInfo.variants && productInfo.variants.length > 0 ? `- Available in multiple sizes and colors` : ''}
    
    Write a simple description that:
    - Explains what the product is
    - Mentions key features
    - Uses clear, honest language
    - Avoids marketing hype
    - Helps customers understand the product`
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a helpful product writer who creates clear, factual product descriptions. Focus on explaining what the product is and its features without marketing hype or exaggeration."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 150,
      temperature: 0.8
    })

    return completion.choices[0]?.message?.content?.trim() || ''
  } catch (error) {
    console.error('Error generating marketing copy:', error)
    if (error instanceof Error && error.message.includes('API key')) {
      throw new Error('OpenAI API key is not configured. Please add NEXT_PUBLIC_OPENAI_API_KEY to your environment variables.')
    }
    throw new Error('Failed to generate marketing copy.')
  }
} 

/**
 * Analyze product images to detect colors and suggest variants
 */
export async function analyzeProductImagesForVariants(
  images: string[],
  productName: string,
  basePrice: number
): Promise<{
  detectedColors: string[]
  suggestedVariants: Array<{
    color: string
    size?: string
    sku: string
    price: number
    confidence: number
  }>
  error?: string
}> {
  if (!openai) {
    return {
      detectedColors: [],
      suggestedVariants: [],
      error: 'OpenAI API key is not configured. Please add NEXT_PUBLIC_OPENAI_API_KEY to your environment variables.'
    }
  }

  try {
    // Prepare the prompt for image analysis
    const prompt = `
Analyze these product images and detect:

1. **Primary Colors**: Identify the main colors of the product in each image
2. **Product Variations**: Detect if images show different variants (colors, sizes, styles)
3. **Suggested Variants**: Create variant combinations based on detected colors

Product Name: "${productName}"
Base Price: $${basePrice}

For each detected color/variant, provide:
- Color name (use standard color names like "Red", "Blue", "Black", "White", "Navy", "Gray", etc.)
- Confidence level (0-1)
- Suggested SKU format: [PRODUCT-SHORTNAME]-[SIZE]-[COLOR]
- Price variation (if any)

IMPORTANT: Return ONLY valid JSON without any markdown formatting, code blocks, or additional text. The response must be parseable JSON.

Expected JSON format:
{
  "detectedColors": ["Red", "Blue", "Black"],
  "suggestedVariants": [
    {
      "color": "Red",
      "size": "Standard",
      "sku": "PROD-RED",
      "price": ${basePrice},
      "confidence": 0.95
    }
  ]
}

Focus on:
- Accurate color detection
- Realistic variant combinations
- Standard color naming
- Appropriate pricing variations
`

    // Convert image URLs to base64 for OpenAI Vision API
    const imageContents = await Promise.all(
      images.map(async (imageUrl) => {
        try {
          if (isBlobUrl(imageUrl)) {
            const base64Data = await blobUrlToBase64(imageUrl)
            // Extract base64 data from data URL
            return base64Data.split(',')[1]
          } else {
            const response = await fetch(imageUrl)
            const buffer = await response.arrayBuffer()
            return Buffer.from(buffer).toString('base64')
          }
        } catch (error) {
          console.error('Error converting image to base64:', error)
          return null
        }
      })
    )

    const validImages = imageContents.filter(img => img !== null)

    if (validImages.length === 0) {
      return {
        detectedColors: [],
        suggestedVariants: [],
        error: 'No valid images could be processed'
      }
    }

    if (!openai) {
      throw new Error('OpenAI client not initialized')
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: prompt
            },
            ...validImages.map((image) => ({
              type: 'image_url' as const,
              image_url: {
                url: `data:image/jpeg;base64,${image}`,
                detail: 'high' as const
              }
            }))
          ]
        }
      ],
      max_tokens: 1000,
      temperature: 0.3
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('No response from AI')
    }

    // Extract JSON from the response, handling markdown formatting
    const jsonContent = extractJSONFromResponse(content)

    // Parse the JSON response
    let analysis
    try {
      analysis = JSON.parse(jsonContent)
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError)
      console.log('Raw response:', content)
      console.log('Attempted to parse:', jsonContent)
      
      // Fallback: return empty results with error
      return {
        detectedColors: [],
        suggestedVariants: [],
        error: 'Failed to parse AI response. Please try again.'
      }
    }
    
    return {
      detectedColors: analysis.detectedColors || [],
      suggestedVariants: analysis.suggestedVariants || []
    }

  } catch (error) {
    console.error('Error analyzing product images:', error)
    return {
      detectedColors: [],
      suggestedVariants: [],
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

/**
 * Auto-generate variants based on detected colors
 */
export function generateVariantsFromColors(
  detectedColors: string[],
  productName: string,
  basePrice: number,
  baseSku: string
): Array<{
  id: string
  sku: string
  barcode: string
  price: number
  cost: number
  stock_quantity: number
  image_url: string
  is_active: boolean
  options: { [key: string]: string }
}> {
  return detectedColors.map((color, index) => {
    const colorSku = `${baseSku}-${color.toUpperCase()}`
    const barcode = generateBarcode(colorSku)
    
    return {
      id: `temp-${index}`,
      sku: colorSku,
      barcode,
      price: basePrice,
      cost: basePrice * 0.6, // Assume 40% markup
      stock_quantity: 0,
      image_url: '',
      is_active: true,
      options: {
        color: color
      }
    }
  })
}

/**
 * Generate a simple barcode from text
 */
function generateBarcode(input: string): string {
  let hash = 0
  for (let i = 0; i < input.length; i++) {
    hash = ((hash << 5) - hash) + input.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash).toString().padStart(12, '0').slice(0, 12)
} 

// Helper functions for price optimization

function buildPriceOptimizationPrompt(data: PriceOptimizationData): string {
  const {
    currentPrice,
    costPrice,
    category,
    stockQuantity,
    salesHistory,
    competitorPrices,
    marketTrends
  } = data

  let prompt = `Analyze and provide price optimization suggestions for a product with the following data:

Current Price: $${currentPrice}
${costPrice ? `Cost Price: $${costPrice}` : ''}
${category ? `Category: ${category}` : ''}
${stockQuantity !== undefined ? `Stock Quantity: ${stockQuantity}` : ''}

`

  if (salesHistory && salesHistory.length > 0) {
    prompt += `Sales History (last ${salesHistory.length} periods):
${salesHistory.map(sh => `- ${sh.date}: ${sh.quantity} units, $${sh.revenue}`).join('\n')}

`
  }

  if (competitorPrices && competitorPrices.length > 0) {
    prompt += `Competitor Prices:
${competitorPrices.map(cp => `- ${cp.competitor}: $${cp.price}`).join('\n')}

`
  }

  if (marketTrends) {
    prompt += `Market Trends:
- Demand Trend: ${marketTrends.demandTrend}
- Price Trend: ${marketTrends.priceTrend}
${marketTrends.seasonality ? `- Seasonality: ${marketTrends.seasonality}` : ''}

`
  }

  prompt += `Based on this data, provide a comprehensive price optimization suggestion in JSON format as specified in the system prompt.`

  return prompt
}

function parsePriceOptimizationResponse(response: string): PriceOptimizationSuggestion {
  try {
    // Try to extract JSON from the response
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      
      // Truncate optimization reason if it's too long (safety measure)
      let optimizationReason = parsed.optimizationReason || 'No reason provided'
      if (optimizationReason.length > 1000) {
        optimizationReason = optimizationReason.substring(0, 997) + '...'
      }
      
      return {
        suggestedPrice: parsed.suggestedPrice || 0,
        priceChangePercentage: parsed.priceChangePercentage || 0,
        optimizationReason: optimizationReason,
        confidenceScore: Math.max(0, Math.min(1, parsed.confidenceScore || 0.5)),
        expectedImpact: {
          revenueChange: parsed.expectedImpact?.revenueChange || 0,
          profitChange: parsed.expectedImpact?.profitChange || 0,
          demandChange: parsed.expectedImpact?.demandChange || 0,
          marketPosition: parsed.expectedImpact?.marketPosition || 'maintained'
        },
        factors: parsed.factors || [],
        risks: parsed.risks || []
      }
    }
    
    // Fallback if JSON parsing fails
    return {
      suggestedPrice: 0,
      priceChangePercentage: 0,
      optimizationReason: 'Failed to parse AI response',
      confidenceScore: 0,
      expectedImpact: {
        revenueChange: 0,
        profitChange: 0,
        demandChange: 0,
        marketPosition: 'maintained'
      },
      factors: [],
      risks: ['Unable to parse AI response']
    }
  } catch (error) {
    console.error('Error parsing price optimization response:', error)
    return {
      suggestedPrice: 0,
      priceChangePercentage: 0,
      optimizationReason: 'Error parsing AI response',
      confidenceScore: 0,
      expectedImpact: {
        revenueChange: 0,
        profitChange: 0,
        demandChange: 0,
        marketPosition: 'maintained'
      },
      factors: [],
      risks: ['Response parsing error']
    }
  }
} 