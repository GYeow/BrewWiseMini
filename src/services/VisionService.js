// VisionService.js - Handles visual analysis of coffee bean labels
import { CONFIG } from '@/config.js'
import { HistoryService } from '@/services/HistoryService.js'

export const VisionService = {
  // Analyze an image (local path) and return Bean Data
  async analyzeLabel(imagePath) {
    const API_KEY = CONFIG.API_KEY
    const CACHE_KEY = `BEAN_CACHE_${imagePath}`

    // 1. Check Cache
    const cached = uni.getStorageSync(CACHE_KEY)
    if (cached) return cached

    if (!API_KEY || API_KEY.startsWith('sk-INSERT')) {
      throw new Error('API Key not configured. Please add your API key to src/config.js')
    }

    try {
      // 2. Convert Image
      const base64 = await this.fileToBase64(imagePath)

      // 3. OpenAI-Compatible Vision Request
      // Qwen-VL via Compatible Interface uses standard Chat Completion format
      const payload = {
        model: CONFIG.MODEL_VISION, // 'qwen-vl-max'
        messages: [
          {
            role: "user",
            content: [
              { type: "image_url", image_url: { url: `data:image/jpeg;base64,${base64}` } },
              { type: "text", text: "Analyze this coffee label. Return valid JSON only with keys: roaster, name, origin, process, roast, notes (array).\n\nCRITICAL INSTRUCTIONS:\n1. 'roaster': Extract the Brand/Roaster Name (e.g. 'Blue Bottle', 'Stumptown').\n2. 'name': Extract ONLY the specific product name, bean variety, or region (e.g. 'Ethiopia Yirgacheffe', 'Bella Vista'). DO NOT include the Roaster name here.\n3. If both visible, split them correctly.\n- Do not include markdown." }
            ]
          }
        ]
      }

      console.log('VLM Request (OpenAI Compatible):', CONFIG.API_ENDPOINT_CHAT)

      const response = await uni.request({
        url: CONFIG.API_ENDPOINT_CHAT, // Vision uses same chat endpoint in OpenAI spec
        method: 'POST',
        header: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 100000,
        data: payload
      })

      console.log('VLM Response:', response.statusCode, response.data)

      if (response.statusCode !== 200) {
        const errMsg = response.data?.error?.message || JSON.stringify(response.data)
        throw new Error(`API Error ${response.statusCode}: ${errMsg}`)
      }

      // 4. Parse Standard OpenAI Response
      if (response.data && response.data.choices && response.data.choices.length > 0) {
        const content = response.data.choices[0].message.content
        console.log('Raw VLM Content:', content)

        const cleanJson = content.replace(/```json/g, '').replace(/```/g, '').trim()
        let beanData = {}
        try {
          beanData = JSON.parse(cleanJson)
        } catch (e) {
          throw new Error('Failed to parse AI response as JSON: ' + e.message)
        }

        uni.setStorageSync(CACHE_KEY, beanData)

        // Attach Image for History persistence
        // Using Base64 ensures it works across reloads (unlike blob URLs in H5)
        beanData.image = `data:image/jpeg;base64,${base64}`

        // Auto-save to History
        HistoryService.saveScan(beanData)

        return beanData
      }

      throw new Error('Invalid API response format: ' + JSON.stringify(response.data))

    } catch (e) {
      console.error('Vision Analysis Failed', e)
      return {
        name: "Analysis Failed",
        roaster: "Unknown Roaster",
        origin: "Unknown",
        roast: "Medium",
        notes: ["Error: " + e.message],
        error: true
      }
    }
  },

  fileToBase64(path) {
    return new Promise((resolve, reject) => {
      // #ifdef MP-WEIXIN
      uni.getFileSystemManager().readFile({
        filePath: path,
        encoding: 'base64',
        success: res => resolve(res.data),
        fail: err => reject(err)
      })
      // #endif

      // #ifdef H5
      fetch(path)
        .then(response => response.blob())
        .then(blob => {
          const reader = new FileReader()
          reader.onloadend = () => {
            // reader.result is "data:image/jpeg;base64,..."
            const base64data = reader.result.split(',')[1]
            resolve(base64data)
          }
          reader.onerror = reject
          reader.readAsDataURL(blob)
        })
        .catch(reject)
      // #endif
    })
  }
}
