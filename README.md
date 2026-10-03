# ARCShield — SMART CONNECTED SAFETY GEAR
## Desktop-First Industrial Supervisor Safety Console (MERN Stack)

**ArcShield** is a professional, **Light-Themed Web Application** engineered for workshop supervisors, trainers, safety administrators, and training-centre managers in electrical and welding industrial training environments (ITIs).

---

### 🌟 Design & Architectural Principles

1. **Light Theme Only**:
   - Clean, bright white surface (`#ffffff`) on a soft neutral light-slate page background (`#f8fafc`).
   - Deep navy/professional blue (`#0f294a`) for primary navigation, headings, and active state cues.
   - Restrained 2–3 color palette with strict safety state badges (`SAFE` green, `WARNING` amber, `CRITICAL` red, `OFFLINE` gray).
   - Zero AI gimmicks, no purple gradients, no glowing borders, no glassmorphism.

2. **Complete Hardware Abstraction (No Component Details Exposed)**:
   - The supervisor console communicates **operational safety results**, never raw chip names, pin numbers, or ADC values.
   - `Temperature (°C)`, `Humidity (%)`, `UV / Arc Exposure (Normal / Elevated / High)`, `Gas Exposure (Normal / Elevated / High)`, `Motion & Fall Status`, `Helmet Wearing Compliance (%)`, `Workshop Zone`, and `Connection Status`.

3. **Desktop-First Web Architecture**:
   - Tailored for control room monitors, desktop displays, and supervisor laptops.
   - Built with the full MERN stack (MongoDB, Express, React, Node.js) with real-time Socket.IO synchronization.

---

### 📂 Main Application Navigation

```text
ArcShield
├── 1. Overview (KPI Summary, Active Hazard Banner, Alert Frequency Chart, Incident Distribution, Zone Status)
├── 2. Live Monitoring (Dense Operational Telemetry Table with Temp, Humidity, UV/Arc, Gas, Motion, Helmet Worn)
├── 3. Alerts (Lifecycle: ACTIVE → ACKNOWLEDGED → INVESTIGATING → RESOLVED with Note Logging)
├── 4. Helmets / Workers (Searchable Directory with Compliance Scores, Active Zones, and Worker Profile Drawer)
├── 5. Incidents & Near-Misses (Formal Separation of Hazardous Incidents vs Preventive Near-Misses)
├── 6. Analytics (Recharts Visualizations: Hourly Trends, Category Distribution, Compliance Curves, Response Times)
├── 7. Reports (Daily/Weekly Audits, Incident Histories, CSV Export, and Official Printable PDF Generator)
└── 8. Settings (Shift Schedules, Facility Configuration, Exposure Thresholds, Notification Dispatch)
```

---

### 🚀 Running the Application Locally

#### Backend Server (Node.js + Express + Socket.IO + MongoDB Support):
```bash
cd server
npm install
node src/server.js
# API listening at http://localhost:5000
```

#### Frontend Dashboard (React + Vite + Recharts + Tailwind):
```bash
cd client
npm install
npm run dev -- --port 3000
# Web Application accessible at http://localhost:3000
```
