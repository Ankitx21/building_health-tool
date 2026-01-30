/*************************************************
 * CONSTANTS
 *************************************************/
const ASSURE_EPI_TARGET = 75;
const DEFAULT_SPECIFIC_YIELD = 1500;
const NBC_LPCD = 45;
const MISSING_RESULT_TEXT = "Result not available due to missing input(s).";
const COLD_CLIMATE_MESSAGE ="BEE star ratings are not defined for cold climate zones due to insufficient benchmark data.";


/*************************************************
 * BEE STAR RATING EQUATIONS (SAMPLE – WORKING)
 * Replace with official BEE equations later
 *************************************************/
const beeEquations = {
  "Composite": {
    "Large": {
      "5Star": { a: 0.75, c: 20 },
      "4Star": { a: 0.80, c: 30 },
      "3Star": { a: 0.85, c: 40 },
      "2Star": { a: 0.90, c: 50 },
      "1Star": { a: 0.95, c: 60 }
    },
    "Medium": {
      "5Star": { a: 0.9, c: 20 },
      "4Star": { a: 0.95, c: 30 },
      "3Star": { a: 1.0, c: 40 },
      "2Star": { a: 1.05, c: 50 },
      "1Star": { a: 1.1, c: 60 }
    },
    "Small": {
      "5Star": { a: 0.45, c: 20 },
      "4Star": { a: 0.5, c: 30 },
      "3Star": { a: 0.55, c: 40 },
      "2Star": { a: 0.6, c: 50 },
      "1Star": { a: 0.65, c: 60 }
    }
  },

  "Warm & Humid": {
    "Large": {
      "5Star": { a: 0.7, c: 25 },
      "4Star": { a: 0.75, c: 35 },
      "3Star": { a: 0.8, c: 45 },
      "2Star": { a: 0.85, c: 55 },
      "1Star": { a: 0.9, c: 65 }
    },
    "Medium": {
      "5Star": { a: 0.7, c: 25 },
      "4Star": { a: 0.75, c: 35 },
      "3Star": { a: 0.8, c: 45 },
      "2Star": { a: 0.85, c: 55 },
      "1Star": { a: 0.9, c: 65 }
    },
    "Small": {
      "5Star": { a: 0.5, c: 25 },
      "4Star": { a: 0.55, c: 35 },
      "3Star": { a: 0.6, c: 45 },
      "2Star": { a: 0.65, c: 55 },
      "1Star": { a: 0.7, c: 65 }
    }
  },

  "Hot & Dry": {
    "Large": {
      "5Star": { a: 0.9, c: 15 },
      "4Star": { a: 0.95, c: 25 },
      "3Star": { a: 1.0, c: 35 },
      "2Star": { a: 1.05, c: 45 },
      "1Star": { a: 1.1, c: 55 }
    },
    "Medium": {
      "5Star": { a: 1.05, c: 15 },
      "4Star": { a: 1.1, c: 25 },
      "3Star": { a: 1.15, c: 35 },
      "2Star": { a: 1.2, c: 45 },
      "1Star": { a: 1.25, c: 55 }
    },
    "Small": {
      "5Star": { a: 1.55, c: 15 },
      "4Star": { a: 0.6, c: 25 },
      "3Star": { a: 0.65, c: 35 },
      "2Star": { a: 0.7, c: 45 },
      "1Star": { a: 0.75, c: 55 }
    }
  },

  "Temperate": {
    "Large": {
      "5Star": { a: 0.9, c: 15 },
      "4Star": { a: 0.95, c: 25 },
      "3Star": { a: 1.0, c: 35 },
      "2Star": { a: 1.05, c: 45 },
      "1Star": { a: 1.1, c: 55 }
    },
    "Medium": {
      "5Star": { a: 1.05, c: 15 },
      "4Star": { a: 1.1, c: 25 },
      "3Star": { a: 1.15, c: 35 },
      "2Star": { a: 1.2, c: 45 },
      "1Star": { a: 1.25, c: 55 }
    },
    "Small": {
      "5Star": { a: 0.55, c: 15 },
      "4Star": { a: 0.6, c: 25 },
      "3Star": { a: 0.65, c: 35 },
      "2Star": { a: 0.7, c: 45 },
      "1Star": { a: 0.75, c: 55 }
    }
  }
};


