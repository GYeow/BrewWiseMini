<script>
export default {
  onLaunch: function () {
    console.log('App Launch')
  },
  onShow: function () {
    console.log('App Show')
  },
  onHide: function () {
    console.log('App Hide')
  },
}
</script>

<style>
/* Global Styles for Digital Zen Aesthetic */
@import 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Space+Grotesk:wght@300;400;500;700&display=swap';

:root {
  --font-display: 'Playfair Display', serif;
  --font-body: 'Space Grotesk', sans-serif;
  
  --color-ink: #1a1a1a;
  --color-paper: #f0f0f0;
  --color-rust: #c1624f;
  --color-stone: #8c8c8c;
}

body {
  font-family: var(--font-body);
  background-color: var(--color-paper);
  color: var(--color-ink);
  -webkit-font-smoothing: antialiased;
}

/* Noise Texture Overlay */
.bg-noise {
  position: relative;
}
.bg-noise::before {
  content: "";
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E");
  pointer-events: none;
  z-index: 0;
}

.font-display { font-family: var(--font-display); }
.font-body { font-family: var(--font-body); }

/* Animation Utils */
.slide-up-enter {
  animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  opacity: 0;
  transform: translateY(20px);
}

@keyframes slideUp {
  to { opacity: 1; transform: translateY(0); }
}

.delay-100 { animation-delay: 100ms; }
.delay-200 { animation-delay: 200ms; }
.delay-300 { animation-delay: 300ms; }

/* Custom Scrollbar hide */
::-webkit-scrollbar { display: none; }
</style>
