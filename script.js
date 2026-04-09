// ═══════════════════════════════════════════
//   SimulAC — script.js
//   Simulador de circuito RLC serie en CA
// ═══════════════════════════════════════════

/* ── Referencias DOM ─────────────────────── */
const sliders = {
  voltage:     document.getElementById('voltage'),
  freq:        document.getElementById('freq'),
  resistance:  document.getElementById('resistance'),
  inductance:  document.getElementById('inductance'),
  capacitance: document.getElementById('capacitance'),
};
const displays = {
  voltage:     document.getElementById('voltageVal'),
  freq:        document.getElementById('freqVal'),
  resistance:  document.getElementById('resistanceVal'),
  inductance:  document.getElementById('inductanceVal'),
  capacitance: document.getElementById('capacitanceVal'),
};
const results = {
  XL:   document.getElementById('XL'),
  XC:   document.getElementById('XC'),
  Z:    document.getElementById('Z'),
  Ip:   document.getElementById('Ip'),
  Irms: document.getElementById('Irms'),
  phi:  document.getElementById('phi'),
  f0:   document.getElementById('f0'),
  fp:   document.getElementById('fp'),
};
const phaseBadge = document.getElementById('phaseBadge');
const btnPlay    = document.getElementById('btnPlay');
const btnReset   = document.getElementById('btnReset');

/* ── Canvas ──────────────────────────────── */
const waveCanvas   = document.getElementById('waveCanvas');
const phasorCanvas = document.getElementById('phasorCanvas');
const wCtx  = waveCanvas.getContext('2d');
const pCtx  = phasorCanvas.getContext('2d');

/* ── Estado ──────────────────────────────── */
let running  = false;
let timeOffset = 0;   // desplazamiento de fase del tiempo (animación)
let lastTime   = null;
let animId     = null;

/* ── Parámetros calculados ───────────────── */
let circuit = {};
let speedAnimation = 0.05;
/* ── Colores CSS ─────────────────────────── */
const C_V    = '#00e5ff';
const C_I    = '#ff6b35';
const C_GRID = '#1e2a3a';
const C_AXIS = '#2a3a4a';
const C_TEXT = '#4a6070';
const C_R    = '#39ff14';

// ─────────────────────────────────────────────
//  CÁLCULOS DEL CIRCUITO
// ─────────────────────────────────────────────
function calcCircuit() {
  const Vp = +document.getElementById('voltage').value    * +document.getElementById('voltageUnit').value;
  const f  = +document.getElementById('freq').value       * +document.getElementById('freqUnit').value;
  const R  = +document.getElementById('resistance').value * +document.getElementById('resistanceUnit').value;
  const L  = +document.getElementById('inductance').value * +document.getElementById('inductanceUnit').value;
  const C  = +document.getElementById('capacitance').value * +document.getElementById('capacitanceUnit').value;

  const omega = 2 * Math.PI * f;
  const XL    = omega * L;
  const XC    = 1 / (omega * C);
  const Z     = Math.sqrt(R * R + (XL - XC) ** 2);
  const phi   = Math.atan2(XL - XC, R);           // rad
  const Ip    = Vp / Z;
  const Irms  = Ip / Math.SQRT2;
  const f0    = 1 / (2 * Math.PI * Math.sqrt(L * C));
  const fp    = Math.cos(phi);

  circuit = { Vp, f, R, L, C, omega, XL, XC, Z, phi, Ip, Irms, f0, fp };

  // Mostrar resultados
  results.XL.textContent   = XL.toFixed(2);
  results.XC.textContent   = XC.toFixed(2);
  results.Z.textContent    = Z.toFixed(2);
  results.Ip.textContent   = Ip.toFixed(3);
  results.Irms.textContent = Irms.toFixed(3);
  results.phi.textContent  = (phi * 180 / Math.PI).toFixed(1);
  results.f0.textContent   = f0.toFixed(2);
  results.fp.textContent   = fp.toFixed(3);

  // Badge de fase
  const deg = XL - XC;;
  if (deg.toFixed(2) == 0) {
    phaseBadge.textContent = '⚡ Resonancia — φ ≈ 0°';
    phaseBadge.style.color = C_R;
  } else if (deg > 0) {
    phaseBadge.textContent = `↑ Circuito Inductivo — I atrasa φ = ${deg.toFixed(1)}°`;
    phaseBadge.style.color = C_V;
  } else {
    phaseBadge.textContent = `↓ Circuito Capacitivo — I adelanta φ = ${Math.abs(deg).toFixed(1)}°`;
    phaseBadge.style.color = C_I;
  }
}