/*************************************************
 * CITY → CLIMATE MAP
 *******************

/*************************************************
 * CLIMATE + STATE + CITY DATA (SINGLE SOURCE)
 *************************************************/
let climateRawData = [];
let cityClimateMap = {};

fetch("Location_CZ_Latitude_cleaned.json")
  .then(res => res.json())
  .then(data => {
    climateRawData = data;

    data.forEach(item => {
      cityClimateMap[item.City.trim().toLowerCase()] = {
        zone: item.Climate_Zone.trim(),
        state: item.State,
        lat: item.Lat,
        lon: item.Longitude
      };
    });

    console.log("✅ Climate JSON loaded");
  })
  .catch(err => console.error("❌ Climate JSON load error", err));



/*************************************************
 * SAFE INPUT READERS (CRITICAL)
 *************************************************/
function readNumber(id) {
  const el = document.getElementById(id);
  if (!el) return NaN;
  const v = el.value;
  if (v === null || v === undefined || v.trim() === "") return NaN;
  return Number(v);
}

function readText(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : "";
}

/*************************************************
 * STATE → CITY DROPDOWN (FIXED)
 *************************************************/
document.addEventListener("DOMContentLoaded", () => {

  let climateRawData = [];

  const stateSelect = document.getElementById("state");
  const citySelect = document.getElementById("city");

  if (!stateSelect || !citySelect) {
    console.error("State or City select not found in DOM");
    return;
  }

  fetch("Location_CZ_Latitude.json")
    .then(res => {
      if (!res.ok) throw new Error("JSON not loaded");
      return res.json();
    })
    .then(data => {
      console.log("✅ Climate JSON loaded:", data.length, "rows");

      climateRawData = data;

      // Populate States
      const states = [...new Set(data.map(d => d.State))].sort();

      states.forEach(state => {
        const opt = document.createElement("option");
        opt.value = state;
        opt.textContent = state;
        stateSelect.appendChild(opt);
      });

      console.log("✅ States populated:", stateSelect.options.length);
    })
    .catch(err => console.error("❌ Climate JSON error:", err));

  stateSelect.addEventListener("change", () => {
    citySelect.innerHTML = `<option value="">Select City</option>`;
    citySelect.disabled = true;

    if (!stateSelect.value) return;

    climateRawData
      .filter(d => d.State === stateSelect.value)
      .forEach(d => {
        const opt = document.createElement("option");
        opt.value = d.City;
        opt.textContent = d.City;
        citySelect.appendChild(opt);
      });

    citySelect.disabled = false;
  });

});


/*************************************************
 * BUILDING SIZE
 *************************************************/
function getBuildingSize(areaSqm) {
  if (areaSqm <= 10000) return "Small";
  if (areaSqm <= 30000) return "Medium";
  return "Large";
}

let epi1 = null;
let epi2 = null;
let epi3= null;
let epi4=null;
let epi5=null;


/*************************************************
 * CORE CALCULATION (FINAL)
 *************************************************/
