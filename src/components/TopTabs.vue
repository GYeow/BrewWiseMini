<template>
  <div class="bg-white border-b border-gray-100 flex sticky top-[80px] z-20 shadow-sm">
    
    <!-- Home Tab -->
    <div @click="switchTab('home')" class="flex-1 flex flex-col items-center justify-center py-3 cursor-pointer active:bg-gray-50 transition-colors relative">
        <div class="text-sm font-bold tracking-wider mb-1 transition-colors" :class="[activeTab === 'home' ? 'text-brand-rust' : 'text-gray-400']">HOME</div>
        <!-- Active Indicator -->
        <div v-if="activeTab === 'home'" class="absolute bottom-0 w-8 h-0.5 bg-brand-rust rounded-t-full"></div>
    </div>



    <!-- Setting Tab -->
    <div @click="switchTab('settings')" class="flex-1 flex flex-col items-center justify-center py-3 cursor-pointer active:bg-gray-50 transition-colors relative">
        <div class="text-sm font-bold tracking-wider mb-1 transition-colors" :class="[activeTab === 'settings' ? 'text-brand-rust' : 'text-gray-400']">SETTING</div>
        <!-- Active Indicator -->
        <div v-if="activeTab === 'settings'" class="absolute bottom-0 w-12 h-0.5 bg-brand-rust rounded-t-full"></div>
    </div>

  </div>
</template>

<script setup>
const props = defineProps({
    activeTab: {
        type: String,
        default: 'home'
    }
})

const emit = defineEmits(['update:activeTab'])

const switchTab = (tab) => {
    if (tab === props.activeTab) return
    emit('update:activeTab', tab)
}
</script>
