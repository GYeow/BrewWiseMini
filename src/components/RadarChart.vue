<template>
  <div ref="chartRef" class="w-full h-[300px] mx-auto"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
  data: {
    type: Object,
    default: () => ({})
  },
  min: {
      type: Number,
      default: 6
  },
  max: {
      type: Number,
      default: 10
  }
})

const chartRef = ref(null)
let chartInstance = null
let resizeObserver = null

// Computed for indicators and data
const chartData = computed(() => {
    // Expected data format from RecipeView: { Aroma: 7.5, Body: 8... }
    const indicators = Object.keys(props.data).map(key => ({
        name: key,
        max: props.max,
        min: props.min
    }))
    
    const values = Object.values(props.data)
    
    return { indicators, values }
})

const initChart = () => {
    if (!chartRef.value) return
    
    chartInstance = echarts.init(chartRef.value)
    setOptions()
}

const setOptions = () => {
    if (!chartInstance) return

    const { indicators, values } = chartData.value

    const option = {
        radar: {
            // shape: 'circle',
            indicator: indicators,
            center: ['50%', '50%'],
            radius: '70%',
            splitNumber: 4,
            axisName: {
                color: '#9ca3af', // gray-400
                fontSize: 10,
                fontWeight: 'bold',
                fontFamily: 'sans-serif'
            },
            splitLine: {
                lineStyle: {
                    color: '#e5e7eb' // gray-200
                }
            },
            splitArea: {
                show: false
            },
            axisLine: {
                lineStyle: {
                    color: '#e5e7eb'
                }
            }
        },
        tooltip: {
            trigger: 'item'
        },
        series: [
            {
                name: 'Cup Evaluation',
                type: 'radar',
                data: [
                    {
                        value: values,
                        name: 'Score'
                    }
                ],
                symbol: 'circle',
                symbolSize: 6,
                itemStyle: {
                    color: '#c1624f' // brand-rust
                },
                lineStyle: {
                    width: 2,
                    color: '#c1624f'
                },
                areaStyle: {
                    color: 'rgba(193, 98, 79, 0.2)'
                }
            }
        ]
    }

    chartInstance.setOption(option)
}

watch(() => props.data, () => {
    setOptions()
}, { deep: true })

onMounted(() => {
    // Initial init
    initChart()

    // Robust resizing using ResizeObserver
    if (chartRef.value) {
        resizeObserver = new ResizeObserver(() => {
            if (chartInstance) {
                chartInstance.resize()
            }
        })
        resizeObserver.observe(chartRef.value)
    }
})

onUnmounted(() => {
    if (resizeObserver) {
        resizeObserver.disconnect()
    }
    if (chartInstance) {
        chartInstance.dispose()
    }
})
</script>
