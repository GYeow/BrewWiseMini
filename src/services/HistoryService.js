const HISTORY_KEY = 'brew_history'

export const HistoryService = {
    getHistory() {
        return uni.getStorageSync(HISTORY_KEY) || []
    },

    addBrew(brewRecord) {
        const history = this.getHistory()
        // record: { id, date, beanName, plan, equipment, feedback: { rating, notes } }
        if (!brewRecord.id) {
            brewRecord.id = Date.now().toString()
        }
        brewRecord.date = new Date().toISOString()

        // ALWAYS create a new entry for every brew session
        history.unshift(brewRecord)

        // Limit to 1000
        if (history.length > 1000) history.pop()

        uni.setStorageSync(HISTORY_KEY, history)
        return brewRecord
    },

    updateBrew(id, updates) {
        let history = this.getHistory()
        const index = history.findIndex(h => h.id === id)

        if (index !== -1) {
            history[index] = { ...history[index], ...updates }
            history[index].date = new Date().toISOString() // Update timestamp on edit? Maybe.
            uni.setStorageSync(HISTORY_KEY, history)
            return history[index]
        }
        return null
    },

    // Save a generated plan (without feedback yet). 
    // We now treat this as a potentially new history entry to ensure "Plan History" is preserved too.
    // However, if we just generated it, we might want to update the *same* entry when feedback is added.
    // Dashboard Logic: 1. Generate Plan -> 2. User Brews -> 3. User Logs Feedback. 
    // The Dashboard should hold the 'brewRecord' and update it.
    // Since UI separates Plan Gen from Feedback, we'll simplify:
    // 'upsertPlan' is for saving the *Initial* Plan. 
    upsertPlan(beanName, equipment, plan) {
        // We actually don't NEED to dedup by equipment anymore if we want a true LOG.
        // But for "Plan Library", maybe?
        // User request: "Feedback should be 1-to-1 with scheme".
        // So every time we generate a scheme and save it, it's a new "Session".

        const history = this.getHistory()

        const record = {
            id: Date.now().toString(), // Always new ID
            date: new Date().toISOString(),
            beanName,
            plan,
            equipment,
            type: 'plan' // Marker
        }

        history.unshift(record)

        if (history.length > 100) history.pop()

        uni.setStorageSync(HISTORY_KEY, history)
        return record
    },

    // Save a scanned bean result
    saveScan(beanData) {
        let scans = uni.getStorageSync('scan_history') || []
        // Check for existing by strict name/origin
        const index = scans.findIndex(s => s.name === beanData.name && s.origin === beanData.origin)

        if (index !== -1) {
            // Update existing with new data (e.g. Image)
            // Move to top to show as most recent
            const updated = { ...scans[index], ...beanData, date: new Date().toISOString() }
            scans.splice(index, 1)
            scans.unshift(updated)
        } else {
            // Create new
            scans.unshift({
                ...beanData,
                date: new Date().toISOString(),
                id: Date.now().toString()
            })
        }

        if (scans.length > 20) scans.pop()
        uni.setStorageSync('scan_history', scans)
    },

    getScans() {
        return uni.getStorageSync('scan_history') || []
    },

    // Get History grouped by Bean Name
    getGroupedHistory() {
        const scans = this.getScans()
        const plans = this.getHistory()

        let grouped = {}

        // 1. Initialize groups from scans
        scans.forEach(scan => {
            if (!grouped[scan.name]) {
                grouped[scan.name] = {
                    bean: scan,
                    plans: [],
                    lastDate: scan.date
                }
            }
        })

        // 2. Add plans to groups
        plans.forEach(plan => {
            const name = plan.beanName || 'Unknown Bean'
            if (!grouped[name]) {
                // If plan exists without scan (e.g. older data), create placeholder
                grouped[name] = {
                    bean: { name: name, roast: 'Unknown', origin: 'Unknown', isPlaceholder: true },
                    plans: [],
                    lastDate: plan.date
                }
            }
            grouped[name].plans.push(plan)
            // Update last interaction date
            if (new Date(plan.date) > new Date(grouped[name].lastDate)) {
                grouped[name].lastDate = plan.date
            }
        })

        // 3. Convert to array and sort by most recent interaction
        return Object.values(grouped).sort((a, b) => new Date(b.lastDate) - new Date(a.lastDate))
    },

    deleteBean(beanName) {
        // 1. Remove from Scans
        let scans = this.getScans()
        scans = scans.filter(s => s.name !== beanName)
        uni.setStorageSync('scan_history', scans)

        // 2. Remove related Plans
        let history = this.getHistory()
        history = history.filter(h => h.beanName !== beanName)
        uni.setStorageSync(HISTORY_KEY, history)
    },

    deleteBrew(id) {
        let history = this.getHistory()
        const initialLength = history.length
        history = history.filter(h => h.id !== id)

        if (history.length < initialLength) {
            uni.setStorageSync(HISTORY_KEY, history)
            return true
        }
        return false
    },

    getStats() {
        const history = this.getHistory()
        const totalBrews = history.length

        // Calculate brews this week
        const oneWeekAgo = new Date()
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

        const weeklyBrews = history.filter(h => new Date(h.date) > oneWeekAgo).length

        return {
            totalBrews,
            weeklyBrews
        }
    },

    clearHistory() {
        uni.removeStorageSync(HISTORY_KEY)
        uni.removeStorageSync('scan_history')
    }
}
