/**
 * Interactive Syringe Driver Simulator
 * Drug and concentration fully editable
 */
(function () {
  "use strict";

  window.SyringeSimulator = {
    state: { running: false, paused: false, rate: 2.0, volume: 50, delivered: 0, startTime: null, pauseTime: null, totalPausedTime: 0, drug: "Morphine", concentration: "10", concentrationUnit: "mg/mL", occlusion: false, batteryLevel: 100 },

    init: function (canvasId, controlsId) {
      this.canvas = document.getElementById(canvasId);
      this.ctx = this.canvas.getContext("2d");
      this.controls = document.getElementById(controlsId);
      this.setupControls();
      this.draw();
    },

    setupControls: function () {
      var self = this;
      var html = '<div class="syringe-controls">';
      html += '<div class="control-group"><label>Drug Name: <input type="text" id="simDrugName" value="Morphine" placeholder="Enter drug name" /></label></div>';
      html += '<div class="control-group"><label>Concentration: <input type="number" id="simConcentration" value="10" min="0.1" step="0.1" /> ';
      html += '<select id="simConcentrationUnit"><option value="mg/mL">mg/mL</option><option value="mcg/mL">mcg/mL</option><option value="mg/L">mg/L</option><option value="%">%</option><option value="units/mL">units/mL</option></select></label></div>';
      html += '<div class="control-group"><label>Infusion Rate (mL/hour): <input type="number" id="simRate" min="0.1" max="50" step="0.1" value="2.0" /></label></div>';
      html += '<div class="control-group"><label>Infusion Rate (mcg/kg/min): <input type="number" id="simWeightBased" min="0.1" max="50" step="0.1" placeholder="Optional" /></label></div>';
      html += '<div class="control-group"><label>Patient Weight (kg): <input type="number" id="simWeight" value="70" min="1" max="200" /></label></div>';
      html += '<div class="control-group"><label>Syringe Volume (mL): <input type="number" id="simVolume" min="5" max="60" step="5" value="50" /></label></div>';
      html += '<div class="control-buttons">';
      html += '<button id="simStart" class="btn-sim btn-start">Start Infusion</button>';
      html += '<button id="simPause" class="btn-sim btn-pause" disabled>Pause</button>';
      html += '<button id="simStop" class="btn-sim btn-stop" disabled>Stop & Reset</button>';
      html += '<button id="simOcclusion" class="btn-sim btn-alarm">Simulate Occlusion</button></div>';
      html += '<div class="sim-display">';
      html += '<div class="display-item"><strong>Status:</strong> <span id="simStatus">Ready</span></div>';
      html += '<div class="display-item"><strong>Drug:</strong> <span id="simDrugDisplay">Morphine</span></div>';
      html += '<div class="display-item"><strong>Concentration:</strong> <span id="simConcDisplay">10 mg/mL</span></div>';
      html += '<div class="display-item"><strong>Delivered:</strong> <span id="simDelivered">0.00 mL</span></div>';
      html += '<div class="display-item"><strong>Remaining:</strong> <span id="simRemaining">50.00 mL</span></div>';
      html += '<div class="display-item"><strong>Rate:</strong> <span id="simRateDisplay">2.0 mL/hr</span></div>';
      html += '<div class="display-item"><strong>Time:</strong> <span id="simTime">00:00:00</span></div>';
      html += '<div class="display-item"><strong>Calculated Dose:</strong> <span id="simCalcDose">--</span></div></div></div>';

      this.controls.innerHTML = html;

      document.getElementById("simDrugName").addEventListener("input", function (e) { self.state.drug = e.target.value || "Unknown"; self.updateDisplay(); self.draw(); });
      document.getElementById("simConcentration").addEventListener("input", function (e) { self.state.concentration = e.target.value; self.updateCalculatedDose(); self.updateDisplay(); });
      document.getElementById("simConcentrationUnit").addEventListener("change", function (e) { self.state.concentrationUnit = e.target.value; self.updateCalculatedDose(); self.updateDisplay(); });
      document.getElementById("simWeightBased").addEventListener("input", function (e) {
        var mcgkgmin = parseFloat(e.target.value);
        var weight = parseFloat(document.getElementById("simWeight").value) || 70;
        var conc = parseFloat(self.state.concentration) || 1;
        if (mcgkgmin && weight && conc) {
          var mlhr = (mcgkgmin * weight * 60) / conc;
          document.getElementById("simRate").value = mlhr.toFixed(1);
          self.state.rate = mlhr;
          self.updateCalculatedDose();
        }
      });
      document.getElementById("simWeight").addEventListener("input", function () { self.updateCalculatedDose(); });
      document.getElementById("simRate").addEventListener("input", function (e) { self.state.rate = parseFloat(e.target.value) || 0.1; self.updateCalculatedDose(); self.updateDisplay(); });
      document.getElementById("simVolume").addEventListener("input", function (e) { if (!self.state.running) { self.state.volume = parseFloat(e.target.value) || 50; self.updateDisplay(); self.draw(); }});
      document.getElementById("simStart").addEventListener("click", function () { self.start(); });
      document.getElementById("simPause").addEventListener("click", function () { self.pause(); });
      document.getElementById("simStop").addEventListener("click", function () { self.stop(); });
      document.getElementById("simOcclusion").addEventListener("click", function () { self.simulateOcclusion(); });
      this.updateCalculatedDose();
    },

    updateCalculatedDose: function () {
      var conc = parseFloat(this.state.concentration) || 0;
      var rate = this.state.rate || 0;
      var unit = this.state.concentrationUnit;
      var weight = parseFloat(document.getElementById("simWeight").value) || 70;
      var doseRate = 0, doseUnit = "";
      if (conc > 0 && rate > 0) {
        if (unit === "mg/mL") { doseRate = rate * conc; doseUnit = "mg/hr"; }
        else if (unit === "mcg/mL") { doseRate = rate * conc; doseUnit = "mcg/hr"; }
        else if (unit === "units/mL") { doseRate = rate * conc; doseUnit = "units/hr"; }
        var mcgkgmin = (doseRate * 1000) / (weight * 60);
        document.getElementById("simCalcDose").textContent = doseRate.toFixed(2) + " " + doseUnit + " (" + mcgkgmin.toFixed(2) + " mcg/kg/min)";
      }
    },

    updateDisplay: function () {
      document.getElementById("simDrugDisplay").textContent = this.state.drug;
      document.getElementById("simConcDisplay").textContent = this.state.concentration + " " + this.state.concentrationUnit;
      document.getElementById("simDelivered").textContent = this.state.delivered.toFixed(2) + " mL";
      document.getElementById("simRemaining").textContent = (this.state.volume - this.state.delivered).toFixed(2) + " mL";
      document.getElementById("simRateDisplay").textContent = this.state.rate.toFixed(1) + " mL/hr";
    },

    start: function () {
      if (this.state.delivered >= this.state.volume) { this.stop(); return; }
      this.state.running = true; this.state.paused = false;
      if (!this.state.startTime) this.state.startTime = Date.now();
      else this.state.startTime = Date.now() - (this.state.delivered / this.state.rate * 3600000);
      document.getElementById("simStart").disabled = true;
      document.getElementById("simPause").disabled = false;
      document.getElementById("simStop").disabled = false;
      document.getElementById("simRate").disabled = true;
      document.getElementById("simVolume").disabled = true;
      document.getElementById("simStatus").textContent = this.state.occlusion ? "OCLUSION ALARM" : "Infusing";
      this.run();
    },

    pause: function () { this.state.paused = true; this.state.running = false; this.state.pauseTime = Date.now(); document.getElementById("simStart").disabled = false; document.getElementById("simPause").disabled = true; document.getElementById("simStatus").textContent = "Paused"; },
    stop: function () { this.state.running = false; this.state.paused = false; this.state.delivered = 0; this.state.startTime = null; this.state.pauseTime = null; this.state.totalPausedTime = 0; this.state.occlusion = false; document.getElementById("simStart").disabled = false; document.getElementById("simPause").disabled = true; document.getElementById("simStop").disabled = true; document.getElementById("simRate").disabled = false; document.getElementById("simVolume").disabled = false; document.getElementById("simStatus").textContent = "Ready"; this.updateDisplay(); this.draw(); },
    simulateOcclusion: function () { this.state.occlusion = true; this.state.running = false; this.state.paused = true; document.getElementById("simStatus").textContent = "OCLUSION ALARM"; document.getElementById("simStatus").style.color = "red"; this.draw(); },

    run: function () {
      if (!this.state.running || this.state.occlusion) return;
      var now = Date.now();
      var elapsed = (now - this.state.startTime - this.state.totalPausedTime) / 1000;
      var mlDelivered = (elapsed / 3600) * this.state.rate;
      this.state.delivered = Math.min(mlDelivered, this.state.volume);
      var h = Math.floor(elapsed / 3600), m = Math.floor((elapsed % 3600) / 60), s = Math.floor(elapsed % 60);
      document.getElementById("simTime").textContent = String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0");
      this.updateDisplay(); this.draw();
      if (this.state.delivered >= this.state.volume) { this.state.running = false; document.getElementById("simStatus").textContent = "Infusion Complete"; document.getElementById("simStart").disabled = false; document.getElementById("simPause").disabled = true; }
      else requestAnimationFrame(function () { window.SyringeSimulator.run(); });
    },

    draw: function () {
      var ctx = this.ctx, w = this.canvas.width, h = this.canvas.height;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "#f5f5f5"; ctx.fillRect(0, 0, w, h);
      var barrelX = w * 0.2, barrelY = h * 0.15, barrelW = w * 0.6, barrelH = h * 0.4;
      ctx.strokeStyle = "#333"; ctx.lineWidth = 3; ctx.strokeRect(barrelX, barrelY, barrelW, barrelH);
      var fluidPercent = 1 - (this.state.delivered / this.state.volume);
      var fluidH = barrelH * fluidPercent;
      var gradient = ctx.createLinearGradient(0, barrelY + barrelH - fluidH, 0, barrelY + barrelH);
      gradient.addColorStop(0, "#4a90d9"); gradient.addColorStop(1, "#7ab3e8");
      ctx.fillStyle = gradient; ctx.fillRect(barrelX + 2, barrelY + barrelH - fluidH, barrelW - 4, fluidH - 2);
      ctx.fillStyle = "#666"; ctx.font = "12px Arial";
      for (var i = 0; i <= 10; i++) { var markY = barrelY + (barrelH / 10) * i; ctx.fillRect(barrelX - 10, markY, 8, 1); if (i % 2 === 0) ctx.fillText(Math.round(this.state.volume * (1 - i / 10)) + "mL", barrelX - 45, markY + 4); }
      var plungerPos = barrelY + barrelH * (1 - fluidPercent);
      ctx.fillStyle = "#555"; ctx.fillRect(barrelX + 10, plungerPos - 10, barrelW - 20, 10); ctx.fillRect(barrelX + barrelW * 0.5, plungerPos - 30, 8, 30);
      ctx.fillStyle = "#777"; ctx.beginPath(); ctx.moveTo(barrelX + barrelW * 0.45, barrelY + barrelH); ctx.lineTo(barrelX + barrelW * 0.55, barrelY + barrelH); ctx.lineTo(barrelX + barrelW * 0.55, barrelY + barrelH + 30); ctx.lineTo(barrelX + barrelW * 0.5, barrelY + barrelH + 40); ctx.lineTo(barrelX + barrelW * 0.45, barrelY + barrelH + 30); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = "#4a90d9"; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(barrelX + barrelW * 0.5, barrelY + barrelH + 40); ctx.lineTo(barrelX + barrelW * 0.5, barrelY + barrelH + 80); ctx.stroke();
      if (this.state.occlusion) { ctx.fillStyle = "red"; ctx.font = "bold 24px Arial"; ctx.textAlign = "center"; ctx.fillText("⚠ OCCLUSION", w / 2, h * 0.85); }
      ctx.fillStyle = "#333"; ctx.font = "bold 16px Arial"; ctx.textAlign = "center"; ctx.fillText(this.state.drug + " @ " + this.state.concentration + " " + this.state.concentrationUnit, w / 2, 25);
    }
  };
})();
