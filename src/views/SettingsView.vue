<template>
  <div class="h-full">
    
    <div class="text-xs font-bold text-gray-500 uppercase tracking-widest mb-6 px-1">
        Your Default Brew Kit
    </div>
    
    <div class="space-y-5">
        <!-- Brewer Picker -->
        <div class="bg-white p-5 rounded-2xl shadow-sm border-2 border-gray-100">
            <div class="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2">Brewer</div>
            <picker mode="selector" :range="BREWERS" range-key="name" @change="onBrewerChange">
                <div class="flex justify-between items-center bg-white p-4 rounded-xl border-2 border-brand-rust/20 active:border-brand-rust transition-colors shadow-sm">
                    <div class="text-lg font-display font-bold text-brand-dark">{{ settings.brewer.name }}</div>
                    <div class="text-xl text-brand-rust font-bold">▼</div>
                </div>
            </picker>
        </div>

        <!-- Grinder Picker -->
        <div class="bg-white p-5 rounded-2xl shadow-sm border-2 border-gray-100">
            <div class="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2">Grinder</div>
            <picker mode="selector" :range="GRINDERS" range-key="name" @change="onGrinderChange">
                <div class="flex justify-between items-center bg-white p-4 rounded-xl border-2 border-brand-rust/20 active:border-brand-rust transition-colors shadow-sm">
                     <div class="text-lg font-display font-bold text-brand-dark">{{ settings.grinder.name }}</div>
                     <div class="text-xl text-brand-rust font-bold">▼</div>
                </div>
            </picker>
        </div>

        <!-- Water Picker -->
        <div class="bg-white p-5 rounded-2xl shadow-sm border-2 border-gray-100">
            <div class="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2">Water</div>
            <picker mode="selector" :range="WATERS" range-key="name" @change="onWaterChange">
                <div class="flex justify-between items-center bg-white p-4 rounded-xl border-2 border-brand-rust/20 active:border-brand-rust transition-colors shadow-sm">
                     <div class="text-lg font-display font-bold text-brand-dark truncate pr-2">
                        {{ settings.water?.name ? settings.water.name.split('(')[0].trim() : 'Select Water' }}
                     </div>
                     <div class="text-xl text-brand-rust font-bold">▼</div>
                </div>
            </picker>
        </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { SettingsService } from '@/services/SettingsService'
import { BREWERS, GRINDERS, WATERS } from '@/services/EquipmentData'

const settings = ref(SettingsService.getSettings())

const onBrewerChange = (e) => {
    settings.value.brewer = BREWERS[e.detail.value]
    save()
}

const onGrinderChange = (e) => {
    settings.value.grinder = GRINDERS[e.detail.value]
    save()
}

const onWaterChange = (e) => {
    settings.value.water = WATERS[e.detail.value]
    save()
}

const save = () => {
    SettingsService.saveSettings(settings.value)
}
</script>
