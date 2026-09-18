/**
 * Interactive Drug Calculation Calculator
 * Real-time calculation with instant feedback and step-by-step solutions
 */
(function () {
  "use strict";

  window.DrugCalculator = {
    // Basic dose calculation: Volume = Dose / Concentration
    calculateVolume: function (dose, concentration, doseUnit, concUnit) {
      if (!dose || !concentration || dose <= 0 || concentration <= 0) {
        return { valid: false, error: "Please enter positive values for dose and concentration" };
      }

      // Convert to same unit if needed
      var doseInMg = this.convertToMg(dose, doseUnit);
      var concInMgPerMl = this.convertToMgPerMl(concentration, concUnit);

      if (!doseInMg || !concInMgPerMl) {
        return { valid: false, error: "Invalid unit conversion" };
      }

      var volume = doseInMg / concInMgPerMl;

      return {
        valid: true,
        volume: volume.toFixed(2),
        volumeUnit: "mL",
        steps: [
          "Step 1: Convert dose to mg: " + dose + " " + doseUnit + " = " + doseInMg.toFixed(2) + " mg",
          "Step 2: Convert concentration to mg/mL: " + concentration + " " + concUnit + " = " + concInMgPerMl.toFixed(2) + " mg/mL",
          "Step 3: Calculate volume: " + doseInMg.toFixed(2) + " mg ÷ " + concInMgPerMl.toFixed(2) + " mg/mL = " + volume.toFixed(2) + " mL"
        ]
      };
    },

    // Infusion rate calculation: mL/hour
    calculateInfusionRate: function (dose, doseUnit, timeUnit, drugAmount, drugUnit, totalVolume, volumeUnit) {
      if (!dose || !drugAmount || !totalVolume || dose <= 0 || drugAmount <= 0 || totalVolume <= 0) {
        return { valid: false, error: "Please enter positive values for all fields" };
      }

      // Convert dose to mg/hour
      var dosePerHour = this.convertDoseToMgPerHour(dose, doseUnit, timeUnit);
      var drugInMg = this.convertToMg(drugAmount, drugUnit);
      var volumeInMl = this.convertToMl(totalVolume, volumeUnit);

      if (!dosePerHour || !drugInMg || !volumeInMl) {
        return { valid: false, error: "Invalid unit conversion" };
      }

      // Concentration = drug amount / total volume
      var concentration = drugInMg / volumeInMl;
      
      // Infusion rate (mL/hour) = dose per hour / concentration
      var infusionRate = dosePerHour / concentration;

      return {
        valid: true,
        rate: infusionRate.toFixed(2),
        rateUnit: "mL/hour",
        concentration: concentration.toFixed(2),
        concentrationUnit: "mg/mL",
        steps: [
          "Step 1: Convert dose to mg/hour: " + dose + " " + doseUnit + "/" + timeUnit + " = " + dosePerHour.toFixed(2) + " mg/hour",
          "Step 2: Calculate concentration: " + drugInMg.toFixed(2) + " mg ÷ " + volumeInMl + " mL = " + concentration.toFixed(2) + " mg/mL",
          "Step 3: Calculate infusion rate: " + dosePerHour.toFixed(2) + " mg/hour ÷ " + concentration.toFixed(2) + " mg/mL = " + infusionRate.toFixed(2) + " mL/hour"
        ]
      };
    },

    // Weight-based infusion calculation
    calculateWeightBasedInfusion: function (dose, doseUnit, weight, drugAmount, drugUnit, totalVolume) {
      if (!dose || !weight || !drugAmount || !totalVolume || dose <= 0 || weight <= 0 || drugAmount <= 0 || totalVolume <= 0) {
        return { valid: false, error: "Please enter positive values for all fields" };
      }

      // Calculate total dose per minute
      var dosePerMin = dose * weight;
      var dosePerHour = dosePerMin * 60;

      // Convert to mg/hour if needed
      if (doseUnit === "mcg/kg/min") {
        dosePerHour = dosePerHour / 1000; // Convert mcg to mg
      }

      // Calculate concentration
      var drugInMg = this.convertToMg(drugAmount, drugUnit);
      var concentration = drugInMg / totalVolume;

      // Calculate infusion rate
      var infusionRate = dosePerHour / concentration;

      return {
        valid: true,
        rate: infusionRate.toFixed(2),
        rateUnit: "mL/hour",
        totalDosePerMin: dosePerMin.toFixed(2),
        totalDosePerHour: dosePerHour.toFixed(2),
        concentration: concentration.toFixed(2),
        steps: [
          "Step 1: Calculate total dose per minute: " + dose + " " + doseUnit + " × " + weight + " kg = " + dosePerMin.toFixed(2) + " " + (doseUnit.includes("mcg") ? "mcg" : "mg") + "/min",
          "Step 2: Convert to dose per hour: " + dosePerMin.toFixed(2) + " × 60 = " + dosePerHour.toFixed(2) + " mg/hour",
          "Step 3: Calculate concentration: " + drugInMg.toFixed(2) + " mg ÷ " + totalVolume + " mL = " + concentration.toFixed(2) + " mg/mL",
          "Step 4: Calculate infusion rate: " + dosePerHour.toFixed(2) + " mg/hour ÷ " + concentration.toFixed(2) + " mg/mL = " + infusionRate.toFixed(2) + " mL/hour"
        ]
      };
    },

    // Gravity drip calculation: gtt/min
    calculateGravityDrip: function (volume, volumeUnit, time, timeUnit, dropFactor) {
      if (!volume || !time || !dropFactor || volume <= 0 || time <= 0 || dropFactor <= 0) {
        return { valid: false, error: "Please enter positive values for all fields" };
      }

      // Convert to mL
      var volumeInMl = this.convertToMl(volume, volumeUnit);
      
      // Convert time to minutes
      var timeInMin = timeUnit === "hours" ? time * 60 : time;

      // Calculate drop rate: (volume × drop factor) ÷ time
      var dropRate = (volumeInMl * dropFactor) / timeInMin;

      return {
        valid: true,
        dropRate: Math.round(dropRate),
        dropRateUnit: "gtt/min",
        volumeInMl: volumeInMl,
        timeInMin: timeInMin,
        steps: [
          "Step 1: Volume = " + volumeInMl + " mL",
          "Step 2: Time = " + timeInMin + " minutes",
          "Step 3: Calculate drop rate: (" + volumeInMl + " mL × " + dropFactor + " gtt/mL) ÷ " + timeInMin + " min = " + dropRate.toFixed(1) + " gtt/min",
          "Step 4: Round to nearest whole number: " + Math.round(dropRate) + " gtt/min"
        ]
      };
    },

    // Helper: Convert to mg
    convertToMg: function (value, unit) {
      switch (unit) {
        case "mg": return value;
        case "mcg": return value / 1000;
        case "g": return value * 1000;
        case "units": return null; // Cannot convert units to mg
        default: return null;
      }
    },

    // Helper: Convert to mg/mL
    convertToMgPerMl: function (value, unit) {
      switch (unit) {
        case "mg/mL": return value;
        case "mcg/mL": return value / 1000;
        case "g/mL": return value * 1000;
        case "%": return value * 10; // 1% = 1g/100mL = 10mg/mL
        case "1:1000": return 1; // 1:1000 = 1mg/mL
        case "1:10000": return 0.1; // 1:10,000 = 0.1mg/mL
        default: return null;
      }
    },

    // Helper: Convert to mL
    convertToMl: function (value, unit) {
      switch (unit) {
        case "mL": return value;
        case "L": return value * 1000;
        default: return null;
      }
    },

    // Helper: Convert dose to mg/hour
    convertDoseToMgPerHour: function (dose, doseUnit, timeUnit) {
      var doseInMg = this.convertToMg(dose, doseUnit.split("/")[0]);
      if (!doseInMg) return null;

      switch (timeUnit) {
        case "hour": return doseInMg;
        case "min": return doseInMg * 60;
        default: return null;
      }
    }
  };
})();
