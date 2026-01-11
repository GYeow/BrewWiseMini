import { defineConfig, presetUno, presetAttributify, presetIcons } from 'unocss'

export default defineConfig({
    presets: [
        presetUno(),
        presetAttributify(),
        presetIcons(),
    ],
    theme: {
        colors: {
            brand: {
                dark: '#2C2C2C', // Example dark coffee-like color
                light: '#F5F5F0', // Wabi-sabi paper white
            }
        }
    }
})
