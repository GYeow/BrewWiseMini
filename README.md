# BrewWise ☕️
**A systematic, feedback-driven assistant for perfecting pour-over coffee.**

BrewWise is a **Digital Barista Consultant** designed to take the guesswork out of "dialing in" your coffee. Unlike static recipe apps, BrewWise treats coffee brewing as an iterative optimization problem. It generates tailored starting points and refines them based on your equipments, bean characteristics, and sensory feedback.

### Goal
To help home brewers achieve professional-grade consistency and repeatability without wasting half a bag of expensive beans just to find the "sweet spot."


## Demo
<video src="src/static/demo.mp4" controls width="68%"></video>

*Demo: BrewWise in action*


<img src="src/static/workflow.png" alt="BrewWise Workflow" width="68%" />

*Figure 1: The BrewWise Workflow*

## Key Features

1. **Intelligent Bean Parsing**: Stop manual entry. BrewWise extracts **Origin, Process, and Notes** from photos or text to understand the extraction potential of your coffee.

2. **Context-Aware Recipes**: No more one-size-fits-all. Recipes are recommended based on your specific **Grinder** (click mapping for Comandante/Timemore/etc.), **Filter Tool** (V60/Clever/etc.), and **Water**.

3. **The "Dial-in" Feedback Loop**: Log sensory results referencing **SCA cupping dimensions**. The engine suggests precise adjustments (e.g., "+5°F, 1 click coarser") for your next cup.

## Quick Start

1.  **Clone & Install**:
    ```bash
    git clone https://github.com/GYeow/BrewWiseMini.git
    cd BrewWiseMini && npm install
    ```

2.  **Setup API Key**:
    - Open `src/config.js`.
    - Replace `API_KEY` with your Aliyun/DashScope Key.

3.  **Run**:
    ```bash
    npm run dev:h5
    ```

## Acknowledgements
- [UniApp](https://uniapp.dcloud.io/) - Cross-platform framework
- [Vue.js](https://vuejs.org/) - The Progressive JavaScript Framework
- [ECharts](https://echarts.apache.org/) - Powerful Visualization Library
- [Qwen](https://github.com/QwenLM/Qwen) - LLM and VLM by Alibaba Cloud

---
*Brew smarter, not harder.*

> **Disclaimer**: Please note that this project is under active development; contributions, issues, and feedback are greatly appreciated.

