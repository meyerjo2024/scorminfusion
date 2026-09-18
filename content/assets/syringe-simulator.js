/**
 * Interactive Syringe Driver Simulator
 * Visual simulation of syringe infusion with real-time controls
 */
(function () {
  "use strict";

  window.SyringeSimulator = {
    state: {
      running: false,
      paused: false,
      rate: 2.0, // mL/hour
      volume: 50, // mL total capacity
      delivered: 0, // mL delivered
      startTime: null,
      pauseTime: null,
      totalPausedTime: 0,
      drug: "Morphine",
      concentration: "10 mg/mL",
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
      var html = '<div class="syringe-controls">';
      html += '<div class="control-group">';
      html += '<label>Drug: <select id="simDrug">';
      html += '<option value="Morphine|10 mg/mL">Morphine 10 mg/mL</option>';
      html += '<option value="Fentanyl|50 mcg/mL">Fentanyl 50 mcg/mL</option>';
      html += '<option value="Midazolam|5 mg/mL">Midazolam 5 mg/mL</option>';
      html += '<option value="Ketamine|50 mg/mL">Ketamine 50 mg/mL</option>';
      html += '</select></label>';
      html += '</div>';
      html += '<div class="control-group">';
      html += '<label>Infusion Rate (mL/hour): <input type="number" id="simRate" min="0.1" max="10" step="0.1" value="2.0" /></label>';
      html += '</div>';
      html += '<div class="control-group">';
      html += '<label>Syringe Volume (mL): <input type="number" id="simVolume" min="10" max="60" step="10" value="50" /></label>';
      html += '</div>';
      html += '<div class="control-buttons">';
      html += '<button id="simStart" class="btn-sim btn-start">Start Infusion</button>';
      html += '<button id="simPause" class="btn-sim btn-pause" disabled>Pause</button>';
      html += '<button id="simStop" class="btn-sim btn-stop" disabled>Stop & Reset</button>';
      html += '<button id="simOcclusion" class="btn-sim btn-alarm">Simulate Occlusion Alarm</button>';
      html += '</div>';
      html += '<div class="sim-display">';
      html += '<div class="display-item"><strong>Status:</strong> <span id="simStatus">Ready</span></div>';
      html += '<div class="display-item"><strong>Delivered:</strong> <span id="simDelivered">0.00 mL</span></div>';
      html += '<div class="display-item"><strong>Remaining:</strong> <span id="simRemaining">50.00 mL</span></div>';
      html += '<div class="display-item"><strong>Time Elapsed:</strong> <span id="simTime">00:00:00</span></div>';
      html += '<div class="display-item"><strong>Battery:</strong> <span id="simBattery">100%</span></div>';
      html += '</div>';
      html += '</div>';

      this.controls.innerHTML = html;

      // Event listeners
      document.getElementById("simDrug").addEventListener("change", function (e) {
        var parts = e.target.value.split("|");
        self.state.drug = parts[0];
        self.state.concentration = parts[1];
        self.draw();
      });

      document.getElementById("simRate").addEventListener("input", function (e) {
        self.state.rate = parseFloat(e.target.value) || 2.0;
      });

      document.getElementById("simVolume").addEventListener("input", function (e) {
        if (!self.state.running) {
          self.state.volume = parseFloat(e.target.value) || 50;
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
    },

    start: function () {
      if (this.state.running && !this.state.paused) return;

      if (this.state.paused) {
        // Resume from pause
        this.state.paused = false;
        this.state.totalPausedTime += (Date.now() - this.state.pauseTime);
      } else {
        // Fresh start
        this.state.running = true;
        this.state.startTime = Date.now();
        this.state.delivered = 0;
        this.state.totalPausedTime = 0;
      }

      this.state.occlusion = false;
      this.updateControls();
      this.updateDisplay();
      this.animate();
    },

    pause: function () {
      if (!this.state.running || this.state.paused) return;
      this.state.paused = true;
      this.state.pauseTime = Date.now();
      this.updateControls();
      this.updateDisplay();
    },

    stop: function () {
      this.state.running = false;
      this.state.paused = false;
      this.state.delivered = 0;
      this.state.occlusion = false;
      this.updateControls();
      this.updateDisplay();
      this.draw();
    },

    simulateOcclusion: function () {
      if (!this.state.running) {
        alert("Start the infusion first to simulate an occlusion alarm.");
        return;
      }
      this.state.occlusion = true;
      this.state.paused = true;
      this.state.pauseTime = Date.now();
      this.updateDisplay();
      alert("⚠️ OCCLUSION ALARM!\n\nPossible causes:\n• Kinked IV line\n• Closed roller clamp\n• Thrombus in cannula\n• Extravasation\n\nAction: Check line patency, flush cannula, re-site if needed.");
    },

    animate: function () {
      if (!this.state.running || this.state.paused) return;

      var elapsed = Date.now() - this.state.startTime - this.state.totalPausedTime;
      var hours = elapsed / (1000 * 60 * 60);
      var delivered = this.state.rate * hours;

      if (delivered >= this.state.volume) {
        delivered = this.state.volume;
        this.state.running = false;
        alert("✅ INFUSION COMPLETE\n\n" + this.state.volume + " mL of " + this.state.drug + " delivered.");
      }

      this.state.delivered = delivered;
      
      // Simulate battery drain (0.01% per minute of infusion)
      this.state.batteryLevel = Math.max(0, 100 - (hours * 60 * 0.01));

      this.draw();
      this.updateDisplay();

      if (this.state.running) {
        requestAnimationFrame(this.animate.bind(this));
      }
    },

    draw: function () {
      var ctx = this.ctx;
      var canvas = this.canvas;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw syringe barrel
      var syringeX = 100;
      var syringeY = 50;
      var syringeWidth = 300;
      var syringeHeight = 60;

      // Barrel outline
      ctx.strokeStyle = "#333";
      ctx.lineWidth = 3;
      ctx.fillStyle = "#f0f0f0";
      ctx.fillRect(syringeX, syringeY, syringeWidth, syringeHeight);
      ctx.strokeRect(syringeX, syringeY, syringeWidth, syringeHeight);

      // Plunger
      var percentDelivered = this.state.delivered / this.state.volume;
      var plungerX = syringeX + (syringeWidth * percentDelivered);
      ctx.fillStyle = "#2a5298";
      ctx.fillRect(syringeX, syringeY, plungerX - syringeX, syringeHeight);

      // Medication (remaining)
      ctx.fillStyle = "rgba(100, 150, 255, 0.6)";
      ctx.fillRect(plungerX, syringeY + 2, syringeX + syringeWidth - plungerX - 2, syringeHeight - 4);

      // Plunger head
      ctx.fillStyle = "#1e3c72";
      ctx.fillRect(plungerX - 5, syringeY - 10, 10, syringeHeight + 20);

      // Nozzle
      ctx.fillStyle = "#666";
      ctx.fillRect(syringeX + syringeWidth, syringeY + 20, 30, 20);

      // Volume markings
      ctx.fillStyle = "#333";
      ctx.font = "12px Arial";
      for (var i = 0; i <= 5; i++) {
        var x = syringeX + (syringeWidth * i / 5);
        ctx.fillText((this.state.volume * i / 5).toFixed(0) + " mL", x - 10, syringeY + syringeHeight + 20);
        ctx.strokeStyle = "#999";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, syringeY + syringeHeight);
        ctx.lineTo(x, syringeY + syringeHeight + 5);
        ctx.stroke();
      }

      // Drug label
      ctx.font = "bold 14px Arial";
      ctx.fillStyle = "#1e3c72";
      ctx.fillText(this.state.drug + " (" + this.state.concentration + ")", syringeX, syringeY - 10);

      // Status indicator
      var statusX = 450;
      var statusY = 50;
      if (this.state.occlusion) {
        ctx.fillStyle = "#d32f2f";
        ctx.fillRect(statusX, statusY, 30, 30);
        ctx.fillStyle = "#fff";
        ctx.font = "bold 20px Arial";
        ctx.fillText("!", statusX + 10, statusY + 22);
        ctx.fillStyle = "#d32f2f";
        ctx.font = "12px Arial";
        ctx.fillText("OCCLUSION", statusX - 10, statusY + 50);
      } else if (this.state.running && !this.state.paused) {
        ctx.fillStyle = "#4caf50";
        ctx.fillRect(statusX, statusY, 30, 30);
        ctx.fillStyle = "#fff";
        ctx.font = "bold 16px Arial";
        ctx.fillText("▶", statusX + 8, statusY + 22);
        ctx.fillStyle = "#4caf50";
        ctx.font = "12px Arial";
        ctx.fillText("RUNNING", statusX - 5, statusY + 50);
      } else if (this.state.paused) {
        ctx.fillStyle = "#ff9800";
        ctx.fillRect(statusX, statusY, 30, 30);
        ctx.fillStyle = "#fff";
        ctx.font = "bold 16px Arial";
        ctx.fillText("❚❚", statusX + 6, statusY + 22);
        ctx.fillStyle = "#ff9800";
        ctx.font = "12px Arial";
        ctx.fillText("PAUSED", statusX, statusY + 50);
      } else {
        ctx.fillStyle = "#9e9e9e";
        ctx.fillRect(statusX, statusY, 30, 30);
        ctx.fillStyle = "#fff";
        ctx.font = "bold 16px Arial";
        ctx.fillText("◼", statusX + 8, statusY + 22);
        ctx.fillStyle = "#9e9e9e";
        ctx.font = "12px Arial";
        ctx.fillText("READY", statusX + 3, statusY + 50);
      }

      // Rate display
      ctx.fillStyle = "#333";
      ctx.font = "bold 16px Arial";
      ctx.fillText("Rate: " + this.state.rate.toFixed(1) + " mL/hour", syringeX, syringeY + syringeHeight + 50);

      // Battery indicator
      var batteryX = 450;
      var batteryY = 100;
      ctx.strokeStyle = "#333";
      ctx.lineWidth = 2;
      ctx.strokeRect(batteryX, batteryY, 40, 20);
      ctx.fillRect(batteryX + 40, batteryY + 6, 5, 8);
      
      var batteryColor = this.state.batteryLevel > 50 ? "#4caf50" : this.state.batteryLevel > 20 ? "#ff9800" : "#d32f2f";
      ctx.fillStyle = batteryColor;
      ctx.fillRect(batteryX + 2, batteryY + 2, (36 * this.state.batteryLevel / 100), 16);
    },

    updateControls: function () {
      document.getElementById("simStart").disabled = this.state.running && !this.state.paused;
      document.getElementById("simPause").disabled = !this.state.running || this.state.paused;
      document.getElementById("simStop").disabled = !this.state.running;
      document.getElementById("simVolume").disabled = this.state.running;
    },

    updateDisplay: function () {
      var statusText = "Ready";
      if (this.state.occlusion) statusText = "⚠️ OCCLUSION ALARM";
      else if (this.state.paused) statusText = "Paused";
      else if (this.state.running) statusText = "Running";
      else if (this.state.delivered >= this.state.volume) statusText = "Complete";

      document.getElementById("simStatus").textContent = statusText;
      document.getElementById("simDelivered").textContent = this.state.delivered.toFixed(2) + " mL";
      document.getElementById("simRemaining").textContent = (this.state.volume - this.state.delivered).toFixed(2) + " mL";
      document.getElementById("simBattery").textContent = this.state.batteryLevel.toFixed(0) + "%";

      if (this.state.running || this.state.paused) {
        var elapsed = Date.now() - this.state.startTime - this.state.totalPausedTime;
        var hours = Math.floor(elapsed / (1000 * 60 * 60));
        var minutes = Math.floor((elapsed % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((elapsed % (1000 * 60)) / 1000);
        document.getElementById("simTime").textContent = 
          (hours < 10 ? "0" : "") + hours + ":" +
          (minutes < 10 ? "0" : "") + minutes + ":" +
          (seconds < 10 ? "0" : "") + seconds;
      } else {
        document.getElementById("simTime").textContent = "00:00:00";
      }
    }
  };
})();
