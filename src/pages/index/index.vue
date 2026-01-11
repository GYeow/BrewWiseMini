<template>
  <div class="min-h-screen bg-brand-light text-brand-dark flex flex-col">
    <!-- Static Header (No Flicker) -->
    <GlobalHeader />
    
    <!-- Static Navigation (No Flicker) -->
    <TopTabs :activeTab="currentTab" @update:activeTab="switchTab" />
    
    <!-- Dynamic Content Area -->
    <div class="flex-1 p-6 pb-32 overflow-y-auto">
        
        <!-- Home View -->
        <div v-show="currentTab === 'home'">
            <HomeView ref="homeViewRef" @switchTab="switchTab" @openRecipe="openRecipe" />
        </div>

        <!-- Settings View -->
        <div v-show="currentTab === 'settings'">
            <SettingsView />
        </div>
        
        <!-- Recipe View (Overlay/Page) -->
         <div v-show="currentTab === 'recipe'" class="h-full">
            <RecipeView ref="recipeViewRef" @close="switchTab('home')" />
        </div>

    </div>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import GlobalHeader from '@/components/GlobalHeader.vue'
import TopTabs from '@/components/TopTabs.vue'

// Import Views
import HomeView from '@/views/HomeView.vue'
import SettingsView from '@/views/SettingsView.vue'
import RecipeView from '@/views/RecipeView.vue'

const currentTab = ref('home')
const homeViewRef = ref(null)
const recipeViewRef = ref(null)

const switchTab = (tab) => {
    currentTab.value = tab
    
    // Refresh data when switching to Home
    nextTick(() => {
        if (tab === 'home' && homeViewRef.value) {
            homeViewRef.value.refreshData()
        }
    })
}

// Global Recipe Loader
const openRecipe = (data) => {
    currentTab.value = 'recipe'
    nextTick(() => {
        if (recipeViewRef.value) {
            recipeViewRef.value.loadRecipe(data)
        }
    })
}


onLoad((options) => {
    // Handle deep links or params if needed
    if (options.tab) {
        currentTab.value = options.tab
    }
})
</script>

<style>
/* Global Styles for Views */
</style>
