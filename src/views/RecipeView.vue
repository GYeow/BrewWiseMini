<template>
  <div class="h-full flex flex-col relative w-full bg-[#F5F5F7] rounded-3xl overflow-hidden shadow-sm border border-gray-100/50">
    
    <!-- Mobile Header (Visible) -->
    <div class="px-6 pt-8 pb-4 bg-white sticky top-0 z-20 shadow-sm flex flex-col justify-center flex-shrink-0 min-h-[80px]">
       <div class="flex justify-between items-start">
           <div class="flex-1 min-w-0 mr-4">
             <div v-if="beanRoaster" class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-0.5">{{ beanRoaster }}</div>
             <div class="text-xl font-bold tracking-tight truncate">{{ beanName || 'Coffee Bean' }}</div>
             <!-- Flavor Notes (From Scan) -->
             <div v-if="beanNotes.length" class="flex flex-wrap gap-1 mt-2">
                <span v-for="(note, i) in beanNotes" :key="i" class="text-[10px] font-bold text-brand-rust/70 bg-brand-rust/5 px-2 py-0.5 rounded-full uppercase tracking-wide">
                    {{ note }}
                </span>
             </div>
           </div>
       </div>
    </div>

    <!-- Main Scroll Area -->
    <scroll-view scroll-y class="flex-1 w-full bg-[#F5F5F7]">
        <div class="px-4 md:px-8 py-6 pb-32">
        
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
            <div v-else-if="brewingPlan" class="space-y-4 animate-fade-in-up">
                
                <!-- Cards Grid -->
                <div class="grid grid-cols-2 gap-3">
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

                <!-- Equipment Used (Moved Body) -->
                <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                     <div class="text-xs text-gray-400 uppercase font-bold tracking-wider mb-4">Equipment Used</div>
                     <div class="flex flex-col gap-3">
                         <div class="flex justify-between items-center pb-2 border-b border-gray-50">
                             <span class="text-sm text-gray-500 font-medium">Brewer</span>
                             <span class="text-sm font-bold text-gray-900">{{ currentBrewer.name }}</span>
                         </div>
                         <div class="flex justify-between items-center">
                             <span class="text-sm text-gray-500 font-medium">Grinder</span>
                             <span class="text-sm font-bold text-gray-900">{{ currentGrinder.name }}</span>
                         </div>
                     </div>
                </div>

                <!-- Steps Section -->
                <div class="bg-white p-6 md:p-8 rounded-2xl shadow-sm shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100">
                    <div class="flex items-center justify-between mb-8">
                         <div class="text-sm font-bold uppercase tracking-wider text-gray-400">Brewing Steps</div>
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

                <!-- Existing Feedback Display -->
                <div v-if="hasFeedback" class="bg-white border border-gray-100 rounded-3xl p-6 mt-6 mb-2 shadow-sm">
                    
                    <!-- Header -->
                    <div class="flex justify-between items-center mb-6">
                         <div class="text-xs font-bold uppercase tracking-widest text-gray-900">Your Tasting Notes</div>
                    </div>

                    <!-- User Text Notes (Prominent) -->
                    <div v-if="feedback.notes" class="mb-6">
                        <div class="flex items-stretch">
                             <!-- Explicit Vertical Bar -->
                             <div class="w-1 bg-gray-900 rounded-full flex-shrink-0 mr-4"></div>
                             
                             <div class="text-base font-medium text-gray-900 italic leading-relaxed py-1">
                                 {{ feedback.notes }}
                             </div>
                        </div>
                    </div>
                    
                    <!-- Radar Chart -->
                    <div class="px-2">
                        <RadarChart :data="chartData" :min="6" :max="10" />
                    </div>
                </div>

                <!-- Bottom Actions: Side-by-Side -->
                <div class="flex gap-3 mt-4 mb-8">
                    <!-- Delete (Secondary) -->
                    <button @click="deletePlan" class="flex-1 bg-red-50 text-red-600 border border-red-100 rounded-xl px-5 flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-all">
                        <div class="i-mdi-trash-can-outline text-lg"></div>
                        <span class="font-bold text-xs uppercase tracking-wider">Delete Plan</span>
                    </button>

                    <!-- Feedback (Primary) -->
                    <button @click="openFeedbackModal" class="flex-1 bg-gray-900 text-white border-2 border-gray-900 hover:bg-black py-4 rounded-xl flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-all">
                        <div class="i-mdi-pencil text-lg"></div>
                        <span class="font-bold text-sm uppercase tracking-wider">{{ hasFeedback ? 'Update Tasting Notes' : 'Log Tasting Notes' }}</span>
                    </button>
                </div>

            </div>
        </div>
    </scroll-view>

    <!-- Equipment Modal -->
    <div v-if="showSettings" class="fixed inset-0 z-50 bg-brand-ink/40 backdrop-blur-sm flex items-end sm:items-center justify-center" @click.self="showSettings = false">
        <!-- ... (Start of Equipment Modal) -->
        <div class="bg-white w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl p-8 animate-slide-up shadow-2xl pb-safe">
             <div class="flex justify-between items-center mb-8">
                <div class="text-2xl font-display font-bold">Equipment</div>
                <div @click="showSettings = false" class="p-2 cursor-pointer hover:bg-gray-100 rounded-full transition-colors active:bg-gray-200">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#000000" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </div>
             </div>

             <div class="space-y-4 mb-10">
                 <!-- Brewer -->
                 <div class="bg-gray-50 p-4 rounded-xl flex items-center justify-between border border-gray-100">
                      <label class="text-xs text-brand-rust uppercase tracking-widest font-bold">Brewer</label>
                      <picker mode="selector" :range="BREWERS" range-key="name" @change="onBrewerChange">
                        <div class="text-sm font-bold text-brand-dark flex items-center gap-2">
                            <span>{{ currentBrewer.name }}</span>
                            <div class="i-mdi-chevron-down text-gray-400"></div>
                        </div>
                      </picker>
                  </div>
                 
                 <!-- Grinder -->
                 <div class="bg-gray-50 p-4 rounded-xl flex items-center justify-between border border-gray-100">
                      <label class="text-xs text-brand-rust uppercase tracking-widest font-bold">Grinder</label>
                      <picker mode="selector" :range="GRINDERS" range-key="name" @change="onGrinderChange">
                        <div class="text-sm font-bold text-brand-dark flex items-center gap-2">
                            <span>{{ currentGrinder.name }}</span>
                            <div class="i-mdi-chevron-down text-gray-400"></div>
                        </div>
                      </picker>
                  </div>
     
                 <!-- Water -->
                 <div class="bg-gray-50 p-4 rounded-xl flex items-center justify-between border border-gray-100">
                      <label class="text-xs text-brand-rust uppercase tracking-widest font-bold">Water</label>
                      <picker mode="selector" :range="WATERS" range-key="name" @change="onWaterChange">
                        <div class="text-sm font-bold text-brand-dark flex items-center gap-2">
                            <span>{{ currentWater.name ? currentWater.name.split('(')[0].trim() : 'Select Water' }}</span>
                            <div class="i-mdi-chevron-down text-gray-400"></div>
                        </div>
                      </picker>
                  </div>
             </div>
             
             <div class="pb-10">
                <button class="w-full py-4 bg-brand-rust text-white rounded-xl font-bold tracking-widest uppercase text-sm shadow-lg active:scale-95 transition-transform hover:shadow-xl hover:bg-brand-rust/90 border-brand-rust" @click="applySettings">
                      Update Plan
                </button>
             </div>
        </div>
    </div>
 
    <!-- Feedback Modal (SCA Style) -->
    <div v-if="showFeedback" class="fixed inset-0 z-50 bg-brand-ink/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 md:p-4" @click.self="showFeedback = false">
        <div class="bg-white w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl p-8 animate-slide-up max-h-[90vh] overflow-y-auto shadow-2xl pb-safe flex flex-col">
             
             <!-- Header -->
             <div class="flex justify-between items-center mb-6">
                 <div class="text-2xl font-display font-bold">Feedback</div>
                 <div @click="showFeedback = false" class="p-2 cursor-pointer hover:bg-gray-100 rounded-full transition-colors active:bg-gray-200">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#000000" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                 </div>
             </div>
             
             <!-- Scrollable Content -->
             <div class="overflow-y-auto flex-1 -mx-2 px-2 pb-4">
                 <div class="space-y-6 mb-8">
                     <!-- Fragrance/Aroma -->
                     <div class="grid grid-cols-2 gap-4">
                         <div>
                             <div class="text-[10px] font-bold uppercase tracking-widest mb-2 text-gray-500">Fragrance (Dry)</div>
                             <div class="flex items-center gap-2">
                                 <slider :value="feedback.fragrance_dry" @change="e => feedback.fragrance_dry = e.detail.value" min="6" max="10" step="0.25" activeColor="#c1624f" backgroundColor="#f0f0f0" block-size="12" class="flex-1" />
                                 <div class="text-xs font-bold w-6">{{ feedback.fragrance_dry }}</div>
                             </div>
                         </div>
                         <div>
                             <div class="text-[10px] font-bold uppercase tracking-widest mb-2 text-gray-500">Aroma (Wet)</div>
                             <div class="flex items-center gap-2">
                                 <slider :value="feedback.aroma_wet" @change="e => feedback.aroma_wet = e.detail.value" min="6" max="10" step="0.25" activeColor="#c1624f" backgroundColor="#f0f0f0" block-size="12" class="flex-1" />
                                 <div class="text-xs font-bold w-6">{{ feedback.aroma_wet }}</div>
                             </div>
                         </div>
                     </div>
  
                     <!-- Core Metrics -->
                     <div v-for="(key, label) in {Flavor: 'flavor', Aftertaste: 'aftertaste', Acidity: 'acidity', Body: 'body', Balance: 'balance'}" :key="key">
                          <div class="flex justify-between items-end mb-2">
                               <div class="text-[10px] font-bold uppercase tracking-widest text-gray-500">{{label}}</div>
                               <div class="text-xs font-bold text-gray-900">{{ feedback[key] }}</div>
                          </div>
                          <slider :value="feedback[key]" @change="e => feedback[key] = e.detail.value" min="6" max="10" step="0.25" activeColor="#c1624f" backgroundColor="#f0f0f0" block-size="12" />
                     </div>
                 </div>
  
                 <div class="mb-6">
                     <div class="text-[10px] font-bold uppercase tracking-widest mb-2 text-gray-500">Tasting Notes</div>
                     <textarea v-model="feedback.notes" class="w-full bg-gray-50 border border-gray-100 rounded-xl p-4 text-sm font-body min-h-[100px] focus:ring-2 ring-brand-rust/20 outline-none" placeholder="Sensory notes (e.g. bright citric acidity, tea-like body...)"></textarea>
                 </div>
             </div>
  
             <!-- Footer Actions -->
             <div class="flex gap-4 pb-10 pt-2 bg-white flex-shrink-0">
                <button class="flex-1 py-4 bg-gray-100 text-gray-900 rounded-xl font-bold tracking-widest uppercase text-xs hover:bg-gray-200 transition-colors" @click="saveOnly">Save Only</button>
                <button class="flex-1 py-4 bg-brand-dark text-white rounded-xl font-bold tracking-widest uppercase text-xs shadow-xl hover:shadow-2xl hover:bg-black transition-all" @click="calibratePlan">Dial In</button>
             </div>
        </div>
    </div>
 
    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteConfirm" class="fixed inset-0 z-50 bg-brand-ink/40 backdrop-blur-sm flex items-end sm:items-center justify-center" @click.self="showDeleteConfirm = false">
        <div class="bg-white w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl p-8 animate-slide-up shadow-2xl pb-safe">
             <div class="flex justify-between items-center mb-6">
                 <div class="text-2xl font-display font-bold text-gray-900">Delete Plan?</div>
                 <div @click="showDeleteConfirm = false" class="p-2 cursor-pointer hover:bg-gray-100 rounded-full transition-colors active:bg-gray-200">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#000000" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                 </div>
             </div>
             
             <div class="text-gray-600 mb-8 leading-relaxed">
                 This will permanently remove this brewing record from your history.
             </div>

             <div class="flex gap-4 pb-4">
                <button class="flex-1 py-4 bg-gray-100 text-gray-900 rounded-xl font-bold tracking-widest uppercase text-xs hover:bg-gray-200 transition-colors" @click="showDeleteConfirm = false">Cancel</button>
                <button class="flex-1 py-4 bg-red-50 text-red-600 border border-red-100 rounded-xl font-bold tracking-widest uppercase text-xs shadow-sm hover:bg-red-100 transition-all" @click="confirmDeletePlan">Delete</button>
             </div>
        </div>
    </div>

  </div>
