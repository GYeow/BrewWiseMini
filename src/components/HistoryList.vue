<template>
  <div class="space-y-6 pb-20">
    <!-- Header/Filter if needed, or simple Label -->
    <div v-if="historyGroups.length > 0" class="flex justify-between items-end px-1">
        <div class="text-xs font-bold text-gray-500 uppercase tracking-widest">Recent Journal</div>
    </div>

    <!-- Empty State -->
    <div v-if="historyGroups.length === 0" class="flex flex-col items-center justify-center pt-10 px-10 text-center opacity-40">
        <div class="i-mdi-notebook-outline text-4xl mb-2"></div>
        <div class="text-sm">No brewing history yet.</div>
    </div>

    <!-- History List -->
    <div v-else class="space-y-6 md:grid md:grid-cols-2 md:space-y-0 md:gap-6 lg:grid-cols-3">
        <div v-for="(group, idx) in historyGroups" :key="group.bean.name + idx" 
             class="bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col border border-gray-100/50">
            
            <!-- Bean Header -->
            <div class="p-4 flex gap-4 border-b border-gray-100 bg-gray-50/30">
                <!-- Thumbnail -->
                <div class="w-16 h-16 rounded-xl bg-gray-200 overflow-hidden flex-shrink-0 relative">
                    <image v-if="group.bean.image" :src="group.bean.image" mode="aspectFill" class="w-full h-full" />
                    <div v-else class="w-full h-full flex items-center justify-center bg-brand-rust/10 text-brand-rust">
                        <div class="i-mdi-coffee text-2xl"></div>
                    </div>
                </div>

                <!-- Info -->
                <div class="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                    <div class="flex justify-between items-start">
                        <div class="min-w-0 pr-2">
                             <div v-if="group.bean.roaster" class="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5 truncate">{{ group.bean.roaster }}</div>
                             <div class="text-lg font-bold truncate text-brand-dark leading-tight">{{ group.bean.name }}</div>
                        </div>
                        <!-- Delete Action -->
                        <div @click.stop="deleteBean(group.bean.name)" class="text-gray-400 hover:text-red-500 transition-colors px-2 py-1 rounded bg-gray-100/50 hover:bg-red-50 -mr-2">
                           <div class="text-xs font-bold uppercase tracking-wider">DELETE</div>
                        </div>
                    </div>
                    
                    <!-- Flavor Notes (User Requested) -->
                    <div v-if="getNotesArray(group.bean.notes).length" class="text-xs text-brand-rust/80 font-medium leading-snug mt-1 line-clamp-2">
                         <span class="flex flex-wrap gap-1">
                            <span v-for="(note, nIdx) in getNotesArray(group.bean.notes)" :key="nIdx" class="bg-brand-rust/5 px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wide">
                                {{ note }}
                            </span>
                         </span>
                    </div>
                </div>
            </div>

            <!-- Plans List (Timeline) -->
            <div class="p-4 pt-1">
                <!-- If No Plans, Show Generate Button -->
                <div v-if="group.plans.length === 0" class="py-6 flex justify-center">
                    <button @click="$emit('continueBrew', group.bean)" class="bg-gray-200 text-gray-900 text-xs font-bold uppercase tracking-widest px-4 py-3 rounded-xl active:bg-gray-300 transition-colors flex items-center gap-2">
                        <div class="i-mdi-coffee-maker text-lg"></div> Generate First Plan
                    </button>
                </div>

                <div v-else class="relative space-y-6">
                    <!-- Vertical Timeline Line -->
                    <div class="absolute left-[15px] top-3 bottom-0 w-0.5 bg-gray-100"></div>

                    <div v-for="(plan, pIdx) in group.plans" :key="pIdx" @click="viewPlan(plan, group.bean)" class="relative pl-10 cursor-pointer group">
                        <!-- Timeline Dot -->
                        <div class="absolute left-[10px] top-1.5 w-3 h-3 rounded-full bg-white border-2 border-brand-rust z-10 shadow-sm group-hover:scale-110 transition-transform"></div>
                        
                        <!-- Content Card -->
                        <div class="bg-gray-50/50 hover:bg-gray-100 transition-colors rounded-xl p-3 border border-gray-100">
                            <!-- Header: Round + Date -->
                            <div class="flex justify-between items-center mb-1">
                                <div class="text-sm font-bold text-gray-900 group-hover:text-brand-rust transition-colors">
                                    Round {{ group.plans.length - pIdx }}
                                </div>
                                <div class="text-[10px] uppercase font-bold text-gray-300 tracking-wider">
                                    {{ new Date(plan.date).toLocaleDateString([], { month: 'short', day: 'numeric' }) }}
                                </div>
                            </div>
                            
                            <!-- Insight (Simplified) -->
                            <div class="text-xs text-gray-500 line-clamp-2 leading-relaxed italic mb-1">
                                "{{ plan.plan?.logic || 'AI Optimized Plan' }}"
                            </div>
                            
                            <!-- User Feedback -->
                            <div v-if="plan.feedback?.notes" class="mt-2 pt-2 border-t border-gray-200/50">
                                <div class="text-xs text-amber-900/80 bg-amber-50 rounded px-2 py-1 inline-block">
                                   <span class="font-bold mr-1">You:</span> {{ plan.feedback.notes }}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    </div>
    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteConfirm" class="fixed inset-0 z-50 bg-brand-ink/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 md:p-8" @click.self="showDeleteConfirm = false">
        <div class="bg-white w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl sm:rounded-b-3xl p-8 animate-slide-up shadow-2xl pb-safe">
             <div class="flex justify-between items-center mb-6">
                 <div class="text-2xl font-display font-bold text-gray-900">Delete Bean?</div>
                 <div @click="showDeleteConfirm = false" class="p-2 cursor-pointer hover:bg-gray-100 rounded-full transition-colors active:bg-gray-200">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#000000" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                 </div>
             </div>
             
             <div class="text-gray-600 mb-8 leading-relaxed">
                 Are you sure you want to delete <strong>{{ beanToDelete }}</strong> and all its brewing history? This cannot be undone.
             </div>

             <div class="flex gap-4 pb-4">
                <button class="flex-1 py-4 bg-gray-100 text-gray-900 rounded-xl font-bold tracking-widest uppercase text-xs hover:bg-gray-200 transition-colors" @click="showDeleteConfirm = false">Cancel</button>
                <button class="flex-1 py-4 bg-red-50 text-red-600 border border-red-100 rounded-xl font-bold tracking-widest uppercase text-xs shadow-sm hover:bg-red-100 transition-all" @click="confirmDeleteBean">Delete</button>
             </div>
        </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { HistoryService } from '@/services/HistoryService'

