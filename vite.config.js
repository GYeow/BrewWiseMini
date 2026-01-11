import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'

// https://vitejs.dev/config/
export default defineConfig(async () => {
  const UnoCSS = (await import('unocss/vite')).default
  return {
    plugins: [
      uni(),
      UnoCSS(),
    ],
    server: {
      proxy: {
        '/openai-api': {
          // target: 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1', // International
          target: 'https://dashscope.aliyuncs.com/compatible-mode/v1', // Beijing
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/openai-api/, '')
        }
      }
    }
  }
})
