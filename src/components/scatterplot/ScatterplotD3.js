import * as d3 from "d3";

export default class ScatterplotD3 {
  constructor(container, data, dispatch) {
    this.container = d3.select(container);
    this.data = data;
    this.dispatch = dispatch;

    this.margin = { top: 20, right: 30, bottom: 40, left: 50 };
    this.gridGranularity = 10;
    this.init();
  }

  init() {
    this.svg = this.container.append("svg").attr("class", "scatterplot-svg");
    this.g = this.svg
      .append("g")
      .attr("transform", `translate(${this.margin.left},${this.margin.top})`);

    // Set point size scale
    this.sizeScale = d3.scaleSqrt();
    this.sizeScale
      .domain([0, d3.max(this.data, (d) => d.population)])
      .range([2, 20]);

    // Set X axis
    this.xScale = d3.scaleLinear();
    this.xAxis = this.g.append("g").attr("class", "x-axis");
    this.xGrid = this.g.append("g").attr("class", "gridlines x-grid");
    this.xLabel = this.g
      .append("text")
      .attr("class", "axis-label")
      .attr("text-anchor", "middle")
      .text("Median Income (normalized 0–1)");

    // Set Y axis
    this.yScale = d3.scaleLinear();
    this.yAxis = this.g.append("g").attr("class", "y-axis");
    this.yGrid = this.g.append("g").attr("class", "gridlines y-grid");
    this.yLabel = this.g
      .append("text")
      .attr("class", "axis-label")
      .attr("text-anchor", "middle")
      .attr("transform", "rotate(-90)")
      .text("Violent Crimes Per Pop (normalized 0–1)");

    // Set color gradient depending on ammount of crime
    this.colorScale = d3.scaleSequential(d3.interpolateRdYlGn);
    this.colorScale.domain([
      d3.max(this.data, (d) => d.ViolentCrimesPerPop), // low crime
      d3.min(this.data, (d) => d.ViolentCrimesPerPop), // high crime
    ]);

    // Group state crime averages
    const stateAverages = d3.rollup(
      this.data,
      (v) => d3.mean(v, (d) => d.ViolentCrimesPerPop),
      (d) => d.state,
    );
    this.stateCrimeMap = stateAverages;

    // Hover -> Show tooltip
    this.tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "d3-tooltip")
      .style("opacity", 0);

    this.render();
  }

  render() {
    // Update drawing rectangle
    const rect = this.container.node().getBoundingClientRect();
    this.width = rect.width - this.margin.left - this.margin.right;
    this.height = rect.height - this.margin.top - this.margin.bottom;
    this.svg.attr("width", rect.width).attr("height", rect.height);

    // Update x Axis
    this.xScale
      .domain([0, d3.max(this.data, (d) => d.medIncome)])
      .range([0, this.width]);
    this.xAxis
      .attr("transform", `translate(0,${this.height})`)
      .call(d3.axisBottom(this.xScale).ticks(this.gridGranularity));
    this.xLabel.attr("x", this.width / 2).attr("y", this.height + 35);
    this.xGrid
      .attr("transform", `translate(0,${this.height})`)
      .call(
        d3
          .axisBottom(this.xScale)
          .ticks(this.gridGranularity)
          .tickSize(-this.height)
          .tickFormat(""),
      );

    // Update y Axsis
    this.yScale
      .domain([0, d3.max(this.data, (d) => d.ViolentCrimesPerPop)])
      .range([this.height, 0]);
    this.yAxis.call(d3.axisLeft(this.yScale).ticks(this.gridGranularity));
    this.yLabel.attr("x", -this.height / 2).attr("y", -35);
    this.yGrid.call(
      d3
        .axisLeft(this.yScale)
        .ticks(this.gridGranularity)
        .tickSize(-this.width)
        .tickFormat(""),
    );

    // Draw the points (medIncome, ViolentCrimesPerPop)
    const points = this.g.selectAll(".dot").data(this.data, (d) => d.id);
    points
      .join("circle")
      .attr("class", "dot")
      .attr("cx", (d) => this.xScale(d.medIncome))
      .attr("cy", (d) => this.yScale(d.ViolentCrimesPerPop))
      .attr("r", (d) => this.sizeScale(d.population))
      .attr("fill", (d) => this.colorScale(d.ViolentCrimesPerPop))
      .attr("opacity", 0.6)
      .on("mouseenter", (event, d) => {
        this.showTooltip(event, d);
      })
      .on("mouseleave", () => {
        this.hideTooltip();
      });
  }

  showTooltip(event, d) {
    const crimeLevel =
      d.ViolentCrimesPerPop < 0.2
        ? "Low"
        : d.ViolentCrimesPerPop < 0.5
          ? "Moderate"
          : "High";

    const incomeLevel =
      d.medIncome > 0.6 ? "High" : d.medIncome > 0.3 ? "Middle" : "Low";

    this.tooltip.transition().duration(200).style("opacity", 0.9);
    this.tooltip.html(
      `
      <div class="tooltip-title">${d.communityname}</div>
      <div class="tooltip-state">${d.state}</div>
      <hr/>
      <div class="tooltip-row">
        <span class="tooltip-label">Crime Rate</span>
        <span>${crimeLevel} (${d.ViolentCrimesPerPop.toFixed(2)})</span>
      </div>
      <div class="tooltip-row">
        <span class="tooltip-label">Income</span>
        <span>${incomeLevel} (${d.medIncome.toFixed(2)})</span>
      </div>
      <div class="tooltip-row">
        <span class="tooltip-label">Unemployment</span>
        <span>${(d.PctUnemployed * 100).toFixed(1)}%</span>
      </div>
      <div class="tooltip-row">
        <span class="tooltip-label">Population</span>
        <span>${d.population < 0.1 ? "Small" : d.population < 0.4 ? "Medium" : "Large"} (${d.population.toFixed(2)})</span>
      </div>
    `,
    );

    // Measure tooltip size after content is set
    const tooltipNode = this.tooltip.node();
    const tooltipHeight = tooltipNode.offsetHeight;
    const tooltipWidth = tooltipNode.offsetWidth;

    // Flip vertically if too close to bottom
    const top =
      event.pageY + tooltipHeight + 20 > window.innerHeight
        ? event.pageY - tooltipHeight - 10 // above cursor
        : event.pageY + 10; // below cursor

    // Flip horizontally if too close to right edge
    const left =
      event.pageX + tooltipWidth + 10 > window.innerWidth
        ? event.pageX - tooltipWidth - 10 // left of cursor
        : event.pageX + 10; // right of cursor

    this.tooltip
      .transition()
      .duration(200)
      .style("opacity", 0.9)
      .style("left", left + "px")
      .style("top", top + "px");
  }

  hideTooltip() {
    this.tooltip.transition().duration(500).style("opacity", 0);
  }
}
