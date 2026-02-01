const canvas = document.getElementById("playground");
const ctx = canvas.getContext("2d");

let width = window.innerWidth;
let height = window.innerHeight;
canvas.width = width;
canvas.height = height;

// UI elements
const gravityToggleBtn = document.getElementById("gravity-toggle");
const soundToggleBtn = document.getElementById("sound-toggle");
const themeSelect = document.getElementById("theme-select");
const resetBtn = document.getElementById("reset-btn");

// Audio
const ambientAudio = document.getElementById("ambient-audio");
const tapAudio = document.getElementById("tap-audio");

let gravityEnabled = true;
let soundEnabled = true;

// Theme system (only espresso for now, but extensible)
const themes = {
  espresso: {
    backgroundGradient: (ctx, w, h) => {
      const g = ctx.createRadialGradient(w * 0.5, h * 0.1, 0, w * 0.5, h * 0.9, h);
      g.addColorStop(0, "#3b2f2f");
      g.addColorStop(1, "#1b1412");
      return g;
    },
    donutColors: ["#c6a667", "#8a6e4a", "#f2d3a2", "#b48b5a", "#e8c58a"],
    sprinkleColors: ["#f5eee5", "#f2d3a2", "#c6a667", "#e8c58a"],
    drizzleColor: "#c6a667",
    powderedColor: "rgba(245, 238, 229, 0.8)"
  }
};

let currentTheme = themes.espresso;

// Physics + donuts
const donuts = [];
const MAX_DONUTS = 80;
const GRAVITY = 0.25;
const FRICTION = 0.82;
const BOUNCE = 0.72;

// Utility
function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function choice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Donut class
class Donut {
  constructor(x, y, options = {}) {
    this.x = x ?? rand(80, width - 80);
    this.y = y ?? rand(80, height - 80);
    this.radius = options.radius ?? rand(26, 46);
    this.vx = options.vx ?? rand(-2, 2);
    this.vy = options.vy ?? rand(-1, 1);
    this.color = options.color ?? choice(currentTheme.donutColors);
    this.glow = 18;
    this.toppings = this.generateToppings();
    this.squish = 1;
    this.targetSquish = 1;
  }

  generateToppings() {
    const toppings = {
      sprinkles: [],
      drizzle: Math.random() < 0.6,
      powdered: Math.random() < 0.4
    };

    const sprinkleCount = Math.floor(rand(8, 18));
    for (let i = 0; i < sprinkleCount; i++) {
      const angle = rand(0, Math.PI * 2);
      const dist = rand(this.radius * 0.3, this.radius * 0.9);
      toppings.sprinkles.push({
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist,
        length: rand(4, 8),
        angle: angle + rand(-0.4, 0.4),
        color: choice(currentTheme.sprinkleColors)
      });
    }

    return toppings;
  }

  applyPhysics() {
    if (gravityEnabled) {
      this.vy += GRAVITY;
    }

    this.x += this.vx;
    this.y += this.vy;

    // Walls
    if (this.x + this.radius > width) {
      this.x = width - this.radius;
      this.vx *= -BOUNCE;
    } else if (this.x - this.radius < 0) {
      this.x = this.radius;
      this.vx *= -BOUNCE;
    }

    // Floor / ceiling
    if (this.y + this.radius > height) {
      this.y = height - this.radius;
      this.vy *= -BOUNCE;
      this.vx *= FRICTION;
      this.targetSquish = 0.8;
    } else if (this.y - this.radius < 0) {
      this.y = this.radius;
      this.vy *= -BOUNCE;
    }

    // Squish easing
    this.squish += (this.targetSquish - this.squish) * 0.2;
    if (Math.abs(this.squish - 1) < 0.01) {
      this.squish = 1;
      this.targetSquish = 1;
    }
  }

  draw() {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.scale(1.05, this.squish);

    ctx.shadowBlur = this.glow;
    ctx.shadowColor = this.color;

    // Outer donut
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    const radial = ctx.createRadialGradient(
      -this.radius * 0.3,
      -this.radius * 0.3,
      this.radius * 0.2,
      0,
      0,
      this.radius
    );
    radial.addColorStop(0, "#f8f0e2");
    radial.addColorStop(0.4, this.color);
    radial.addColorStop(1, "#3b2f2f");
    ctx.fillStyle = radial;
    ctx.fill();

    // Inner hole
    ctx.beginPath();
    ctx.arc(0, 0, this.radius * 0.45, 0, Math.PI * 2);
    ctx.fillStyle = "#1b1412";
    ctx.fill();

    // Toppings
    this.drawToppings();

    ctx.restore();
  }

