/* ---------------------------------------------------------
   ASILI DONUT PLAYGROUND 3.0 — ZEN MODE
--------------------------------------------------------- */

const canvas = document.getElementById("playground");
const ctx = canvas.getContext("2d");

let width = window.innerWidth;
let height = window.innerHeight;
canvas.width = width;
canvas.height = height;

/* ---------------------------------------------------------
   UI ELEMENTS
--------------------------------------------------------- */

const loadingScreen = document.getElementById("loading-screen");
const introOverlay = document.getElementById("intro-overlay");
const beginBtn = document.getElementById("begin-btn");

const zenToggle = document.getElementById("zen-toggle");
const gravityToggle = document.getElementById("gravity-toggle");
const soundToggle = document.getElementById("sound-toggle");
const ambienceSelect = document.getElementById("ambience-select");
const resetBtn = document.getElementById("reset-btn");

/* ---------------------------------------------------------
   AUDIO
--------------------------------------------------------- */

const ambience = {
  cafe: document.getElementById("ambient-cafe"),
  night: document.getElementById("ambient-night"),
  sunrise: document.getElementById("ambient-sunrise")
};

const tapSound = document.getElementById("tap-sound");
const sprinkleSound = document.getElementById("sprinkle-sound");

let currentAmbience = ambience.cafe;
let soundEnabled = true;

/* ---------------------------------------------------------
   THEME
--------------------------------------------------------- */

const theme = {
  donutColors: ["#c6a667", "#8a6e4a", "#f2d3a2", "#b48b5a", "#e8c58a"],
  sprinkleColors: ["#f5eee5", "#f2d3a2", "#c6a667", "#e8c58a"],
  drizzleColor: "#c6a667",
  powderedColor: "rgba(245, 238, 229, 0.8)",
  cinnamonColor: "rgba(139, 69, 19, 0.6)",
  goldFlakeColor: "rgba(255, 215, 0, 0.9)"
};

/* ---------------------------------------------------------
   PHYSICS SETTINGS
--------------------------------------------------------- */

let gravityStrength = 0.15;
let zenFlow = true;

const donuts = [];
const MAX_DONUTS = 60;

/* ---------------------------------------------------------
   UTILITY
--------------------------------------------------------- */

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function choice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/* ---------------------------------------------------------
   DONUT CLASS
--------------------------------------------------------- */

class Donut {
  constructor(x, y) {
    this.x = x ?? rand(80, width - 80);
    this.y = y ?? rand(80, height - 80);
    this.radius = rand(26, 46);
    this.vx = rand(-1.2, 1.2);
    this.vy = rand(-0.6, 0.6);
    this.color = choice(theme.donutColors);
    this.glow = 18;
    this.toppings = this.generateToppings();
    this.squish = 1;
    this.targetSquish = 1;
  }

  generateToppings() {
    return {
      sprinkles: this.generateSprinkles(),
      drizzle: Math.random() < 0.5,
      powdered: Math.random() < 0.4,
      cinnamon: Math.random() < 0.3,
      goldFlakes: Math.random() < 0.15
    };
  }

  generateSprinkles() {
    const arr = [];
    const count = Math.floor(rand(8, 18));
    for (let i = 0; i < count; i++) {
      const angle = rand(0, Math.PI * 2);
      const dist = rand(this.radius * 0.3, this.radius * 0.9);
      arr.push({
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist,
        length: rand(4, 8),
        angle: angle + rand(-0.4, 0.4),
        color: choice(theme.sprinkleColors)
      });
    }
    return arr;
  }

  applyPhysics() {
    if (!zenFlow) {
      this.vy += gravityStrength;
    }

    this.x += this.vx;
    this.y += this.vy;

    if (this.x + this.radius > width || this.x - this.radius < 0) {
      this.vx *= -0.8;
    }

    if (this.y + this.radius > height) {
      this.y = height - this.radius;
      this.vy *= -0.7;
      this.targetSquish = 0.8;
    }

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

    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = radial;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(0, 0, this.radius * 0.45, 0, Math.PI * 2);
    ctx.fillStyle = "#1b1412";
    ctx.fill();

    this.drawToppings();
    ctx.restore();
  }

  drawToppings() {
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

    if (this.toppings.drizzle) {
      ctx.save();
      ctx.strokeStyle = theme.drizzleColor;
      ctx.lineWidth = 3;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        const r = this.radius * 0.8;
        ctx.lineTo(Math.cos(angle) * r, Math.sin(angle * 2) * this.radius * 0.25);
      }
      ctx.stroke();
      ctx.restore();
    }

    if (this.toppings.powdered) {
      ctx.save();
      ctx.fillStyle = theme.powderedColor;
      for (let i = 0; i < 20; i++) {
        const angle = rand(0, Math.PI * 2);
        const dist = rand(this.radius * 0.2, this.radius * 0.9);
        ctx.beginPath();
        ctx.arc(Math.cos(angle) * dist, Math.sin(angle) * dist, rand(0.8, 1.6), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    if (this.toppings.cinnamon) {
      ctx.save();
      ctx.fillStyle = theme.cinnamonColor;
      for (let i = 0; i < 14; i++) {
        const angle = rand(0, Math.PI * 2);
        const dist = rand(this.radius * 0.3, this.radius * 0.9);
        ctx.beginPath();
        ctx.arc(Math.cos(angle) * dist, Math.sin(angle) * dist, rand(1, 2), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    if (this.toppings.goldFlakes) {
      ctx.save();
      ctx.fillStyle = theme.goldFlakeColor;
      for (let i = 0; i < 10; i++) {
        const angle = rand(0, Math.PI * 2);
        const dist = rand(this.radius * 0.3, this.radius * 0.9);
        ctx.beginPath();
        ctx.arc(Math.cos(angle) * dist, Math.sin(angle) * dist, rand(1.2, 2.4), 0, Math.PI *