</template>
 
<script setup>
import { ref, computed } from 'vue'
import { AIProvider } from '@/services/AIProvider'
import { BREWERS, GRINDERS, WATERS } from '@/services/EquipmentData'
import { HistoryService } from '@/services/HistoryService'
import { SettingsService } from '@/services/SettingsService'
import RadarChart from '@/components/RadarChart.vue'

const beanName = ref('')
const beanRoaster = ref('') // Brand Name
const beanOrigin = ref('')
const beanProcess = ref('')
const beanRoast = ref('')
const beanNotes = ref([]) // Flavor tags from scan
// const beanImage = ref('') // Not showing image in header content mode
const brewingPlan = ref(null)
const loading = ref(true)
const error = ref(null)
const currentRecordId = ref(null)

// Equipment
const showSettings = ref(false)
const currentBrewer = ref(BREWERS[0]) 
const currentGrinder = ref(GRINDERS[0])
const currentWater = ref(WATERS[0]) 

// Feedback (SCA Score Default: 7.5 - Good)
const defaultSCA = 7.5
const showFeedback = ref(false)
const feedback = ref(null) // Default to NULL (No feedback)

const hasFeedback = computed(() => {
    return !!feedback.value && Object.keys(feedback.value).length > 0
})

const chartData = computed(() => {
    if (!feedback.value) return {}
    return {
        'Fragrance': feedback.value.fragrance_dry,
        'Aroma': feedback.value.aroma_wet,
        'Flavor': feedback.value.flavor,
        'Aftertaste': feedback.value.aftertaste,
        'Acidity': feedback.value.acidity,
        'Body': feedback.value.body,
        'Balance': feedback.value.balance
    }
})