const historyGroups = ref([])

const loadHistory = () => {
    historyGroups.value = HistoryService.getGroupedHistory()
}

defineExpose({ loadHistory })

onMounted(() => {
    loadHistory()
})

const getNotesArray = (notes) => {
    if (!notes) return []
    if (Array.isArray(notes)) return notes
    if (typeof notes === 'string') {
        // Handle comma or dot separated strings
        return notes.split(/[,，、.]/).map(n => n.trim()).filter(n => n)
    }
    return []
}

const showDeleteConfirm = ref(false)
const beanToDelete = ref(null)

const deleteBean = (beanName) => {
    beanToDelete.value = beanName
    showDeleteConfirm.value = true
}

const confirmDeleteBean = () => {
    if (beanToDelete.value) {
        HistoryService.deleteBean(beanToDelete.value)
        loadHistory()
        showDeleteConfirm.value = false
        beanToDelete.value = null
    }
}

const emit = defineEmits(['openRecipe'])

const viewPlan = (planRecord, beanData) => {
    // Construct valid Recipe Data
    const data = {
        id: planRecord.id, // Pass ID for updating
        name: planRecord.beanName,
        roaster: beanData.roaster || planRecord.roaster, // Pass Roaster (from Scan or Plan record)
        equipment: planRecord.equipment,
        // Pass the EXISTING plan to avoid re-generation
        plan: planRecord.plan,
        feedback: planRecord.feedback,
        beanNotes: beanData ? beanData.notes : [] // Pass flavor notes
    }
    emit('openRecipe', data)
}
</script>
