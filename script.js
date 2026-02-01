:root {
  /* Espresso + Gold theme */
  --bg-dark: #1b1412;
  --bg-mid: #3b2f2f;
  --accent-gold: #c6a667;
  --accent-gold-soft: rgba(198, 166, 103, 0.4);
  --text-main: #f5eee5;
  --text-muted: #b9a89a;
  --panel-bg: rgba(18, 12, 10, 0.88);
  --panel-border: rgba(198, 166, 103, 0.5);
  --button-bg: rgba(59, 47, 47, 0.9);
  --button-bg-active: rgba(198, 166, 103, 0.18);
  --button-border: rgba(198, 166, 103, 0.7);
  --button-text: #f5eee5;
  --button-text-muted: #b9a89a;
  --shadow-strong: 0 0 25px rgba(198, 166, 103, 0.45);
  --radius-soft: 14px;
}

*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  overflow: hidden;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Poppins", sans-serif;
  color: var(--text-main);
  background: radial-gradient(circle at top, var(--bg-mid), var(--bg-dark));
}

/* Canvas */

#playground {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  display: block;
}

/* UI Panel */

#ui {
  position: fixed;
  top: 1.5rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  pointer-events: none;
}

.controls {
  pointer-events: auto;
  background: var(--panel-bg);
  border-radius: 18px;
  border: 1px solid var(--panel-border);
  padding: 0.9rem 1.2rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem 1.25rem;
  align-items: center;
  box-shadow: var(--shadow-strong);
  backdrop-filter: blur(14px);
  max-width: 960px;
}

.logo {
  flex: 1 1 100%;
  font-size: 0.9rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--text-muted);
  border-bottom: 1px solid rgba(198, 166, 103, 0.25);
  padding-bottom: 0.35rem;
  margin-bottom: 0.35rem;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 120px;
}

.control-group label {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--text-muted);
}

.toggle,
.action {
  border-radius: var(--radius-soft);
  border: 1px solid var(--button-border);
  background: var(--button-bg);
  color: var(--button-text);
  padding: 0.35rem 0.8rem;
  font-size: 0.8rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  transition:
    background 0.18s ease,
    border-color 0.18s ease,
    transform 0.12s ease,
    box-shadow 0.18s ease;
  box-shadow: 0 0 0 rgba(0, 0, 0, 0);
}

.toggle.active,
.action:hover {
  background: var(--button-bg-active);
  box-shadow: var(--shadow-strong);
  transform: translateY(-1px);
}

.toggle.inactive {
  color: var(--button-text-muted);
  border-color: rgba(198, 166, 103, 0.25);
}

#theme-select {
  border-radius: var(--radius-soft);
  border: 1px solid var(--button-border);
  background: var(--button-bg);
  color: var(--button-text);
  padding: 0.35rem 0.6rem;
  font-size: 0.8rem;
  outline: none;
  cursor: pointer;
}

#theme-select:focus {
  box-shadow: var(--shadow-strong);
}

.hint {
  flex: 1 1 100%;
  font-size: 0.7rem;
  color: var(--text-muted);
  margin-top: 0.1rem;
}

/* Mobile */

@media (max-width: 720px) {
  #ui {
    top: auto;
    bottom: 0.75rem;
    left: 50%;
    transform: translateX(-50%);
    width: 100%;
    padding: 0 0.75rem;
  }

  .controls {
    padding: 0.7rem 0.8rem;
    border-radius: 16px;
    gap: 0.5rem 0.75rem;
  }

  .logo {
    font-size: 0.75rem;
  }

  .control-group {
    min-width: 46%;
  }

  .hint {
    font-size: 0.65rem;
  }
}
