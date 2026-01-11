<template>
  <div class="h-screen bg-[#F5F5F7] text-brand-dark flex flex-col md:flex-row overflow-hidden">
    
    <!-- DESKTOP LEFT COLUMN: Image & Bean Info -->
    <div class="hidden md:flex md:w-5/12 lg:w-4/12 h-full bg-black relative flex-col justify-end">
        <!-- Full Height Image -->
        <image v-if="beanImage" :src="beanImage" mode="aspectFill" class="absolute inset-0 w-full h-full opacity-60" />
        <div v-else class="absolute inset-0 bg-brand-dark opacity-100 flex items-center justify-center text-gray-700">
             <div class="i-mdi-coffee text-9xl opacity-20"></div>
        </div>
        
        <!-- Gradient Overlay -->
        <div class="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>

        <!-- Content on Image -->
        <div class="relative z-10 p-10 pb-16 text-white">
            <div class="inline-block px-3 py-1 bg-brand-rust/90 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-widest mb-4 shadow-lg">Current Brew</div>
            <div class="text-4xl lg:text-5xl font-display font-bold mb-2 leading-tight">{{ beanName || 'Coffee Bean' }}</div>
            <div class="text-white/60 font-mono text-sm max-w-xs">{{ currentBrewer.name }} • {{ currentGrinder.name }}</div>
        </div>
    </div>

    <!-- MAIN CONTENT COLUMN (Mobile: Full Screen / Desktop: Right Side) -->
    <div class="flex-1 flex flex-col h-full relative w-full md:w-7/12 lg:w-8/12 bg-[#F5F5F7]">
        
        <!-- Mobile Header (Hidden on Desktop) -->
        <div class="md:hidden px-4 pt-12 pb-4 bg-white sticky top-0 z-20 shadow-sm flex justify-between items-center flex-shrink-0">
           <div class="flex-1 min-w-0">
             <div class="text-xl font-bold tracking-tight truncate">{{ beanName || 'Coffee Bean' }}</div>
             <div class="text-xs text-gray-500 uppercase tracking-wider font-medium mt-0.5">Brewing Plan</div>
           </div>
           <div @click="toggleSettings" class="ml-3 bg-gray-100 px-3 py-1.5 rounded-full text-xs font-bold text-gray-600 flex items-center gap-1 active:opacity-60 transition-opacity flex-shrink-0">
              <div class="i-mdi-tune"></div>
              {{ currentBrewer.name }}
           </div>
        </div>

        <!-- Desktop Header Actions -->
        <div class="hidden md:flex justify-end p-6 absolute top-0 right-0 z-20 pointer-events-none">
            <div class="pointer-events-auto flex gap-3">
                 <button @click="goHome" class="bg-white/80 hover:bg-white backdrop-blur px-4 py-2 rounded-xl text-xs font-bold text-gray-600 shadow-sm border border-gray-200 transition-all flex items-center gap-2">
                    <div class="i-mdi-home"></div> Home
                </button>
                 <button @click="toggleSettings" class="bg-brand-dark text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-2">
                    <div class="i-mdi-tune"></div> Settings
                </button>
            </div>
        </div>

        <!-- Main Scroll Area -->
        <scroll-view scroll-y class="flex-1 px-4 md:px-12 py-6 md:py-12 w-full max-w-3xl mx-auto">
            
            <!-- Desktop Title (Visible only on Desktop) -->
            <div class="hidden md:block mb-8">
                <div class="text-sm font-bold text-brand-rust uppercase tracking-widest mb-1">Brewing Plan</div>
                <div class="text-3xl font-display font-bold text-brand-dark">Precision Recipe</div>
            </div>

            <!-- AI Loading State -->
            <div v-if="loading" class="mt-8 flex flex-col items-center justify-center p-8 bg-white rounded-2xl shadow-sm animate-pulse">
                <div class="i-mdi-creation text-4xl text-brand-dark mb-3"></div>
                <div class="text-sm font-medium text-gray-500">Generating Plan...</div>
            </div>
            
            <!-- Error State -->
            <div v-else-if="error" class="mt-8 flex flex-col items-center justify-center p-8 bg-red-50 rounded-2xl border-2 border-red-200">
                <div class="i-mdi-alert-circle text-5xl text-red-500 mb-4"></div>
                <div class="text-lg font-bold text-red-700 mb-2">Failed to Generate Plan</div>
                <div class="text-sm text-red-600 text-center mb-6 max-w-xs leading-relaxed">{{ error }}</div>
                <button @click="retryFetchPlan" class="px-6 py-3 bg-red-600 text-white rounded-xl font-bold text-sm shadow-lg active:scale-95 transition-transform">
                    Retry
                </button>
            </div>

            <!-- Recipe Content -->
            <div v-else-if="brewingPlan" class="space-y-4 pb-32 animate-fade-in-up">
                
                <!-- Cards Grid -->
                <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <!-- Ratio Card -->
                    <div class="col-span-2 bg-white p-5 rounded-2xl shadow-sm shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex justify-between items-center border border-gray-100">
                         <div>
                            <div class="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Ratio</div>
                            <div class="text-3xl font-bold font-display" style="font-family: 'Playfair Display', serif;">{{ brewingPlan.ratio }}</div>
                         </div>
                         <div class="text-right">
                             <div class="text-sm font-bold">{{ brewingPlan.water }} Water</div>
                             <div class="text-sm text-gray-500">{{ brewingPlan.coffee }} Coffee</div>
                         </div>
                    </div>

                    <!-- Temp & Grind -->
                    <div class="bg-white p-4 rounded-2xl shadow-sm shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex flex-col justify-center items-center py-6 border border-gray-100">
                        <div class="i-mdi-thermometer text-2xl text-red-400 mb-2"></div>
                        <div class="text-xl font-bold">{{ brewingPlan.temp }}</div>
                        <div class="text-[10px] text-gray-400 uppercase tracking-widest mt-1">Temp</div>
                    </div>
                    <div class="bg-white p-4 rounded-2xl shadow-sm shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex flex-col justify-center items-center py-6 border border-gray-100">
                         <div class="i-mdi-grain text-2xl text-amber-600 mb-2"></div>
                        <div class="text-sm md:text-xs font-bold text-center leading-tight truncate px-1 w-full">{{ brewingPlan.grind }}</div>
                        <div class="text-[10px] text-gray-400 uppercase tracking-widest mt-1">Grind</div>
                    </div>
                </div>

                <!-- Logic Section -->
                <div class="bg-white p-6 rounded-2xl shadow-sm shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100">
                    <div class="text-xs text-gray-400 uppercase font-bold tracking-wider mb-3 flex items-center gap-1">
                        <div class="i-mdi-robot text-sm text-brand-rust"></div> AI Insight
                    </div>
                    <div class="text-base leading-relaxed text-gray-700 italic font-display">"{{ brewingPlan.logic }}"</div>
                </div>

                <!-- Steps Section -->
                <div class="bg-white p-6 md:p-8 rounded-2xl shadow-sm shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100">
                    <div class="flex items-center justify-between mb-8">
                         <div class="text-sm font-bold uppercase tracking-wider text-gray-900">Brewing Steps</div>
                         <div class="text-xs font-bold bg-gray-100 px-2 py-1 rounded text-gray-500">{{ brewingPlan.steps.length }} Steps</div>
                    </div>

                    <div class="space-y-8 relative pl-2">
                        <!-- Vertical Line -->
                        <div class="absolute left-[15px] top-2 bottom-2 w-0.5 bg-gray-100"></div>

                        <div v-for="(step, i) in brewingPlan.steps" :key="i" class="relative pl-10 group">
                            <!-- Dot -->
                            <div class="absolute left-[11px] top-1.5 w-2.5 h-2.5 rounded-full bg-brand-rust border-2 border-white shadow-sm z-10 group-hover:scale-125 transition-transform"></div>
                            
                            <div class="flex justify-between items-start">
                                 <div>
                                    <div class="font-bold text-lg text-gray-800">{{ step.action }}</div>
                                    <div class="text-sm text-gray-600 mt-1 leading-relaxed">{{ step.desc }}</div>
                                 </div>
                                 <div class="text-right flex-shrink-0 ml-4">
                                     <div class="font-mono text-xs font-bold text-gray-400 py-1 px-2 bg-gray-50 rounded inline-block mb-1">{{ step.time }}s</div>
                                     <div class="text-sm font-bold text-brand-dark block">{{ step.amount }}</div>
                                 </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Log Feedback Button (Static, visible at bottom of content) -->
                <button @click="showFeedback = true" class="w-full bg-white border-2 border-gray-100 hover:border-brand-rust/20 hover:bg-brand-rust/5 py-4 rounded-xl flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-all text-brand-dark mb-8 mt-6">
                    <div class="i-mdi-pencil text-lg"></div>
                    <span class="font-bold text-sm uppercase tracking-wider">Log Tasting Feedback</span>
                </button>

            </div>
        </scroll-view>
    </div>

    <!-- Equipment Modal -->
    <div v-if="showSettings" class="fixed inset-0 z-50 bg-brand-ink/40 backdrop-blur-sm flex items-end sm:items-center justify-center" @click.self="showSettings = false">
        <div class="bg-white w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl p-8 animate-slide-up shadow-2xl">
            <div class="text-2xl font-display font-bold mb-8">Equipment</div>
            <!-- ... (Keep Picker Logic same but styled) ... -->
             <div class="mb-4">
                  <label class="text-xs text-gray-500 uppercase tracking-widest block mb-2 font-bold">Brewer</label>
                  <picker mode="selector" :range="BREWERS" range-key="name" @change="onBrewerChange">
                    <div class="text-xl font-display border-b border-gray-200 py-2 flex justify-between cursor-pointer hover:bg-gray-50 transition-colors rounded px-2 -mx-2">
                        <span>{{ currentBrewer.name }}</span>
                        <div class="i-mdi-chevron-down text-gray-400"></div>
                    </div>
                  </picker>
              </div>
               <div class="mb-8">
                  <label class="text-xs text-gray-500 uppercase tracking-widest block mb-2 font-bold">Grinder</label>
                  <picker mode="selector" :range="GRINDERS" range-key="name" @change="onGrinderChange">
                    <div class="text-xl font-display border-b border-gray-200 py-2 flex justify-between cursor-pointer hover:bg-gray-50 transition-colors rounded px-2 -mx-2">
                        <span>{{ currentGrinder.name }}</span>
                        <div class="i-mdi-chevron-down text-gray-400"></div>
                    </div>
                  </picker>
              </div>
            <button class="w-full py-4 bg-brand-rust text-white rounded-xl font-bold tracking-widest uppercase text-sm shadow-lg active:scale-95 transition-transform hover:shadow-xl hover:bg-brand-rust/90 border-brand-rust" @click="applySettings">
                  Update Plan
            </button>
        </div>
    </div>

    <!-- Feedback Modal -->
    <div v-if="showFeedback" class="fixed inset-0 z-50 bg-brand-ink/40 backdrop-blur-sm flex items-end sm:items-center justify-center" @click.self="showFeedback = false">
        <div class="bg-white w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl p-8 animate-slide-up max-h-[90vh] overflow-y-auto shadow-2xl">
             <div class="text-2xl font-display font-bold mb-2">Tasting Log</div>
             <div class="text-sm text-gray-500 mb-8">Rate your brew to calibrate the AI.</div>

             <div class="flex justify-between mb-8 px-4">
                  <div v-for="n in 5" :key="n" @click="feedback.rating = n" 
                      class="text-4xl transition-transform active:scale-110 cursor-pointer hover:scale-125" 
                      :class="n <= feedback.rating ? 'text-brand-rust' : 'text-gray-200'">★</div>
              </div>

               <div class="space-y-6 mb-8">
                   <!-- Sliders (Custom Style) -->
                   <div v-for="(metric, key) in {Acidity: 'acidity', Body: 'body', Sweetness: 'sweetness'}" :key="key">
                        <div class="flex justify-between text-xs font-bold uppercase tracking-widest mb-2 text-gray-400">
                            <span>Low</span>
                            <span class="text-brand-dark">{{key}}</span>
                            <span>High</span>
                        </div>
                        <slider :value="feedback[metric]" @change="e => feedback[metric] = e.detail.value" min="0" max="100" activeColor="#c1624f" backgroundColor="#f0f0f0" block-size="12" />
                   </div>
               </div>

               <textarea v-model="feedback.notes" class="w-full bg-gray-50 border border-gray-100 rounded-xl p-4 text-sm font-body mb-6 min-h-[100px] focus:ring-2 ring-brand-rust/20 outline-none" placeholder="What did you taste?"></textarea>

               <div class="flex gap-4">
                  <button class="flex-1 py-4 bg-gray-100 text-brand-dark rounded-xl font-bold tracking-widest uppercase text-xs hover:bg-gray-200 transition-colors" @click="saveOnly">Save Only</button>
                  <button class="flex-1 py-4 bg-brand-dark text-white rounded-xl font-bold tracking-widest uppercase text-xs shadow-xl hover:shadow-2xl hover:bg-black transition-all" @click="calibratePlan">Calibrate AI</button>
               </div>
        </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { AIProvider } from '@/services/AIProvider'
