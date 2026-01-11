const SETTINGS_KEY = 'user_settings'
import { BREWERS, GRINDERS, WATERS } from './EquipmentData'

export const SettingsService = {
    // Get all settings or defaults
    getSettings() {
        const defaults = {
            brewer: BREWERS[0],
            grinder: GRINDERS[0],
            water: WATERS[0]
        }
        return uni.getStorageSync(SETTINGS_KEY) || defaults
    },

    // Save settings
    saveSettings(settings) {
        uni.setStorageSync(SETTINGS_KEY, settings)
    },

    // Reset to defaults
    reset() {
        uni.removeStorageSync(SETTINGS_KEY)
    }
}
