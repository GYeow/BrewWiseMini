<template>
  <div class="h-full">
    
    <!-- Scan New Bean Button -->
    <div 
        @click="scanBean" 
        class="mb-8 mt-4 bg-gradient-to-br from-gray-900 to-gray-700 rounded-2xl p-6 shadow-xl active:scale-98 transition-transform cursor-pointer md:max-w-md mx-auto relative overflow-hidden group"
    >
        <!-- Background Decor -->
        <div class="absolute right-0 top-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-white/10 transition-colors"></div>

        <div class="flex items-center gap-4 relative z-10">
            <div class="bg-brand-rust w-14 h-14 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                <div class="i-mdi-package-variant-closed text-3xl text-white"></div>
            </div>
            <div class="flex-1">
                <div class="text-white font-bold text-lg mb-0.5">Scan Coffee Bag</div>
                <div class="text-gray-300 text-xs leading-snug">Analyze roast info, origin, and flavors</div>
            </div>
            <div class="i-mdi-camera text-2xl text-gray-400 group-hover:text-white transition-colors"></div>
        </div>
    </div>

    <!-- History List Integration -->
    <HistoryList 
        ref="historyListRef" 
        @openRecipe="(data) => $emit('openRecipe', data)" 
        @continueBrew="onContinueBrew"
    />

    <!-- Full-Page Loading Overlay (Analysis) -->
    <div v-if="isAnalyzing" class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center">
        <div class="bg-white rounded-3xl p-8 shadow-2xl max-w-sm mx-4 animate-fade-in">
            <div class="flex flex-col items-center">
                <div class="w-16 h-16 border-4 border-brand-rust border-t-transparent rounded-full animate-spin mb-4"></div>
                <div class="text-xl font-bold text-brand-dark mb-2">Analyzing Label</div>
                <div class="text-sm text-gray-500 text-center">Identifying bean characteristics...</div>
            </div>
        </div>
    </div>

    <!-- PREP MODAL: Equipment Selection -->
    <div v-if="showPrep" class="fixed inset-0 z-50 bg-brand-ink/40 backdrop-blur-sm flex items-end sm:items-center justify-center" @click.self="showPrep = false">
        <div class="bg-white w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl p-8 animate-slide-up shadow-2xl pb-safe">
            <div class="flex justify-between items-start mb-6">
                <div>
                    <div class="text-xs font-bold text-brand-rust uppercase tracking-widest mb-1">{{ scannedBean?.roaster || 'Brew Prep' }}</div>
                    <div class="text-2xl font-display font-bold leading-tight line-clamp-2">{{ scannedBean?.name || 'Coffee Bean' }}</div>
                    <div class="text-xs text-gray-400 mt-1">{{ scannedBean?.origin }} • {{ scannedBean?.roast }}</div>
                </div>
                <div @click="showPrep = false" class="p-2 cursor-pointer hover:bg-gray-100 rounded-full transition-colors active:bg-gray-200">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#000000" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </div>
            </div>

            <!-- Equipment Pickers -->
            <div class="space-y-4 mb-10">
                <!-- Brewer -->
                <div class="bg-gray-50 p-4 rounded-xl flex items-center justify-between border border-gray-100">
                    <div class="text-xs font-bold text-gray-500 uppercase tracking-wider">Brewer</div>
                    <picker mode="selector" :range="BREWERS" range-key="name" @change="e => prepEquipment.brewer = BREWERS[e.detail.value]">
                        <div class="flex items-center gap-2 font-bold text-brand-dark">
                            {{ prepEquipment.brewer?.name }}
                            <div class="i-mdi-chevron-down text-gray-400"></div>
                        </div>
                    </picker>
                </div>

                <!-- Grinder -->
                <div class="bg-gray-50 p-4 rounded-xl flex items-center justify-between border border-gray-100">
                    <div class="text-xs font-bold text-gray-500 uppercase tracking-wider">Grinder</div>
                    <picker mode="selector" :range="GRINDERS" range-key="name" @change="e => prepEquipment.grinder = GRINDERS[e.detail.value]">
                        <div class="flex items-center gap-2 font-bold text-brand-dark">
                            {{ prepEquipment.grinder?.name }}
                            <div class="i-mdi-chevron-down text-gray-400"></div>
                        </div>
                    </picker>
                </div>

                <!-- Water -->
                <div class="bg-gray-50 p-4 rounded-xl flex items-center justify-between border border-gray-100">
                    <div class="text-xs font-bold text-gray-500 uppercase tracking-wider">Water</div>
                    <picker mode="selector" :range="WATERS" range-key="name" @change="e => prepEquipment.water = WATERS[e.detail.value]">
                        <div class="flex items-center gap-2 font-bold text-brand-dark">
                            {{ prepEquipment.water?.name ? prepEquipment.water.name.split('(')[0] : 'Select Water' }}
                            <div class="i-mdi-chevron-down text-gray-400"></div>
                        </div>
                    </picker>
                </div>
            </div>

            <div class="pb-10">
                <button @click="generatePlan" class="w-full py-4 bg-gray-900 text-white rounded-xl font-bold tracking-widest uppercase text-sm shadow-lg active:scale-95 transition-transform hover:shadow-xl flex items-center justify-center gap-2">
                    <div class="i-mdi-creation text-lg"></div> Generate Plan
                </button>
            </div>
        </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { VisionService } from '@/services/VisionService'