const calculatedScore = computed(() => {
    if (!feedback.value) return '0.00'
    // Basic SCA Calc: Sum of 7 attributes + 30
    const aroma = (Number(feedback.value.fragrance_dry) + Number(feedback.value.aroma_wet)) / 2
    const total = aroma + 
                  Number(feedback.value.flavor) + 
                  Number(feedback.value.aftertaste) + 
                  Number(feedback.value.acidity) + 
                  Number(feedback.value.body) + 
                  Number(feedback.value.balance) + 
                  30 
                  
    return total.toFixed(2)
})

const openFeedbackModal = () => {
    const defaults = { 
        fragrance_dry: defaultSCA, 
        aroma_wet: defaultSCA, 
        flavor: defaultSCA, 
        aftertaste: defaultSCA, 
        acidity: defaultSCA, 
        body: defaultSCA, 
        balance: defaultSCA, 
        notes: '' 
    }
    // If null, init with defaults. If exists, keep it.
    feedback.value = feedback.value || { ...defaults }
    showFeedback.value = true
}

const saveOnly = () => {
    saveToHistory()
    showFeedback.value = false
    uni.showToast({ title: 'Logged', icon: 'success' })
}

const calibratePlan = () => {
    // 1. Save current state (Round 1) with Feedback
    saveToHistory()
    
    // 2. Prepare UI for next round
    showFeedback.value = false
    
    // 3. Generate NEW Plan (Round 2) based on this feedback
    fetchPlan(feedback.value)
}