import { BREWERS, GRINDERS } from '@/services/EquipmentData'
import { HistoryService } from '@/services/HistoryService'
import { SettingsService } from '@/services/SettingsService'

const beanName = ref('')
const beanImage = ref('') 
const brewingPlan = ref(null)
const loading = ref(true)
const error = ref(null)
// Store the current history ID if we've saved this session
const currentSessionId = ref(null)

// Equipment
const showSettings = ref(false)
const currentBrewer = ref(BREWERS[0]) 
const currentGrinder = ref(GRINDERS[0]) 

// Feedback
const showFeedback = ref(false)
const feedback = ref({ rating: 3, acidity: 50, body: 50, sweetness: 50, notes: '' })

// Actions
const toggleSettings = () => { showSettings.value = !showSettings.value }
const onBrewerChange = (e) => { currentBrewer.value = BREWERS[e.detail.value] }
const onGrinderChange = (e) => { currentGrinder.value = GRINDERS[e.detail.value] }

const goHome = () => {
    uni.navigateBack()
}

const applySettings = async () => {
    showSettings.value = false
    await fetchPlan()
}

const saveOnly = () => {
    saveToHistory()
    showFeedback.value = false
    uni.showToast({ title: 'Logged', icon: 'success' })
}

const calibratePlan = () => {
    saveToHistory()
    showFeedback.value = false
    fetchPlan(feedback.value)
}