function calculateBuildingPerformance(inputs) {

  const {
    city,
    areaSqm,
    energyKWh,
    energyPeriod,
    coolingTR,
    contractDemandKVA,
    dgSize,
    renewableValue,
    acAreaPercentage,
    waterKL,      // ✅ ADD
    occupants,
    // lpcd
  } = inputs;


  /* ---------- ENERGY ---------- */
  const energyAnnualKWh =
    energyPeriod === "monthly" ? energyKWh * 12 : energyKWh;

  /* ---------- AREA ---------- */
  const areaSqft = areaSqm / 0.092903;

  /* ---------- CLIMATE ---------- */
 const climateZone =
  cityClimateMap[city.toLowerCase()]?.zone || "Unknown";


  /* ---------- BUILDING SIZE ---------- */
  const buildingSize = getBuildingSize(areaSqm);

  /* ---------- EPI ---------- */
  const epi = energyAnnualKWh / areaSqm;

  /* ---------- ASSURE EPI ---------- */
  const assureStatus =
    epi <= ASSURE_EPI_TARGET
      ? { text: "Within target", class: "metric-good" }
      : { text: "Above target", class: "metric-bad" };

/* ---------- NET ENERGY (FINAL & CORRECT) ---------- */

  // Annual demand
  const annualEnergyDemand =
    energyPeriod === "monthly"
      ? energyKWh * 12
      : energyKWh;

  // Renewable generation (already annual kWh)
  const renewableGenKWh =
    !isNaN(renewableValue) && renewableValue > 0
      ? renewableValue
      : 0;

  // Net balance
  const netEnergy = renewableGenKWh - annualEnergyDemand;

  // Tolerance
  const EPS = Math.max(1, 0.005 * annualEnergyDemand);

  let netStatus = {
    text: "Net Negative — More energy used than produced",
    class: "badge-negative"
  };

  if (renewableGenKWh > 0) {
    if (netEnergy > EPS) {
      netStatus = {
        text: "Net positive — Your building generates more energy than it consumes — extra energy can be exported for savings.",
        class: "badge-positive"
      };
    } else if (Math.abs(netEnergy) <= EPS) {
      netStatus = {
        text: "Net Zero — Your building generation and consumption are nearly equal",
        class: "badge-neutral"
      };
    }
  }

/* ================= BEE STAR RATING (USER-GUIDED) ================= */
/* ================= BEE STAR RATING (NBC-ALIGNED) ================= */
let starRating = {
  text: MISSING_RESULT_TEXT,
  note: MISSING_RESULT_TEXT,
  class: "badge-warn"
};

let epi1 = NaN;
let epi2 = NaN;
let epi3 = NaN;
let epi4 = NaN;
let epi5 = NaN;

/* ---------- HARD STOPS ---------- */

// 1️⃣ Cold climate zone → NOT APPLICABLE
if (climateZone.toLowerCase().includes("cold")) {
  starRating = {
    text: COLD_CLIMATE_MESSAGE,
    note: COLD_CLIMATE_MESSAGE,
    class: "badge-neutral"
  };
}

// 2️⃣ Missing required inputs
else if (
  !city ||
  climateZone === "Unknown" ||
  isNaN(areaSqm) || areaSqm <= 0 ||
  isNaN(energyKWh) || energyKWh <= 0 ||
  isNaN(acAreaPercentage) || acAreaPercentage <= 0 || acAreaPercentage > 100
) {
  starRating = {
    text: MISSING_RESULT_TEXT,
    note: MISSING_RESULT_TEXT,
    class: "badge-warn"
  };
}

// 3️⃣ Valid → calculate stars
else {
  const zoneKey = climateZone.trim();
  const eqByZone = beeEquations[zoneKey];
  const eq = eqByZone ? eqByZone[buildingSize] : null;

  if (!eq) {
    starRating = {
      text: MISSING_RESULT_TEXT,
      note: "BEE equations not available for this building type",
      class: "badge-warn"
    };
  } else {
    const acPct = acAreaPercentage;

    epi5 = (eq["5Star"].a * acPct) + eq["5Star"].c;
    epi4 = (eq["4Star"].a * acPct) + eq["4Star"].c;
    epi3 = (eq["3Star"].a * acPct) + eq["3Star"].c;
    epi2 = (eq["2Star"].a * acPct) + eq["2Star"].c;
    epi1 = (eq["1Star"].a * acPct) + eq["1Star"].c;

    if (epi <= epi5)
      starRating = { text: "★★★★★ (5 Star)", class: "badge-good" };
    else if (epi <= epi4)
      starRating = { text: "★★★★☆ (4 Star)", class: "badge-good" };
    else if (epi <= epi3)
      starRating = { text: "★★★☆☆ (3 Star)", class: "badge-warn" };
    else if (epi <= epi2)
      starRating = { text: "★★☆☆☆ (2 Star)", class: "badge-bad" };
    else if (epi <= epi1)
      starRating = { text: "★☆☆☆☆ (1 Star)", class: "badge-bad" };
    else
      starRating = { text: "No Star", class: "badge-bad" };
  }
}



/* ================= HVAC SIZING KPI ================= */
let hvacSizing = {
  // value: "",
  status: MISSING_RESULT_TEXT,
  // note: "Enter Built-up Area and AC Capacity",
  class: "rating-fair"
};

if (areaSqft <= 0 || isNaN(areaSqft)) {
  hvacSizing.note = "";
}
else if (isNaN(coolingTR) || coolingTR <= 0) {
  hvacSizing.note = "";
}
else {
  const sfPerTR = areaSqft / coolingTR;

  if (sfPerTR >= 700 && sfPerTR <= 800) {
    hvacSizing = {
      value: `${sfPerTR.toFixed(0)} sqft/TR`,
      status: "Efficient sizing",
      note: "Within recommended range",
      class: "rating-excellent"
    };
  }
  else if (sfPerTR < 700) {
    hvacSizing = {
      value: `${sfPerTR.toFixed(0)} sqft/TR`,
      status: "Oversized",
      note: "Low sqft/TR",
      class: "rating-poor"
    };
  }
  else {
    hvacSizing = {
      value: `${sfPerTR.toFixed(0)} sqft/TR`,
      status: "Possibly undersized",
      note: "High sqft/TR",
      class: "rating-fair"
    };
  }
}

/* ================= CONTRACT / DG SIZING KPI (STRUCTURED) ================= */
const PF = 0.9;

let demandSizing = {
  contract: "",
  dg: "",
  status: MISSING_RESULT_TEXT,
  class: "rating-fair"
};

if (areaSqft > 0) {

  const cdKW = !isNaN(contractDemandKVA) ? contractDemandKVA * PF : NaN;
  const dgKW = !isNaN(dgSize) ? dgSize * PF : NaN;

  const cdWsf = !isNaN(cdKW) ? (cdKW * 1000) / areaSqft : NaN;
  const dgWsf = !isNaN(dgKW) ? (dgKW * 1000) / areaSqft : NaN;

  const cdOk = !isNaN(cdWsf) && cdWsf < 5;
  const dgOk = !isNaN(dgWsf) && dgWsf < 5;

  demandSizing.contract = !isNaN(cdWsf)
    ? `${cdWsf.toFixed(2)} W/sqft`
    : "Not provided";

  demandSizing.dg = !isNaN(dgWsf)
    ? `${dgWsf.toFixed(2)} W/sqft`
    : "Not provided";

  if (cdOk && dgOk) {
    demandSizing.status = "Efficient";
    demandSizing.class = "rating-excellent";
  } else {
    demandSizing.status = "Above target";
    demandSizing.class = "rating-poor";
  }
}

console.log("DEMAND DEBUG:", demandSizing);

/* ================= LPCD CALCULATION ================= */
let lpcd = NaN;

if (
  !isNaN(waterKL) &&
  waterKL > 0 &&
  !isNaN(occupants) &&
  occupants > 0
) {
  // Annual kL → litres
  const annualLitres = waterKL * 1000;

  // LPCD calculation (220 working days)
  lpcd = annualLitres / (occupants * 220);
}

console.log("WATER DEBUG:", {
  waterKL,
  occupants,
  lpcd
});

/* ================= WATER (NBC LPCD ONLY) ================= */
let waterStatus = {
  text: MISSING_RESULT_TEXT,
  class: "rating-fair"
};

if (!isNaN(lpcd)) {
  if (lpcd <= NBC_LPCD) {
    waterStatus = {
      text: `${lpcd.toFixed(1)} lpcd — Within NBC`,
      class: "rating-excellent"
    };
  } else {
    waterStatus = {
      text: `${lpcd.toFixed(1)} lpcd — Above NBC`,
      class: "rating-poor"
    };
  }
}

  /* ---------- DEBUG (KEEP FOR NOW) ---------- */
  console.log("DEBUG:", {
    areaSqm,
    energyAnnualKWh,
    // renewableKwp,
    // renewablePct,
    // renewableGenKWh,
    // hasRenewables,
    epi
  });

  return {
    city,
    climateZone,
    buildingSize,
    epi,
    epiThresholds: {
      oneStar: epi1,
      twoStar: epi2,
      threeStar: epi3,
      fourStar: epi4,
      fiveStar: epi5
    },
    assureStatus,
    netStatus,
    starRating,
    hvacSizing,
    demandSizing,
    // hvacResult,
    waterStatus
  };
}