// Exposed Method to Load Data
const loadRecipe = async (data) => {
    loading.value = true
    error.value = null
    brewingPlan.value = null
    
    console.log('loadRecipe called with:', JSON.stringify(data))

    currentRecordId.value = data.id || null
    beanName.value = data.name || 'Unknown Bean'
    beanRoaster.value = data.roaster || '' 
    // Store extra details for AI context
    beanOrigin.value = data.origin || ''
    beanProcess.value = data.process || ''
    beanRoast.value = data.roast || ''
    
    // ... (Flavor notes handling same)
    if (data.beanNotes && Array.isArray(data.beanNotes)) {
        beanNotes.value = data.beanNotes
    } else if (typeof data.beanNotes === 'string') {
        beanNotes.value = data.beanNotes.split(/[,，、.]/).map(n => n.trim()).filter(n => n)
    } else {
        beanNotes.value = []
    }

    if (data.equipment) {
        let b = BREWERS.find(item => item.name === data.equipment.brewer)
        let g = GRINDERS.find(item => item.name === data.equipment.grinder)
        let w = WATERS.find(item => item.name === data.equipment.water)
        const settings = SettingsService.getSettings()
        currentBrewer.value = b || settings.brewer || BREWERS[0]
        currentGrinder.value = g || settings.grinder || GRINDERS[0]
        currentWater.value = w || settings.water || WATERS[0]
    } else {
         const settings = SettingsService.getSettings()
         currentBrewer.value = settings.brewer || BREWERS[0]
         currentGrinder.value = settings.grinder || GRINDERS[0]
         currentWater.value = settings.water || WATERS[0]
    }
    
    if (data.plan) {
        brewingPlan.value = data.plan
        if (data.feedback) {
             // ... (Feedback Normalization Logic)
             const normalizedFeedback = { ...data.feedback }
             const keysToCheck = ['fragrance_dry', 'aroma_wet', 'flavor', 'aftertaste', 'acidity', 'body', 'balance']
             keysToCheck.forEach(key => {
                let val = normalizedFeedback[key]
                if (val !== undefined && val > 10) {
                    let newVal = 6 + (val / 100) * 4
                    if (newVal > 10) newVal = 10
                    normalizedFeedback[key] = parseFloat(newVal.toFixed(2))
                }
             })
             feedback.value = normalizedFeedback
        } else {
             feedback.value = null // Explicitly NO feedback
        }
        loading.value = false
        return
    }

    currentRecordId.value = null 
    await fetchPlan()
}

