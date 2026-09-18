/**
 * B.Braun Perfusor Space Style Syringe Driver Simulator
 * Editable drug, concentration, and dosing parameters
 */
(function () {
  "use strict";

  window.SyringeSimulator = {
    state: {
      running: false,
      paused: false,
      rate: 2.0,
      volume: 50,
      delivered: 0,
      startTime: null,
      pauseTime: null,
      totalPausedTime: 0,
      drug: "Morphine",
      concentration: "10",
      concentrationUnit: "mg/mL",
      occlusion: false,
      batteryLevel: 100
    },

    init: function (canvasId, controlsId) {
      this.canvas = document.getElementById(canvasId);
      this.ctx = this.canvas.getContext("2d");
      this.controls = document.getElementById(controlsId);
      this.setupControls();
      this.draw();
    },

    setupControls: function () {
      var self = this;
      var html = '<div class="simulator-container">';
      
      // B.Braun style header
      html += '<div class="simulator-header">';
      html += '<div class="simulator-brand">B.BRAUN</div>';
      html += '<div class="simulator-model">Perfusor® Space Syringe Pump Simulator</div>';
      html += '</div>';
      
      // Main display
      html += '<div class="pump-display">';
      html += '<div class="display-row"><span class="label">Drug:</span><span id="simDrugDisplay" class="value">Morphine</span></div>';
      html += '<div class="display-row"><span class="label">Conc:</span><span id="simConcDisplay" class="value">10 mg/mL</span></div>';
      html += '<div class="display-row highlight"><span class="label">Rate:</span><span id="simRateDisplay" class="value-large">2.0 mL/h</span></div>';
      html += '<div class="display-row"><span class="label">Delivered:</span><span id="simDelivered" class="value">0.00 mL</span></div>';
      html += '<div class="display-row"><span class="label">Remaining:</span><span id="simRemaining" class="value">50.00 mL</span></div>';
      html += '<div class="display-row"><span class="label">Time:</span><span id="simTime" class="value">00:00:00</span></div>';
      html += '<div class="display-row"><span class="label">Status:</span><span id="simStatus" class="value-status">READY</span></div>';
      html += '<div class="display-row"><span class="label">Battery:</span><span id="simBattery" class="value">100%</span></div>';
      html += '<div class="display-row calc-dose"><span class="label">Dose:</span><span id="simCalcDose" class="value">--</span></div>';
      html += '</div>';
      
      // Control panel
      html += '<div class="control-panel">';
      html += '<div class="control-section">';
      html += '<div class="control-title">DRUG SETTINGS</div>';
      html += '<div class="control-row">';
      html += '<label>Drug Name:</label>';
      html += '<input type="text" id="simDrugName" value="Morphine" placeholder="Enter drug name" />';
      html += '</div>';
      html += '<div class="control-row">';
      html += '<label>Concentration:</label>';
      html += '<input type="number" id="simConcentration" value="10" min="0.1" step="0.1" />';
      html += '<select id="simConcentrationUnit">';
      html += '<option value="mg/mL">mg/mL</option>';
      html += '<option value="mcg/mL">mcg/mL</option>';
      html += '<option value="units/mL">units/mL</option>';
      html += '<option value="%">%</option>';
      html += '</select>';
      html += '</div>';
      html += '</div>';
      
      html += '<div class="control-section">';
      html += '<div class="control-title">INFUSION PARAMETERS</div>';
      html += '<div class="control-row">';
      html += '<label>Rate (mL/h):</label>';
      html += '<input type="number" id="simRate" value="2.0" min="0.1" max="50" step="0.1" />';
      html += '</div>';
      html += '<div class="control-row">';
      html += '<label>Weight-based (mcg/kg/min):</label>';
      html += '<input type="number" id="simWeightBased" placeholder="Optional" step="0.1" />';
      html += '</div>';
      html += '<div class="control-row">';
      html += '<label>Patient Weight (kg):</label>';
      html += '<input type="number" id="simWeight" value="70" min="1" max="200" />';
      html += '</div>';
      html += '<div class="control-row">';
      html += '<label>Syringe Volume (mL):</label>';
      html += '<input type="number" id="simVolume" value="50" min="5" max="60" step="5" />';
      html += '</div>';
      html += '</div>';
      
      // Buttons
      html += '<div class="button-panel">';
      html += '<button id="simStart" class="pump-btn pump-btn-start">▶ START</button>';
      html += '<button id="simPause" class="pump-btn pump-btn-pause" disabled>⏸ PAUSE</button>';
      html += '<button id="simStop" class="pump-btn pump-btn-stop" disabled>⏹ STOP</button>';
      html += '<button id="simOcclusion" class="pump-btn pump-btn-alarm">⚠ OCCLUSION</button>';
      html += '</div>';
      
      html += '</div>'; // control-panel
      html += '</div>'; // simulator-container

      this.controls.innerHTML = html;

      // Event listeners
      document.getElementById("simDrugName").addEventListener("input", function (e) {
        self.state.drug = e.target.value || "Unknown";
        self.updateDisplay();
        self.draw();
      });

      document.getElementById("simConcentration").addEventListener("input", function (e) {
        self.state.concentration = e.target.value;
        self.updateCalculatedDose();
        self.updateDisplay();
      });

      document.getElementById("simConcentrationUnit").addEventListener("change", function (e) {
        self.state.concentrationUnit = e.target.value;
        self.updateCalculatedDose();
        self.updateDisplay();
      });

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

      document.getElementById("simWeight").addEventListener("input", function () {
        self.updateCalculatedDose();
      });

      document.getElementById("simRate").addEventListener("input", function (e) {
        self.state.rate = parseFloat(e.target.value) || 0.1;
        self.updateCalculatedDose();
        self.updateDisplay();
      });

      document.getElementById("simVolume").addEventListener("input", function (e) {
        if (!self.state.running) {
          self.state.volume = parseFloat(e.target.value) || 50;
          self.updateDisplay();
          self.draw();
        }
      });

      document.getElementById("simStart").addEventListener("click", function () {
        self.start();
      });

      document.getElementById("simPause").addEventListener("click", function () {
        self.pause();
      });

      document.getElementById("simStop").addEventListener("click", function () {
        self.stop();
      });

      document.getElementById("simOcclusion").addEventListener("click", function () {
        self.simulateOcclusion();
      });

      this.updateCalculatedDose();
    },

    updateCalculatedDose: function () {
      var conc = parseFloat(this.state.concentration) || 0;
      var rate = this.state.rate || 0;
      var unit = this.state.concentrationUnit;
      var weight = parseFloat(document.getElementById("simWeight").value) || 70;
      
      var doseRate = 0;
      var doseUnit = "";
      
      if (conc > 0 && rate > 0) {
        if (unit === "mg/mL") {
          doseRate = rate * conc;
          doseUnit = "mg/h";
        } else if (unit === "mcg/mL") {
          doseRate = rate * conc;
          doseUnit = "mcg/h";
        } else if (unit === "units/mL") {
          doseRate = rate * conc;
          doseUnit = "units/h";
        }
        
        var mcgkgmin = (doseRate * 1000) / (weight * 60);
        document.getElementById("simCalcDose").textContent = 
          doseRate.toFixed(2) + " " + doseUnit + " (" + mcgkgmin.toFixed(2) + " mcg/kg/min)";
      }
    },

    updateDisplay: function () {
      document.getElementById("simDrugDisplay").textContent = this.state.drug;
      document.getElementById("simConcDisplay").textContent = this.state.concentration + " " + this.state.concentrationUnit;
      document.getElementById("simDelivered").textContent = this.state.delivered.toFixed(2) + " mL";
      document.getElementById("simRemaining").textContent = (this.state.volume - this.state.delivered).toFixed(2) + " mL";
      document.getElementById("simRateDisplay").textContent = this.state.rate.toFixed(1) + " mL/h";
      document.getElementById("simBattery").textContent = this.state.batteryLevel + "%";
    },

    start: function () {
      if (this.state.delivered >= this.state.volume) {
        this.stop();
        return;
      }
      this.state.running = true;
      this.state.paused = false;
      if (!this.state.startTime) {
        this.state.startTime = Date.now();
      } else {
        this.state.startTime = Date.now() - (this.state.delivered / this.state.rate * 3600000);
      }
      document.getElementById("simStart").disabled = true;
      document.getElementById("simPause").disabled = false;
      document.getElementById("simStop").disabled = false;
      document.getElementById("simRate").disabled = true;
      document.getElementById("simVolume").disabled = true;
      document.getElementById("simStatus").textContent = this.state.occlusion ? "OCCLUSION ALARM" : "INFUSING";
      document.getElementById("simStatus").style.color = this.state.occlusion ? "#ff0000" : "#00ff88";
      this.run();
    },

    pause: function () {
      this.state.paused = true;
      this.state.running = false;
      this.state.pauseTime = Date.now();
      document.getElementById("simStart").disabled = false;
      document.getElementById("simPause").disabled = true;
      document.getElementById("simStatus").textContent = "PAUSED";
      document.getElementById("simStatus").style.color = "#ffd700";
    },

    stop: function () {
      this.state.running = false;
      this.state.paused = false;
      this.state.delivered = 0;
      this.state.startTime = null;
      this.state.pauseTime = null;
      this.state.totalPausedTime = 0;
      this.state.occlusion = false;
      document.getElementById("simStart").disabled = false;
      document.getElementById("simPause").disabled = true;
      document.getElementById("simStop").disabled = true;
      document.getElementById("simRate").disabled = false;
      document.getElementById("simVolume").disabled = false;
      document.getElementById("simStatus").textContent = "READY";
      document.getElementById("simStatus").style.color = "#00ff88";
      this.updateDisplay();
      this.draw();
    },

    simulateOcclusion: function () {
      this.state.occlusion = true;
      this.state.running = false;
      this.state.paused = true;
      document.getElementById("simStatus").textContent = "OCCLUSION ALARM";
      document.getElementById("simStatus").style.color = "#ff0000";
      this.draw();
    },

    run: function () {
      if (!this.state.running || this.state.occlusion) return;
      
      var now = Date.now();
      var elapsed = (now - this.state.startTime - this.state.totalPausedTime) / 1000;
      var mlDelivered = (elapsed / 3600) * this.state.rate;
      
      this.state.delivered = Math.min(mlDelivered, this.state.volume);
      
      var hours = Math.floor(elapsed / 3600);
      var mins = Math.floor((elapsed % 3600) / 60);
      var secs = Math.floor(elapsed % 60);
      document.getElementById("simTime").textContent = 
        String(hours).padStart(2, "0") + ":" + 
        String(mins).padStart(2, "0") + ":" + 
        String(secs).padStart(2, "0");
      
      this.updateDisplay();
      this.draw();
      
      if (this.state.delivered >= this.state.volume) {
        this.state.running = false;
        document.getElementById("simStatus").textContent = "COMPLETE";
        document.getElementById("simStatus").style.color = "#00ff88";
        document.getElementById("simStart").disabled = false;
        document.getElementById("simPause").disabled = true;
      } else {
        requestAnimationFrame(function () { window.SyringeSimulator.run(); });
      }
    },

    draw: function () {
      var ctx = this.ctx;
      var w = this.canvas.width;
      var h = this.canvas.height;
      
      ctx.clearRect(0, 0, w, h);
      
      // Background
      ctx.fillStyle = "#1a1a2e";
      ctx.fillRect(0, 0, w, h);
      
      // Syringe barrel
      var barrelX = w * 0.2;
      var barrelY = h * 0.15;
      var barrelW = w * 0.6;
      var barrelH = h * 0.4;
      
      ctx.strokeStyle = "#00ff88";
      ctx.lineWidth = 3;
      ctx.strokeRect(barrelX, barrelY, barrelW, barrelH);
      
      // Fluid level
      var fluidPercent = 1 - (this.state.delivered / this.state.volume);
      var fluidH = barrelH * fluidPercent;
      var gradient = ctx.createLinearGradient(0, barrelY + barrelH - fluidH, 0, barrelY + barrelH);
      gradient.addColorStop(0, "#00ff88");
      gradient.addColorStop(1, "#00cc6a");
      ctx.fillStyle = gradient;
      ctx.fillRect(barrelX + 2, barrelY + barrelH - fluidH, barrelW - 4, fluidH - 2);
      
      // Volume markings
      ctx.fillStyle = "#00ff88";
      ctx.font = "12px monospace";
      for (var i = 0; i <= 10; i++) {
        var markY = barrelY + (barrelH / 10) * i;
        ctx.fillRect(barrelX - 10, markY, 8, 1);
        if (i % 2 === 0) {
          var markVol = this.state.volume * (1 - i / 10);
          ctx.fillText(Math.round(markVol) + "mL", barrelX - 45, markY + 4);
        }
      }
      
      // Plunger
      var plungerPos = barrelY + barrelH * (1 - fluidPercent);
      ctx.fillStyle = "#00cc6a";
      ctx.fillRect(barrelX + 10, plungerPos - 10, barrelW - 20, 10);
      ctx.fillRect(barrelX + barrelW * 0.5, plungerPos - 30, 8, 30);
      
      // Syringe tip
      ctx.fillStyle = "#00ff88";
      ctx.beginPath();
      ctx.moveTo(barrelX + barrelW * 0.45, barrelY + barrelH);
      ctx.lineTo(barrelX + barrelW * 0.55, barrelY + barrelH);
      ctx.lineTo(barrelX + barrelW * 0.55, barrelY + barrelH + 30);
      ctx.lineTo(barrelX + barrelW * 0.5, barrelY + barrelH + 40);
      ctx.lineTo(barrelX + barrelW * 0.45, barrelY + barrelH + 30);
      ctx.closePath();
      ctx.fill();
      
      // Catheter line
      ctx.strokeStyle = "#00ff88";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(barrelX + barrelW * 0.5, barrelY + barrelH + 40);
      ctx.lineTo(barrelX + barrelW * 0.5, barrelY + barrelH + 80);
      ctx.stroke();
      
      // Alarm indicator
      if (this.state.occlusion) {
        ctx.fillStyle = "#ff0000";
        ctx.font = "bold 20px monospace";
        ctx.textAlign = "center";
        ctx.fillText("⚠ OCCLUSION ALARM", w / 2, h * 0.85);
      }
      
      // Drug name display
      ctx.fillStyle = "#00ff88";
      ctx.font = "bold 14px monospace";
      ctx.textAlign = "center";
      ctx.fillText(this.state.drug + " @ " + this.state.concentration + " " + this.state.concentrationUnit, w / 2, 25);
    }
  };
})();