function updateEpiBar({ epi, thresholds, assure, coldClimate = false}) {

  if (coldClimate) {
  const fill = document.querySelector(".epi-fill");
  const buildingLabel = document.getElementById("buildingLabel");
  const buildingText = document.getElementById("buildingEpiText");

  const assureMarker = document.querySelector(".assure-marker");
  const assureLabel = document.getElementById("assureLabel");
  const starScale = document.querySelector(".epi-star-scale");

  // Bar → neutral full-width
  fill.style.width = "100%";
  fill.style.background = "#dcdcdc";

  // Building EPI only
  buildingLabel.style.left = "50%";
  buildingText.textContent = Math.round(epi);

  // ❌ Hide ASSURE benchmark
  assureMarker.style.display = "none";
  assureLabel.style.display = "none";

  // ❌ Hide stars
  if (starScale) starScale.style.display = "none";

  return; // 🚨 stop further logic
}


  if (!thresholds || isNaN(epi)) return;

  const {
    oneStar,
    twoStar,
    threeStar,
    fourStar,
    fiveStar
  } = thresholds;

  /* ===============================
     1️⃣ BASE THRESHOLD
     =============================== */
  const BASE_MAX = Math.max(
    assure,
    (2 * oneStar) - twoStar
  );

  /* ===============================
     2️⃣ SMART 2-STAGE EXTENSION
     =============================== */
  let AXIS_MAX = BASE_MAX;

  if (epi > BASE_MAX) {
    const SOFT_CAP = 1000;
    const LINEAR_FACTOR = 0.8;
    const LOG_FACTOR = BASE_MAX;

    if (epi <= SOFT_CAP) {
      AXIS_MAX = BASE_MAX + (epi - BASE_MAX) * LINEAR_FACTOR;
    } else {
      AXIS_MAX =
        BASE_MAX +
        (SOFT_CAP - BASE_MAX) * LINEAR_FACTOR +
        Math.log10(epi - SOFT_CAP + 1) * LOG_FACTOR;
    }
  }

  /* ===============================
     3️⃣ SCALE HELPERS
     =============================== */
  const clamp = v => Math.max(0, Math.min(v, AXIS_MAX));
  const pct = v => (clamp(v) / AXIS_MAX) * 100;

  const buildingEpi = clamp(epi);

  /* ===============================
     4️⃣ DOM ELEMENTS
     =============================== */
  const fill = document.querySelector(".epi-fill");
  const buildingMarker = document.querySelector(".building-marker");
  const assureMarker = document.querySelector(".assure-marker");

  const buildingLabel = document.getElementById("buildingLabel");
  const assureLabel = document.getElementById("assureLabel");
  const buildingText = document.getElementById("buildingEpiText");
  const msg = document.getElementById("epiMessage");

  /* ===============================
     5️⃣ BAR + MARKERS (WITH RED GRADIENT)
     =============================== */
  const buildingPct = pct(buildingEpi);
  const assurePct = pct(assure);

  fill.style.width = `${buildingPct}%`;

  // 🔴 RED AFTER ASSURE TARGET
 if (epi > assure) {
  fill.style.background = `
    linear-gradient(
      to right,
      #2ecc71 0%,
      #2ecc71 ${assurePct}%,
      #27ae60 ${assurePct}%,
      #27ae60 100%
    )
  `;
} else {
  fill.style.background = "#2ecc71";
}


  buildingMarker.style.left = `calc(${buildingPct}% - 2px)`;
  buildingLabel.style.left = `${buildingPct}%`;

  assureMarker.style.left = `calc(${assurePct}% - 2px)`;
  assureLabel.style.left = `${assurePct}%`;

  buildingText.textContent = Math.round(epi);

  /* ===============================
     6️⃣ STAR POSITIONING
     =============================== */
  const stars = [
    { id: 5, value: fiveStar },
    { id: 4, value: fourStar },
    { id: 3, value: threeStar },
    { id: 2, value: twoStar },
    { id: 1, value: oneStar }
  ];

  stars.forEach(({ id, value }) => {
    const el = document.querySelector(
      `.epi-star-group[data-star="${id}"]`
    );

    if (!el || isNaN(value)) return;

    el.style.left = `${pct(value)}%`;
    el.style.opacity = 1;
  });

  /* ===============================
     7️⃣ LABEL STACKING
     =============================== */
  const dist = Math.abs(buildingPct - assurePct);

  if (dist < 8) {
    buildingLabel.style.top = "-78px";
    assureLabel.style.top = "-38px";
  } else {
    buildingLabel.style.top = "-58px";
    assureLabel.style.top = "-58px";
  }

  /* ===============================
     8️⃣ USER MESSAGE
     =============================== */
/* ===============================
   8️⃣ USER MESSAGE
   =============================== */

  // ❄️ Cold climate override
  if (coldClimate) {
    msg.innerHTML = `
      <b>EPI benchmarking not available.</b>
      Comparison with ASSURE target (75 kWh/m²/yr) cannot be provided
      due to missing BEE star benchmark equations for cold climate zones.
    `;
    return;
  }

  // 🌟 Normal BEE messaging
  if (epi <= fiveStar) {
    msg.innerHTML = "Excellent! 5-Star energy performance.";
  }
  else if (epi <= threeStar) {
    msg.innerHTML = "Average efficiency. Optimization recommended.";
  }
  else if (epi <= oneStar) {
    msg.innerHTML = "<b>Poor efficiency.</b> Action required.";
  }
  else {
    const delta = Math.round(epi - assure);
    msg.innerHTML =
      `<b>Very high energy use.</b>
      ${delta} kWh/m²/yr above ASSURE target (75 kWh/m²/yr)`;
  }

}