// ─────────────────────────────────────────────
//  RESIZE CANVAS
// ─────────────────────────────────────────────
function resizeCanvases() {
  waveCanvas.width   = waveCanvas.offsetWidth;
  waveCanvas.height  = waveCanvas.offsetHeight;
  phasorCanvas.width  = phasorCanvas.offsetWidth;
  phasorCanvas.height = phasorCanvas.offsetHeight;
}

// ─────────────────────────────────────────────
//  DIBUJAR ONDAS
// ─────────────────────────────────────────────
function drawWaves(t) {
  const W = waveCanvas.width;
  const H = waveCanvas.height;
  const cx = W;
  const cy = H / 2;
  const { Vp, Ip, omega, phi } = circuit;

  wCtx.clearRect(0, 0, W, H);

  // Fondo cuadrícula
  wCtx.strokeStyle = C_GRID;
  wCtx.lineWidth = 0.5;
  const nH = 8, nV = 10;
  for (let i = 0; i <= nH; i++) {
    const y = (H / nH) * i;
    wCtx.beginPath(); wCtx.moveTo(0, y); wCtx.lineTo(W, y); wCtx.stroke();
  }
  for (let i = 0; i <= nV; i++) {
    const x = (W / nV) * i;
    wCtx.beginPath(); wCtx.moveTo(x, 0); wCtx.lineTo(x, H); wCtx.stroke();
  }

  // Eje X central
  wCtx.strokeStyle = C_AXIS;
  wCtx.lineWidth = 1;
  wCtx.beginPath(); wCtx.moveTo(0, cy); wCtx.lineTo(W, cy); wCtx.stroke();

  // Etiquetas Y
  wCtx.fillStyle = C_TEXT;
  wCtx.font = '10px Share Tech Mono, monospace';
  wCtx.fillText(`+${Vp.toFixed(0)}V`, 4, 14);
  wCtx.fillText(`-${Vp.toFixed(0)}V`, 4, H - 4);
  wCtx.fillText(`+${Ip.toFixed(2)}A`, W - 58, 14);
  wCtx.fillText(`-${Ip.toFixed(2)}A`, W - 58, H - 4);

  const scaleV = (H / 2 - 18) / Vp;
  const scaleI = (H / 2 - 18) / Ip;

  // Escala horizontal para que cada ciclo ocupe un ancho constante
  const pxPerCycle = Math.max(80, Math.min(140, W / 5));
  const radPerPx = 2 * Math.PI / pxPerCycle;

  // ── Voltaje ───────────────────────────────
  wCtx.beginPath();
  wCtx.strokeStyle = C_V;
  wCtx.lineWidth = 2.5;
  wCtx.shadowColor = C_V;
  wCtx.shadowBlur  = 8;
  for (let px = 0; px < W; px++) {
    const theta = px * radPerPx + t * omega;
    const vy = cy - Math.sin(theta) * Vp * scaleV;
    px === 0 ? wCtx.moveTo(px, vy) : wCtx.lineTo(px, vy);
  }
  wCtx.stroke();

  // ── Corriente ─────────────────────────────
  wCtx.beginPath();
  wCtx.strokeStyle = C_I;
  wCtx.lineWidth = 2.5;
  wCtx.shadowColor = C_I;
  wCtx.shadowBlur  = 8;
  for (let px = 0; px < W; px++) {
    const theta = px * radPerPx + t * omega - phi;
    const iy = cy - Math.sin(theta) * Ip * scaleI;
    px === 0 ? wCtx.moveTo(px, iy) : wCtx.lineTo(px, iy);
  }
  wCtx.stroke();

  wCtx.shadowBlur = 0;

  // ── Indicador de tiempo actual (línea vertical izquierda) ──
  const xNow = 2;
  const thetaV_now = t * omega;
  const thetaI_now = t * omega - phi;
  const yV_now = cy - Math.sin(thetaV_now) * Vp * scaleV;
  const yI_now = cy - Math.sin(thetaI_now) * Ip * scaleI;

  // Punto en V
  wCtx.beginPath();
  wCtx.arc(xNow, yV_now, 5, 0, Math.PI * 2);
  wCtx.fillStyle = C_V;
  wCtx.shadowColor = C_V; wCtx.shadowBlur = 14;
  wCtx.fill();

  // Punto en I
  wCtx.beginPath();
  wCtx.arc(xNow, yI_now, 5, 0, Math.PI * 2);
  wCtx.fillStyle = C_I;
  wCtx.shadowColor = C_I; wCtx.shadowBlur = 14;
  wCtx.fill();
  wCtx.shadowBlur = 0;

  // Valores instantáneos texto
  const vNow = Math.sin(thetaV_now) * Vp;
  const iNow = Math.sin(thetaI_now) * Ip;
  wCtx.fillStyle = C_V;
  wCtx.font = 'bold 12px Share Tech Mono, monospace';
  wCtx.fillText(`v(t) = ${vNow.toFixed(1)} V`, 16, 18);
  wCtx.fillStyle = C_I;
  wCtx.fillText(`i(t) = ${iNow.toFixed(3)} A`, 16, 34);

  // Desfase anotado
  if (Math.abs(phi) > 0.01) {
    const phiDeg = (phi * 180 / Math.PI).toFixed(1);
    wCtx.fillStyle = '#ffffff55';
    wCtx.font = '11px Share Tech Mono, monospace';
    wCtx.fillText(`φ = ${phiDeg}°`, W / 2, 16);
  }
}

