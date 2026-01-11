import { getMockPlan } from './mockBrewingService'
import { CONFIG } from '@/config.js'
import { HistoryService } from '@/services/HistoryService.js'

const API_URL = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation'

export const AIProvider = {
    async getPlan(beanData, feedback = null, previousPlan = null) {
        const API_KEY = CONFIG.API_KEY

        if (!API_KEY || API_KEY.startsWith('sk-INSERT')) {
            throw new Error('API Key not configured. Please add your API key to src/config.js')
        }

        // Generate cache key from bean name, equipment, and feedback
        const feedbackHash = feedback ? JSON.stringify(feedback) : 'none'
        const equipmentStr = beanData.equipment ? JSON.stringify(beanData.equipment) : 'default'
        // Include previousPlan key to ensure unique cache for round 2, round 3 etc
        const prevHash = previousPlan ? 'R' + Object.keys(previousPlan).length : 'R0'
        const cacheKey = `PLAN_CACHE_${beanData.name}_${equipmentStr}_${feedbackHash}_${prevHash}`

        // Check cache first
        const cached = uni.getStorageSync(cacheKey)
        if (cached) {
            console.log('Using cached brewing plan for:', beanData.name)
            return cached
        }

        // Standard OpenAI-Compatible Request
        const prompt = this.constructPrompt(beanData, feedback, previousPlan)

        // ...

        return this.getRequest(prompt, cacheKey, beanData)
    },

    clearPlanCache(beanData, feedback = null) {
        const feedbackHash = feedback ? JSON.stringify(feedback) : 'none'
        const equipmentStr = beanData.equipment ? JSON.stringify(beanData.equipment) : 'default'
        const cacheKey = `PLAN_CACHE_${beanData.name}_${equipmentStr}_${feedbackHash}`
        uni.removeStorageSync(cacheKey)
        console.log('Cleared plan cache for:', cacheKey)
    },

    async getRequest(prompt, cacheKey, beanData) {

        // Helper to keep code clean since we split functions
        const payload = {
            model: CONFIG.MODEL_TEXT, // e.g. 'qwen-turbo'
            messages: [
                {
                    role: 'system',
                    content: 'You are an elite Coffee Scientist and World Brewers Cup (WBrC) consultant specializing in terroir expression and precision brewing. You design high-precision protocols that maximize the unique characteristics of each coffee through scientific understanding of extraction chemistry, water minerology, and grind particle distribution.'
                },
                { role: 'user', content: prompt }
            ],
            stream: false
        }

        console.log('LLM Request (OpenAI Compatible):', CONFIG.API_ENDPOINT_CHAT)

        const response = await uni.request({
            url: CONFIG.API_ENDPOINT_CHAT,
            method: 'POST',
            header: {
                'Authorization': `Bearer ${CONFIG.API_KEY}`,
                'Content-Type': 'application/json'
            },
            timeout: 100000,
            data: payload
        })

        console.log('LLM Response:', response.statusCode, response.data)

        if (response.statusCode !== 200) {
            const errMsg = response.data?.error?.message || JSON.stringify(response.data)
            throw new Error(`API Error ${response.statusCode}: ${errMsg}`)
        }

        // Standard OpenAI Response Parsing
        // response.data.choices[0].message.content
        if (response.data && response.data.choices && response.data.choices.length > 0) {
            const content = response.data.choices[0].message.content
            const cleanJson = content.replace(/```json/g, '').replace(/```/g, '').trim()
            const result = JSON.parse(cleanJson)

            // Cache the successful result
            uni.setStorageSync(cacheKey, result)
            console.log('Cached brewing plan for:', beanData.name)

            return result
        }

        throw new Error('Invalid API response format: ' + JSON.stringify(response.data))
    },

    constructPrompt(beanData, feedback, previousPlan) {
        const grinder = beanData.equipment?.grinder || 'Hand grinder'
        const brewer = beanData.equipment?.brewer || 'Hario V60'

        let base = `=== PRECISION BREWING PROTOCOL ===\n\n`

        base += `BEAN PROFILE:\n`
        base += `- Name: ${beanData.name || 'Unknown'}\n`
        if (beanData.origin) base += `- Origin: ${beanData.origin}\n`
        if (beanData.process) base += `- Processing: ${beanData.process}\n`
        if (beanData.roast) base += `- Roast: ${beanData.roast}\n`
        if (beanData.notes && beanData.notes.length > 0) base += `- Tasting Notes: ${beanData.notes.join(', ')}\n`

        base += `\nEQUIPMENT:\n`
        base += `- Brewer: ${brewer}\n`
        base += `- Grinder: ${grinder}\n`

        if (feedback && previousPlan) {
            base += `\nCALIBRATION REQUEST (CRITICAL):\n`
            base += `PREVIOUS RECIPE (Resulted in Score < 7.5?):\n`
            base += `- Grind: ${previousPlan.grind}\n`
            base += `- Temp: ${previousPlan.temp}\n`
            base += `- Ratio: ${previousPlan.ratio}\n`
            base += `- Pour Goal: ${previousPlan.sensory_target}\n`

            base += `\nUSER FEEDBACK:\n`
            base += `- Scores: Fragrance: ${feedback.fragrance_dry}, Acidity: ${feedback.acidity}, Body: ${feedback.body}, Balance: ${feedback.balance}\n`
            base += `- Sensory Notes: "${feedback.notes}"\n`

            base += `\nTASK: ADJUST the previous recipe to correct the fault.\n`
            base += `You MUST Change at least one variable (Grind, Temp, or Ratio) to address the feedback directly.\n`
            base += `- Example: If "bitter/dry" (Over-extracted) -> Coarser Grind OR Lower Temp.\n`
            base += `- Example: If "sour/thin" (Under-extracted) -> Finer Grind OR Higher Temp.\n`
            base += `Explicitly state what you changed and why in the "logic" field (e.g. "Grind coarser to reduce bitterness").\n`
        }

        base += `\n=== ANALYSIS FRAMEWORK ===\n`
        base += `\n1. BEAN CHARACTER STUDY (for "logic" field, 2-3 sentences):\n`
        base += `Analyze THIS bean's terroir and processing:\n`
        base += `- Explain how altitude/processing impacts the cup profile in PLAIN ENGLISH.\n`
        base += `- Focus on sensory experience (e.g., "High altitude creates bright citrus notes", "Natural process adds fruity sweetness").\n`
        base += `- STRICTLY FORBIDDEN: Chemical names (e.g., Pyrazines, Strecker degradation, Maillard intermediates, Linalool).\n`
        base += `- REQUIRED: Use "Barista-Style" language (e.g., body, acidity, sweetness, texture, finish).\n`
        base += `\n2. METHOD SELECTION:\n`
        base += `- HOT BREW (185-205°F): For volatile aromatics, bright acidity, floral/fruity notes\n`
        base += `- ICED BREW (hot brew over ice): Preserves brightness with refreshment\n`
        base += `Justify based on bean's aromatic profile.\n`

        base += `\n3. PRECISION RECIPE (Must be custom tailored):\n`
        base += `- GRIND: Specific setting for "${grinder}". Finer for light roast/high density, coarser for dark.\n`
        base += `- TEMP: Exact °F based on roast level. Light/Dense beans need higher temps (205-210°F). Darker/Porous need lower (185-195°F). DO NOT DEFAULT TO 200°F.\n`
        base += `- RATIO: Adjust for strength preference. Standard is 1:16.\n`
        base += `- PROTOCOL: Create a specific pouring structure (e.g. 4:6 method, Pulse pour, or Osmotic flow) that suits the bean.\n`
        base += `\n4. SENSORY TARGET:\n`
        base += `Describe target Acidity/Sweetness/Body balance this recipe achieves.\n`
        base += `\n=== OUTPUT REQUIREMENTS ===\n`
        base += `\nSTEPS ARRAY:\n`
        base += `- ONLY pouring steps (NO "weigh", "grind", "boil")\n`
        base += `- Format: {time: seconds, action: "Pour X (Bloom)" or "Pour X", amount: "XXml", desc: "technique + purpose"}\n`
        base += `- Include agitation if relevant (e.g., "gentle swirl for even saturation")\n`
        base += `- Example: [{time: 0, action: "Pour 1 (Bloom)", amount: "50ml", desc: "Circular pour to saturate grounds and release CO2"}, {time: 45, action: "Pour 2", amount: "100ml", desc: "Spiral from center to maintain bed flatness"}]\n`
        base += `\n\nReturn valid JSON:\n`
        base += `{\n`
        base += `  "grind": "Specific setting + visual reference (e.g. Medium-Fine, Sea Salt)",\n`
        base += `  "temp": "Exact optimized temperature in °F (e.g. 201°F, 208°F)",\n`
        base += `  "ratio": "Calculated ratio (e.g. 1:15, 1:16.6)",\n`
        base += `  "water": "Total water amount (e.g. 250ml)",\n`
        base += `  "coffee": "Dose amount (e.g. 20g)",\n`
        base += `  "steps": [...],\n`
        base += `  "logic": "Explain specific parameter choices (Temp/Grind) based on THIS bean's density/roast.",\n`
        base += `  "sensory_target": "Target Acidity/Sweetness/Body balance"\n`
        base += `}`

        return base
    }
}
