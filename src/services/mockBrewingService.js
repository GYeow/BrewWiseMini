export const getMockPlan = (beanName) => {
    return {
        bean: beanName || "Unknown Bean",
        roast: "Light", // Mock assumption
        plan: {
            grind: "Medium-Fine (15 Clicks C40)",
            temp: "93°C",
            ratio: "1:16",
            water: "240ml",
            coffee: "15g",
            steps: [
                { time: 0, action: "Bloom", amount: "45ml", desc: "Wet coffee bed evenly" },
                { time: 45, action: "Pour 1", amount: "100ml", desc: "Spiral pour, avoid walls" },
                { time: 90, action: "Pour 2", amount: "95ml", desc: "Center pour mainly" },
                { time: 150, action: "Drawdown", amount: "", desc: "Wait for drain" }
            ],
            logic: "Based on the high acidity profile of this bean, we use a higher temperature and a standard 1:16 ratio to highlight sweetness while checking acidity."
        }
    }
}