// ─────────────────────────────────────────────
//  DIBUJAR FASOR
// ─────────────────────────────────────────────
function drawPhasor(t) {
  const W = phasorCanvas.width;
  const H = phasorCanvas.height;
  const cx = W / 2;
  const cy = H / 2;
  const maxR = Math.min(cx, cy) - 20;
  const { Vp, Ip, omega, phi } = circuit;

  pCtx.clearRect(0, 0, W, H);

  // Círculo guía
  pCtx.strokeStyle = C_GRID;
  pCtx.lineWidth = 0.8;
  pCtx.beginPath();
  pCtx.arc(cx, cy, maxR, 0, Math.PI * 2);
  pCtx.stroke();

  // Ejes
  pCtx.strokeStyle = C_AXIS;
  pCtx.lineWidth = 1;
  pCtx.beginPath(); pCtx.moveTo(0, cy); pCtx.lineTo(W, cy); pCtx.stroke();
  pCtx.beginPath(); pCtx.moveTo(cx, 0); pCtx.lineTo(cx, H); pCtx.stroke();

  const angleV = -t * omega;          // voltaje gira con el tiempo
  const angleI = angleV + phi;        // corriente desfasada

  const scaleV = maxR / Vp;
  const scaleI = maxR / Ip;

  // ── Fasor Voltaje ──────────────────────────
  const vx = cx + Math.cos(angleV) * Vp * scaleV;
  const vy = cy + Math.sin(angleV) * Vp * scaleV;
  drawArrow(pCtx, cx, cy, vx, vy, C_V, 'V');

  // ── Fasor Corriente ────────────────────────
  const ix = cx + Math.cos(angleI) * Ip * scaleI;
  const iy = cy + Math.sin(angleI) * Ip * scaleI;
  drawArrow(pCtx, cx, cy, ix, iy, C_I, 'I');

  // Ángulo φ arco
  if (Math.abs(phi) > 0.01) {
    pCtx.strokeStyle = '#ffffff44';
    pCtx.lineWidth = 1;
    pCtx.beginPath();
    pCtx.arc(cx, cy, 28, angleV + Math.PI * 2, angleI + Math.PI * 2, phi < 0);
    pCtx.stroke();
  }

  // Etiquetas
  pCtx.fillStyle = C_TEXT;
  pCtx.font = '10px Share Tech Mono, monospace';
  pCtx.fillText('Re', W - 20, cy - 6);
  pCtx.fillText('Im', cx + 6, 12);
}