const saveToHistory = () => {
     // If we already have a session ID, update that record (not supported by simple addBrew, usually we just add new log)
     // BUT user wants 1-to-1 scheme. 
     // If we generated a plan, we should have saved it? 
     // Let's just create a NEW entry with feedback enabled, effectively "Logging" this brew.
     
     const record = HistoryService.addBrew({
        beanName: beanName.value,
        plan: brewingPlan.value,
        equipment: { brewer: currentBrewer.value.name, grinder: currentGrinder.value.name },
        feedback: { ...feedback.value }
    })
    currentSessionId.value = record.id
}

const fetchPlan = async (calibrationData = null) => {
    loading.value = true
    error.value = null
    try {
        const beanData = { 
            name: beanName.value,
            equipment: { brewer: currentBrewer.value.name, grinder: currentGrinder.value.name }
        }
        const result = await AIProvider.getPlan(beanData, calibrationData)
        brewingPlan.value = result
        
        // Auto-save the plan as a "New Session" immediately? 
        // Or wait for user? 
        // Let's wait. But if user comes from History (View Plan), we shouldn't fetch again?
        // This function is for NEW generation.
        
    } catch (e) { 
        console.error('Dashboard fetchPlan error:', e)
        error.value = e.message || 'Unknown error occurred'
    } 
    finally { loading.value = false }
}