// ...

const saveToHistory = () => {
    const recordData = {
        beanName: beanName.value,
        roaster: beanRoaster.value,
        plan: brewingPlan.value,
        equipment: { 
            brewer: currentBrewer.value.name, 
            grinder: currentGrinder.value.name,
            water: currentWater.value.name 
        },
        feedback: feedback.value ? { ...feedback.value } : null // Save null if no feedback
    }
    // ... (Save logic)
    if (currentRecordId.value) {
        HistoryService.updateBrew(currentRecordId.value, recordData)
    } else {
        const newRecord = HistoryService.addBrew(recordData)
        currentRecordId.value = newRecord.id
    }
}

defineExpose({ loadRecipe })

const fetchPlan = async (calibrationData = null) => {
    loading.value = true
    error.value = null
    
    // ALWAYS start a new record for a new plan generation.
    // This allows "Dial In" to create Round 2, Round 3, etc.
    // The previous record (Round 1) was already saved by calibratePlan() before calling this.
    currentRecordId.value = null
    
    try {
        const beanData = { 
            name: beanName.value,
            roaster: beanRoaster.value,
            origin: beanOrigin.value,
            process: beanProcess.value,
            roast: beanRoast.value,
            equipment: { 
                brewer: currentBrewer.value.name, 
                grinder: currentGrinder.value.name,
                water: currentWater.value.name 
            },
            notes: beanNotes.value
        }
        
        // Context: Pass the OLD plan if we are calibrating (Dialing In)
        // calibrationData contains feedback. We need to attach the plan it applies to.
        const previousPlan = calibrationData ? brewingPlan.value : null

        const result = await AIProvider.getPlan(beanData, calibrationData, previousPlan)
        brewingPlan.value = result
        
        // CRITICAL: New Plan = New Tasting Session. Reset Feedback to NULL.
        feedback.value = null

        // AUTO-SAVE: Persist the plan immediately (without feedback)
        saveToHistory()
        
    } catch (e) {
        console.error('Recipe fetch error:', e)
        error.value = e.message || 'Unknown error occurred'
    } 
    finally { loading.value = false }
}

const retryFetchPlan = () => {
    fetchPlan()
}

// Parent needs to listen to @close to switch tab back to home
const emit = defineEmits(['close'])

const showDeleteConfirm = ref(false)

const deletePlan = () => {
    if (!currentRecordId.value) {
        uni.showToast({ title: 'Plan not saved', icon: 'none' })
        return
    }
    showDeleteConfirm.value = true
}

const confirmDeletePlan = () => {
    // 1. Delete from History
    HistoryService.deleteBrew(currentRecordId.value)
    
    // 2. Clear AI Cache for this bean+equipment combo so we can regenerate fresh
    const beanData = { 
        name: beanName.value,
        equipment: { 
            brewer: currentBrewer.value.name, 
            grinder: currentGrinder.value.name,
            water: currentWater.value.name 
        }
    }
    AIProvider.clearPlanCache(beanData, null) // Null feedback for initial plan

    showDeleteConfirm.value = false
    uni.showToast({ title: 'Deleted', icon: 'success' })
    emit('close')
}
</script>