/*************************************************
 * ASSESS BUTTON (FINAL – VALIDATED)
 *************************************************/
document.getElementById("assessBtn").addEventListener("click", () => {

  /* ========= COLLECT INPUTS ========= */
  const inputs = {
    city: readText("city"),
    areaSqm: readNumber("area"),
    energyKWh: readNumber("energy"),
    energyPeriod: readText("energyPeriod"),
    coolingTR: readNumber("acCapacity"),
    contractDemandKVA: readNumber("contractDemand"),
    dgSize: readNumber("dgSize"),
    renewableValue: readNumber("renewableValue"), 
    acAreaPercentage: readNumber("acArea"),
    waterKL: readNumber("water"),        // ✅ ADD
    occupants: readNumber("occupants"),  // ✅ ADD
    // lpcd: readNumber("lpcd")
  };

  /* ========= BASIC REQUIRED CHECK ========= */
/* ========= CITY REQUIRED (ONLY POPUP CASE) ========= */
if (!inputs.city) {
  alert("Please select State and City to continue");
  return;
}


  /* ========= RUN CALCULATION ========= */
  const results = calculateBuildingPerformance(inputs);
  renderResults(results);
});

function buildDemandLine(d) {
  const parts = [];

  if (d.contract && d.contract !== "Not provided") {
    parts.push(`<strong>Contract:</strong> ${d.contract}`);
  }

  if (d.dg && d.dg !== "Not provided") {
    parts.push(`<strong>DG:</strong> ${d.dg}`);
  }

  // If nothing provided
  if (parts.length === 0) {
    return `
      <span class="rating-fair">
        Input required — enter <b>Contract Demand</b> or <b>DG Set size</b>
      </span>
    `;
  }

  return `
    ${parts.join(" &nbsp;•&nbsp; ")}
    &nbsp;—&nbsp;
    <strong>${d.status}</strong>
  `;
}