function drawArrow(ctx, x1, y1, x2, y2, color, label) {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const len   = Math.hypot(x2 - x1, y2 - y1);

  ctx.strokeStyle = color;
  ctx.lineWidth   = 2.5;
  ctx.shadowColor = color;
  ctx.shadowBlur  = 10;

  // Línea
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();

  // Punta de flecha
  const aLen = 10, aAngle = 0.4;
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - aLen * Math.cos(angle - aAngle), y2 - aLen * Math.sin(angle - aAngle));
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - aLen * Math.cos(angle + aAngle), y2 - aLen * Math.sin(angle + aAngle));
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Label
  ctx.fillStyle = color;
  ctx.font = 'bold 12px Rajdhani, sans-serif';
  ctx.fillText(label, x2 + 6, y2 - 6);
}

// ─────────────────────────────────────────────
//  LOOP DE ANIMACIÓN
// ─────────────────────────────────────────────
function animate(timestamp) {
  if (!running) { lastTime = null; animId = null; return; }

  if (lastTime === null) lastTime = timestamp;
  const dt = (timestamp - lastTime) / 1000;   // segundos
  lastTime = timestamp;

  timeOffset += dt*speedAnimation;

  drawWaves(timeOffset);
  drawPhasor(timeOffset);

  animId = requestAnimationFrame(animate);
}

function startAnim() {
  if (animId) return;
  lastTime = null;
  animId   = requestAnimationFrame(animate);
}

// ─────────────────────────────────────────────
//  EVENTOS
// ─────────────────────────────────────────────
['voltage','freq','resistance','inductance','capacitance'].forEach(id => {
  document.getElementById(id).addEventListener('input', calcCircuit);
  const unit = document.getElementById(id + 'Unit');
  if (unit) unit.addEventListener('change', calcCircuit);
});

btnPlay.addEventListener('click', () => {
  running = !running;
  btnPlay.textContent = running ? '⏸ Pausar' : '▶ Reanudar';
  if (running) startAnim();
});

btnReset.addEventListener('click', () => {
  resetearFormulario();
  timeOffset = 0;
  lastTime   = null;
  btnPlay.innerText = '▶ Iniciar';
  if (!running) {
    drawWaves(0);
    drawPhasor(0);
  }
  running = false;
  wCtx.clearRect(0, 0, waveCanvas.width, waveCanvas.height);
  pCtx.clearRect(0, 0, phasorCanvas.width, phasorCanvas.height);
  calcCircuit();

});

window.addEventListener('resize', () => {
  resizeCanvases();
  calcCircuit();
  if (!running) {
    drawWaves(timeOffset);
    drawPhasor(timeOffset);
  }
});

function resetearFormulario() {
  
    document.getElementById('speed').value = 0.05;
    document.getElementById('speedVal').textContent = 0.05;
    // 1. Resetear Valores de Voltaje
    document.getElementById('voltage').value = 120;
    document.getElementById('voltageUnit').value = "1";

    // 2. Resetear Frecuencia
    document.getElementById('freq').value = 10;
    document.getElementById('freqUnit').value = "1";

    // 3. Resetear Resistencia
    document.getElementById('resistance').value = 100;
    document.getElementById('resistanceUnit').value = "1";

    // 4. Resetear Inductancia
    document.getElementById('inductance').value = 1;
    document.getElementById('inductanceUnit').value = "1";

    // 5. Resetear Capacitancia
    document.getElementById('capacitance').value = 1;
    document.getElementById('capacitanceUnit').value = "1";
}

document.getElementById('speed').addEventListener('input', () => {
  speedAnimation = +document.getElementById('speed').value;
  document.getElementById('speedVal').textContent = speedAnimation;
});

// ─────────────────────────────────────────────
//  INICIO
// ─────────────────────────────────────────────
window.addEventListener('load', () => {
  resizeCanvases();
  calcCircuit();
  startAnim();
});