import { SettingsService } from '@/services/SettingsService'
import { BREWERS, GRINDERS, WATERS } from '@/services/EquipmentData'
import HistoryList from '@/components/HistoryList.vue'

const isAnalyzing = ref(false)
const historyListRef = ref(null)

// Prep Modal Data
const showPrep = ref(false)
const scannedBean = ref(null)
const prepEquipment = ref({})

const refreshData = () => {
    if (historyListRef.value) {
        historyListRef.value.loadHistory()
    }
}

// Expose refresh for parent shell
defineExpose({ refreshData })
const emit = defineEmits(['switchTab', 'openRecipe'])

const scanBean = () => {
    uni.chooseImage({
        count: 1,
        sourceType: ['camera', 'album'],
        success: async (res) => {
            let imagePath = res.tempFilePaths[0];
            const file = res.tempFiles[0];

            // HEIC Detection & Conversion
            const isHeic = file.name?.toLowerCase().endsWith('.heic') || file.path?.toLowerCase().endsWith('.heic') || file.type === 'image/heic';
            
            if (isHeic) {
                try {
                    isAnalyzing.value = true; // Show loading earlier
                    const heic2any = (await import('heic2any')).default;
                    
                    // Fetch blob from local path
                    const response = await fetch(imagePath);
                    const blob = await response.blob();
                    
                    const convertedBlob = await heic2any({
                        blob,
                        toType: "image/jpeg",
                        quality: 0.8
                    });

                    // Create new Blob URL
                    imagePath = URL.createObjectURL(convertedBlob);
                    console.log('HEIC converted to JPEG:', imagePath);
                } catch (e) {
                    console.error('HEIC Conversion Failed:', e);
                    uni.showToast({ title: 'HEIC Error: ' + e.message, icon: 'none' });
                    isAnalyzing.value = false;
                    return;
                }
            }

            await analyzeLabel(imagePath)
        }
    })
}

const analyzeLabel = async (imagePath) => {
    isAnalyzing.value = true
    try {
        const beanData = await VisionService.analyzeLabel(imagePath)
        
        // Check for Analysis Error from Service
        if (beanData.error) {
            throw new Error(beanData.notes ? beanData.notes[0] : 'Analysis Failed')
        }

        beanData.image = imagePath 
        
        // Open Prep Modal
        scannedBean.value = beanData
        
        // Load Defaults
        const defaults = SettingsService.getSettings()
        prepEquipment.value = { ...defaults }
        
        isAnalyzing.value = false
        showPrep.value = true

    } catch (e) {
        console.error('Analysis Error:', e)
        isAnalyzing.value = false
        // Show simple alert instead of Prep Modal
        uni.showModal({ title: 'AI Analysis Failed', content: e.message || 'Please try again', showCancel: false })
    }
}

const generatePlan = () => {
    showPrep.value = false
    
    const beanData = { ...scannedBean.value }
    const equipmentData = { 
        brewer: prepEquipment.value.brewer.name,
        grinder: prepEquipment.value.grinder.name,
        water: prepEquipment.value.water.name
    }
    
    // Emit data for parent to handle (Recipe View)
    emit('openRecipe', { ...beanData, equipment: equipmentData })
}

const onContinueBrew = (bean) => {
    // Populate Modal with existing bean data
    scannedBean.value = bean
    
    // Load Defaults for equipment
    const defaults = SettingsService.getSettings()
    prepEquipment.value = { ...defaults }
    
    // Show Modal
    isAnalyzing.value = false
    showPrep.value = true
}
</script>

<style scoped>
.pb-safe {
    padding-bottom: env(safe-area-inset-bottom);
}
</style>