const retryFetchPlan = () => {
    fetchPlan()
}

onLoad(async (options) => {
  // Load User Defaults First
  const settings = SettingsService.getSettings()
  if (settings.brewer) currentBrewer.value = settings.brewer
  if (settings.grinder) currentGrinder.value = settings.grinder
  
  // Parse Options
  let beanData = {}
  if (options.data) { try { beanData = JSON.parse(decodeURIComponent(options.data)) } catch {} }
  else if (options.bean) { beanData = { name: decodeURIComponent(options.bean) } }

  if (beanData.name) {
    beanName.value = beanData.name
    beanImage.value = beanData.image || ''
    
    // Check if equipment was passed from Prep Modal
    if (beanData.equipment) {
        // Equipment passed from Prep! Use it!
        // We need to match strings back to Objects if possible, or just use as is?
        // Our Services usually expect Objects with { name, type... } but Settings saves Objects.
        // Let's see what PrepModal passes: It passes names.
        
        const b = BREWERS.find(b => b.name === beanData.equipment.brewer)
        const g = GRINDERS.find(g => g.name === beanData.equipment.grinder)
        if (b) currentBrewer.value = b
        if (g) currentGrinder.value = g
        
        // Use passed water name if we had one in logic, but standard AI prompt handles generic water?
        // We will pass the full equipment object to fetchPlan anyway.
        
        // Fetch NEW Plan
        await fetchPlan()
        
    } else if (beanData.equipmentLegacy && beanData.equipmentLegacy.brewer) {
        // ... (Old viewPlan logic, if different) ...
        await fetchPlan() 
    } else {
        // Generic / Fallback
        await fetchPlan()
    }
  }
})
</script>