/*************************************************
 * RENDER RESULTS (MATCHES HTML EXACTLY)
 *************************************************/
function renderResults(r) {



  const beeEl = document.getElementById("outStarRating");
  const epiStarScale = document.getElementById("epiStarScale");

  /* ================= COLD CLIMATE HANDLING ================= */
  if (r.starRating.text === COLD_CLIMATE_MESSAGE) {

    // 1️⃣ Show cold-climate message in BEE rating
    beeEl.innerHTML = `
      <span class="rating-neutral">
        ${COLD_CLIMATE_MESSAGE}
      </span>
    `;

    // 2️⃣ HIDE stars below EPI bar
    if (epiStarScale) {
      epiStarScale.style.display = "none";
    }

  } else {

    // ✅ Non-cold climate → SHOW star scale
    if (epiStarScale) {
      epiStarScale.style.display = "block";
    }

    /* ---------- EXISTING LOGIC (UNCHANGED) ---------- */
    if (r.starRating.text === MISSING_RESULT_TEXT) {
      beeEl.innerHTML = `
        <span class="rating-fair">
          ${MISSING_RESULT_TEXT}
        </span>
      `;
    } else {
      const filledStars = (r.starRating.text.match(/★/g) || []).length;

      let starsHtml = "";
      for (let i = 1; i <= 5; i++) {
        starsHtml += `
          <span class="bee-star ${i <= filledStars ? "filled" : "empty"}">★</span>
        `;
      }

      beeEl.innerHTML = `
        <span class="badge ${r.starRating.class}">
          <span class="bee-stars">${starsHtml}</span>
          <span class="bee-text">(${filledStars} Star)</span>
        </span>
      `;
    }
  }





  document.getElementById("outNetEnergy").innerHTML =
    `<span class="${r.netStatus.class}">
      ${r.netStatus.text}
    </span>`;


/* ================= HVAC & ELECTRICAL ================= */
document.getElementById("outHvac").innerHTML = `
  <div class="hvac-block">
    
    <div class="hvac-title">
      <span class="kpi-icon">❄️</span>
      <span>
        HVAC sizing (ASSURE KPI: 800 sqft/TR) :
      </span>
    </div>

    <div class="hvac-value ${r.hvacSizing.class}">
      ${r.hvacSizing.value || ""}
      ${r.hvacSizing.status ? ` ${r.hvacSizing.status}` : ""}
      ${r.hvacSizing.note ? ` (${r.hvacSizing.note})` : ""}
    </div>

  </div>
`;


document.getElementById("outDemand").innerHTML = `
  <div class="electrical-block">

    <!-- CONTRACT DEMAND -->
    <div class="electrical-item">
      <div class="electrical-title">
        <span class="kpi-icon">⚡</span>
        <span>
          Contract Demand (ASSURE KPI: &lt; 5 W/sqft) :
        </span>
      </div>

      <div class="electrical-value ${r.demandSizing.class}">
        ${
          r.demandSizing.contract !== "Not provided"
            ? `${r.demandSizing.contract} — ${r.demandSizing.status}`
            : `<span class="rating-fair">Result not available due to missing input(s).</span>`
        }
      </div>
    </div>

    <!-- DG SET -->
    <div class="electrical-item">
      <div class="electrical-title">
        <span class="kpi-icon">⚡</span>
        <span>
          DG Set sizing (ASSURE KPI: &lt; 5 W/sqft) :
        </span>
      </div>

      <div class="electrical-value ${r.demandSizing.class}">
        ${
          r.demandSizing.dg !== "Not provided"
            ? `${r.demandSizing.dg} — ${r.demandSizing.status}`
            : `<span class="rating-fair">Result not available due to missing input(s).</span>`
        }
      </div>
    </div>

  </div>
`;


/* ================= WATER ================= */
document.getElementById("outWater").innerHTML = `
  <div class="kpi-row">
    <div class="kpi-left">
      <span class="kpi-icon">💧</span>
      <div>
        <div class="kpi-title">
          Water Efficiency
          <span class="kpi-ref">(NBC 45 lpcd)</span>
        </div>
      </div>
    </div>

    <div class="kpi-right ${r.waterStatus.class}">
      ${r.waterStatus.text}
    </div>
  </div>
`;

const isColdClimate =
  r.starRating.text === COLD_CLIMATE_MESSAGE;

updateEpiBar({
  epi: r.epi,
  thresholds: isColdClimate ? null : r.epiThresholds,
  assure: ASSURE_EPI_TARGET,
  coldClimate: isColdClimate
});

  /* ================= SHOW RESULTS ================= */
const resultsEl = document.getElementById("results");
  resultsEl.classList.remove("hidden");

  // Force refresh animation
  resultsEl.classList.remove("results-refresh");
  void resultsEl.offsetWidth; // 👈 forces reflow
  resultsEl.classList.add("results-refresh");
}

