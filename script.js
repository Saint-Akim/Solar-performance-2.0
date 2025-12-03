document.addEventListener("DOMContentLoaded", () => {
  const themeToggle = document.getElementById("theme-toggle");
  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    themeToggle.textContent = document.body.classList.contains("dark") ? "Light Mode" : "Dark Mode";
  });

  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
      document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById(btn.dataset.tab).classList.add("active");
      
      if (btn.dataset.tab === "solar") loadSolar();
      if (btn.dataset.tab === "generator") loadGenerator();
      if (btn.dataset.tab === "factory") loadFactory();
      if (btn.dataset.tab === "kehua") loadKehua();
    });
  });

  // Load Solar
  function loadSolar() {
    const urls = [
      "https://raw.githubusercontent.com/Saint-Akim/Solar-performance/main/Solar_goodwe%26Fronius_may.csv"
    ];
    Promise.all(urls.map(u => fetch(u).then(r => r.text())))
      .then(texts => {
        let allData = [];
        texts.forEach(t => allData = allData.concat(Papa.parse(t, { header: true, dynamicTyping: true }).data));
        const times = allData.map(d => d.last_changed).filter(Boolean);
        const power = allData.map(d => ((d["sensor.goodwe_grid_power"] || 0) + (d["sensor.fronius_grid_power"] || 0)) / 1000);

        Plotly.newPlot("solar-chart", [{
          x: times, y: power, type: "scatter", mode: "lines", name: "Actual Power (kW)",
          line: { color: "#00C853", width: 3 }
        }], {
          title: { text: "Solar Output", font: { size: 20 } },
          height: 520, plot_bgcolor: "white", paper_bgcolor: "white",
          xaxis: { gridcolor: "#f0f0f0" }, yaxis: { gridcolor: "#f0f0f0" }
        });
      });
  }

  function loadGenerator() {
    fetch("https://raw.githubusercontent.com/Saint-Akim/Solar-performance/main/GEN.csv")
      .then(r => r.text())
      .then(text => {
        const data = Papa.parse(text, { header: true, dynamicTyping: true }).data;
        const times = data.map(d => d.last_changed);
        const fuel = data.map(d => d["sensor.generator_fuel_consumed"] || 0);
        const runtime = data.map(d => d["sensor.generator_runtime_duration"] || 0);

        Plotly.newPlot("fuel-chart", [{ x: times, y: fuel, line: { color: "#DC2626" } }], { title: "Fuel Consumed (L)", height: 400 });
        Plotly.newPlot("runtime-chart", [{ x: times, y: runtime, line: { color: "#7C3AED" } }], { title: "Runtime (hours)", height: 400 });
      });
  }

  function loadFactory() {
    fetch("https://raw.githubusercontent.com/Saint-Akim/Solar-performance/main/FACTORY%20ELEC.csv")
      .then(r => r.text())
      .then(text => {
        const data = Papa.parse(text, { header: true, dynamicTyping: true }).data;
        const times = data.map(d => d.last_changed);
        const daily = data.map(d => d["sensor.bottling_factory_monthkwhtotal"] || 0);
        const dailyKwh = [0];
        for (let i = 1; i < daily.length; i++) dailyKwh.push(daily[i] - daily[i-1]);

        Plotly.newPlot("factory-chart", [{ x: times, y: dailyKwh, line: { color: "#0EA5E9" } }], {
          title: "Daily Factory kWh", height: 500
        });
      });
  }

  function loadKehua() {
    fetch("https://raw.githubusercontent.com/Saint-Akim/Solar-performance/main/KEHUA%20INTERNAL.csv")
      .then(r => r.text())
      .then(text => {
        const data = Papa.parse(text, { header: true, dynamicTyping: true }).data;
        const times = data.map(d => d.last_changed);
        const power = data.map(d => (d["sensor.kehua_internal_power"] || 0) / 1000);

        Plotly.newPlot("kehua-chart", [{ x: times, y: power, line: { color: "#06B6D4" } }], {
          title: "Kehua Power (kW)", height: 500
        });
      });
  }

  // Auto-load first tab
  loadSolar();
});