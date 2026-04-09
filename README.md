# ⚡ SimulAC — Simulador de Circuito RLC en Corriente Alterna

Simulador web interactivo de circuitos RLC serie en corriente alterna. Permite ingresar valores reales con unidades configurables y visualizar en tiempo real las ondas de voltaje y corriente animadas, el diagrama fasorial y todos los parámetros calculados del circuito.

---

## 📸 Vista previa

<!-- Captura de pantalla general del simulador -->
![Vista general del simulador](screenshots/preview.png)

<!-- Captura de las ondas animadas -->
![Ondas de voltaje y corriente](screenshots/waves.png)

<!-- Captura del diagrama fasorial -->
![Diagrama fasorial](screenshots/phasor.png)

---

## 🗂 Estructura del proyecto

```
SimulAC/
├── index.html       # Estructura de la interfaz
├── style.css        # Estilos (tema oscuro industrial)
├── script.js        # Lógica de cálculo y animación
└── README.md        # Este archivo
```

---

## 🚀 Cómo usar

1. Clona o descarga el repositorio
2. Abre `index.html` directamente en tu navegador, o usa **Live Server** en VS Code para recarga automática
3. Ingresa los valores del circuito y selecciona las unidades
4. Observa las ondas animadas y los valores calculados en tiempo real

> No requiere instalación, servidor, ni dependencias externas.

---

## 🎛 Parámetros de entrada

| Parámetro | Unidades disponibles |
|---|---|
| Voltaje pico Vp | V, mV, kV |
| Frecuencia f | Hz, mHz, kHz |
| Resistencia R | Ω, mΩ, kΩ, MΩ |
| Inductancia L | H, mH, µH, nH |
| Capacitancia C | F, mF, µF, nF |
| Velocidad de animación | slider 0.01 – 0.5 |

---

## 📊 Valores calculados

- Reactancia inductiva **XL** (Ω)
- Reactancia capacitiva **XC** (Ω)
- Impedancia total **Z** (Ω)
- Corriente pico **Ip** (A)
- Corriente eficaz **Irms** (A)
- Ángulo de fase **φ** (°)
- Frecuencia de resonancia **f₀** (Hz)
- Factor de potencia **cos φ**

---

## 📈 Visualizaciones

### Ondas animadas
Las ondas de voltaje V(t) y corriente I(t) se dibujan a la misma escala visual normalizada. El desfase φ entre ellas es visible directamente. Un punto indica el valor instantáneo de cada onda.

### Diagrama fasorial
Los fasores de V e I giran en tiempo real. El arco entre ellos indica el ángulo de fase φ.

### Badge de tipo de circuito
Indica automáticamente si el circuito es:
- ⚡ **Resonante** — XL = XC, φ ≈ 0°
- ▲ **Inductivo** — XL > XC, V adelanta a I
- ▼ **Capacitivo** — XC > XL, I adelanta a V

---

## ⚙️ Controles

| Botón | Acción |
|---|---|
| ⏸ Pausar / ▶ Reanudar | Detiene o reanuda la animación |
| ↺ Reiniciar | Restaura valores por defecto y limpia las ondas |

---

## 🧮 Fórmulas utilizadas

```
ω  = 2π · f
XL = ω · L
XC = 1 / (ω · C)
Z  = √(R² + (XL - XC)²)
φ  = atan2(XL - XC, R)
Ip = Vp / Z
Irms = Ip / √2
f₀ = 1 / (2π · √(L · C))
fp = cos(φ)
```

---

## 🛠 Tecnologías

- HTML5 Canvas — animación de ondas y fasor
- CSS3 — tema oscuro con variables CSS
- JavaScript vanilla — cálculos y loop de animación con `requestAnimationFrame`
- Google Fonts — Share Tech Mono + Rajdhani

---

## 📝 Notas

- A frecuencias altas (> 60 Hz) las ondas se desplazan muy rápido; usa el slider de velocidad para reducirlo
- El circuito llega a resonancia cuando f = f₀, visible en los resultados calculados
- Cambiar L o C con XC muy grande puede parecer que no tiene efecto visual porque XC domina sobre XL; sube la frecuencia para equilibrarlos

---

## 👤 Autor

Desarrollado con fines educativos para visualización de circuitos en corriente alterna.
