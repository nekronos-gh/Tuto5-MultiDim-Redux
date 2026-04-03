import * as d3 from "d3";
import "./Tooltip.css";

// Tooltip class to show extra information
export class Tooltip {
  constructor() {
    this.tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "d3-tooltip")
      .style("opacity", 0);
  }

  show(event, d) {
    // Divide into levels for quick visualization
    const crimeLevel =
      d.ViolentCrimesPerPop < 0.2
        ? "Low"
        : d.ViolentCrimesPerPop < 0.5
          ? "Moderate"
          : "High";
    const incomeLevel =
      d.medIncome > 0.6 ? "High" : d.medIncome > 0.3 ? "Middle" : "Low";

    // Draw the tooltip
    this.tooltip.transition().duration(200).style("opacity", 1);
    this.tooltip.html(`
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
  `);

    // Cast the tooltip to always show within screen
    const tooltipHeight = this.tooltip.node().offsetHeight;
    const tooltipWidth = this.tooltip.node().offsetWidth;
    const isTopHalf = event.pageY < window.innerHeight / 2;
    const isLeftHalf = event.pageX < window.innerWidth / 2;

    this.tooltip
      .style(
        "top",
        isTopHalf
          ? event.pageY + 10 + "px"
          : event.pageY - tooltipHeight - 10 + "px",
      )
      .style(
        "left",
        isLeftHalf
          ? event.pageX + 10 + "px"
          : event.pageX - tooltipWidth - 10 + "px",
      );
  }

  hide() {
    this.tooltip.transition().duration(500).style("opacity", 0);
  }

  remove() {
    this.tooltip.remove();
  }
}