  drawToppings() {
    // Sprinkles
    this.toppings.sprinkles.forEach(s => {
      ctx.save();
      ctx.rotate(s.angle);
      ctx.beginPath();
      ctx.strokeStyle = s.color;
      ctx.lineWidth = 2;
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(s.x + s.length, s.y);
      ctx.stroke();
      ctx.restore();
    });

    // Drizzle
    if (this.toppings.drizzle) {
      ctx.save();
      ctx.strokeStyle = currentTheme.drizzleColor;
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.beginPath();
      const loops = 3;
      for (let i = 0; i <= loops; i++) {
        const t = i / loops;
        const angle = t * Math.PI * 2;
        const r = this.radius * 0.8;
        const y = Math.sin(angle * 2) * this.radius * 0.25;
        const x = Math.cos(angle) * r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.restore();
    }

    // Powdered sugar
    if (this.toppings.powdered) {
      ctx.save();
      ctx.fillStyle = currentTheme.powderedColor;
      for (let i = 0; i < 24; i++) {
        const angle = rand(0, Math.PI * 2);
        const dist = rand(this.radius * 0.2, this.radius * 0.9);
        const x = Math.cos(angle) * dist;
        const y = Math.sin(angle) * dist;
        ctx.beginPath();
        ctx.arc(x, y, rand(0.8, 1.6), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  hit(impulseX, impulseY) {
    this.vx += impulseX;
    this.vy += impulseY;
    this.glow = 32;
    this.targetSquish = 0.75;
    setTimeout(() => {
      this.glow = 18;
      this.targetSquish = 1;
    }, 220);
  }

  containsPoint(px, py) {
    const dx = px - this.x;
    const dy = py - this.y;
    return Math.hypot(dx, dy) <= this.radius;
  }
}

// Donut management
function spawnDonut(x, y, options = {}) {
  if (donuts.length >= MAX_DONUTS) {
    donuts.shift();
  }
  donuts.push(new Donut(x, y, options));
}

function resetDonuts() {
  donuts.length = 0;
  for (let i = 0; i < 18; i++) {
    spawnDonut();
  }
}

// Background
function drawBackground() {
  const g = currentTheme.backgroundGradient(ctx, width, height);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, width, height);
}

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  drawBackground();

  donuts.forEach(d => {
    d.applyPhysics();
    d.draw();
  });
}

resetDonuts();
animate();

// Resize
window.addEventListener("resize", () => {
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width;
  canvas.height = height;
});

// Interaction helpers
function playTapSound() {
  if (!soundEnabled) return;
  if (tapAudio) {
    tapAudio.currentTime = 0;
    tapAudio.play().catch(() => {});
  }
}

function ensureAmbientPlaying() {
  if (!soundEnabled) return;
  if (ambientAudio && ambientAudio.paused) {
    ambientAudio.volume = 0.6;
    ambientAudio.play().catch(() => {});
  }
}

// Mouse / click
canvas.addEventListener("mousedown", e => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  ensureAmbientPlaying();

  // Try to hit existing donut
  let hit = false;
  for (let i = donuts.length - 1; i >= 0; i--) {
    const d = donuts[i];
    if (d.containsPoint(x, y)) {
      const dx = d.x - x;
      const dy = d.y - y;
      const dist = Math.hypot(dx, dy) || 1;
      const impulse = 6;
      d.hit((dx / dist) * impulse, (dy / dist) * impulse);
      playTapSound();
      hit = true;
      break;
    }
  }

  // If no hit, spawn donut
  if (!hit) {
    spawnDonut(x, y, { vy: -2 });
    playTapSound();
  }
});

// Touch interactions
let lastTouchDistance = null;
let lastTouchPositions = [];

function getTouchPositions(touches) {
  const rect = canvas.getBoundingClientRect();
  const arr = [];
  for (let i = 0; i < touches.length; i++) {
    arr.push({
      x: touches[i].clientX - rect.left,
      y: touches[i].clientY - rect.top
    });
  }
  return arr;
}

function distanceBetween(p1, p2) {
  return Math.hypot(p1.x - p2.x, p1.y - p2.y);
}

canvas.addEventListener("touchstart", e => {
  e.preventDefault();
  ensureAmbientPlaying();

  const touches = getTouchPositions(e.touches);
  lastTouchPositions = touches;

  if (touches.length === 1) {
    const { x, y } = touches[0];
    spawnDonut(x, y, { vy: -2 });
    playTapSound();
  } else if (touches.length === 2) {
    lastTouchDistance = distanceBetween(touches[0], touches[1]);
  }
});

canvas.addEventListener("touchmove", e => {
  e.preventDefault();
  const touches = getTouchPositions(e.touches);

  if (touches.length === 1 && lastTouchPositions.length === 1) {
    // Swipe to push donuts
    const prev = lastTouchPositions[0];
    const curr = touches[0];
    const dx = curr.x - prev.x;
    const dy = curr.y - prev.y;

    donuts.forEach(d => {
      const dist = Math.hypot(d.x - curr.x, d.y - curr.y);
      if (dist < d.radius * 1.6) {
        d.hit(dx * 0.2, dy * 0.2);
      }
    });
  } else if (touches.length === 2 && lastTouchDistance !== null) {
    // Pinch to scatter
    const newDist = distanceBetween(touches[0], touches[1]);
    if (newDist - lastTouchDistance > 18) {
      donuts.forEach(d => {
        const cx = (touches[0].x + touches[1].x) / 2;
        const cy = (touches[0].y + touches[1].y) / 2;
        const dx = d.x - cx;
        const dy = d.y - cy;
        const dist = Math.hypot(dx, dy) || 1;
        const impulse = 10;
        d.hit((dx / dist) * impulse, (dy / dist) * impulse);
      });
      playTapSound();
      lastTouchDistance = newDist;
    } else {
      lastTouchDistance = newDist;
    }
  }

  lastTouchPositions = touches;
});

canvas.addEventListener("touchend", e => {
  e.preventDefault();
  const touches = getTouchPositions(e.touches);
  lastTouchPositions = touches;
  if (touches.length < 2) {
    lastTouchDistance = null;
  }
});

// Simple "shake" detection using devicemotion (optional)
if (window.DeviceMotionEvent) {
  let lastShakeTime = 0;
  window.addEventListener("devicemotion", e => {
    const acc = e.accelerationIncludingGravity;
    if (!acc) return;
    const magnitude = Math.hypot(acc.x || 0, acc.y || 0, acc.z || 0);
    const now = Date.now();
    if (magnitude > 22 && now - lastShakeTime > 1200) {
      lastShakeTime = now;
      donuts.forEach(d => {
        d.hit(rand(-8, 8), rand(-12, -4));
      });
      playTapSound();
    }
  });
}

// UI controls
gravityToggleBtn.addEventListener("click", () => {
  gravityEnabled = !gravityEnabled;
  gravityToggleBtn.classList.toggle("active", gravityEnabled);
  gravityToggleBtn.classList.toggle("inactive", !gravityEnabled);
  gravityToggleBtn.textContent = gravityEnabled ? "On" : "Off";
});

soundToggleBtn.addEventListener("click", () => {
  soundEnabled = !soundEnabled;
  soundToggleBtn.classList.toggle("active", soundEnabled);
  soundToggleBtn.classList.toggle("inactive", !soundEnabled);
  soundToggleBtn.textContent = soundEnabled ? "On" : "Off";

  if (!soundEnabled && ambientAudio) {
    ambientAudio.pause();
  } else {
    ensureAmbientPlaying();
  }
});

themeSelect.addEventListener("change", e => {
  const value = e.target.value;
  if (value === "espresso") {
    currentTheme = themes.espresso;
  }
  // If you add more themes later, handle them here.
  donuts.forEach(d => {
    d.color = choice(currentTheme.donutColors);
    d.toppings = d.generateToppings();
  });
});

resetBtn.addEventListener("click", () => {
  resetDonuts();
});
