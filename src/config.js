// Global Configuration
export const CONFIG = {
    // AI Configuration (OpenAI Compatible)
    // This allows you to switch between Aliyun (Qwen), DeepSeek, OpenAI, etc.
    // just by changing the Base URL and API Key.

    // Aliyun Bailian / DashScope Key
    API_KEY: '', // TODO: Set your API Key here or use environment variables

    // Base URL (Proxied in H5)
    // Target: https://dashscope.aliyuncs.com/compatible-mode/v1
    API_BASE_URL: '/openai-api',

    // Endpoints (Standard OpenAI Format)
    API_ENDPOINT_CHAT: '/openai-api/chat/completions',

    // Models (Aliyun Qwen)
    MODEL_TEXT: 'qwen-plus',
    MODEL_VISION: 'qwen-vl-max'
}
