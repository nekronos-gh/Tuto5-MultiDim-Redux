import * as d3 from "d3";
import {
  setHighlightedState,
  setHoveredCommunity,
} from "../../redux/ItemInteractionSlice";
import { Tooltip } from "../../utils/Tooltip";

export default class HierarchyD3 {
  constructor(container, data, dispatch) {
    this.container = d3.select(container);
    this.data = this.processData(data);
    this.dispatch = dispatch;
    this.currentLayout = "treemap";

    this.margin = { top: 20, right: 20, bottom: 20, left: 20 };
    this.init();
  }

  // Create a hierarchical root node
  processData(data) {
    const nestedData = d3
      .groups(data, (d) => d.state)
      .map(([state, values]) => ({
        state: state,
        stateCode: values[0].stateCode,
        children: values.map((v) => ({ ...v })),
      }));

    return d3
      .hierarchy({ name: "US", children: nestedData })
      .sum((d) => d.ViolentCrimesPerPop)
      .sort((a, b) => b.value - a.value);
  }

  init() {
    this.svg = this.container.append("svg").attr("class", "hierarchy-svg");
    this.g = this.svg
      .append("g")
      .attr("transform", `translate(${this.margin.left},${this.margin.top})`);

    // Set color gradient depending on ammount of crime
    this.colorScale = d3.scaleSequential(d3.interpolateRdYlGn).domain([
      d3.max(this.data, (d) => d.data.ViolentCrimesPerPop), // low crime
      d3.min(this.data, (d) => d.data.ViolentCrimesPerPop), // high crime
    ]);

    // We have 2 actions per node
    // Hover -> Show tooltip
    this.tooltip = new Tooltip();
    // Click -> Hull on scatterpoint

    this.render();
  }

  setLayout(layout) {
    this.currentLayout = layout;
    this.render();
  }

  render() {
    // Update drawing rectangle
    const rect = this.container.node().getBoundingClientRect();
    this.width = rect.width - this.margin.left - this.margin.right;
    this.height = rect.height - this.margin.top - this.margin.bottom;
    this.svg.attr("width", rect.width).attr("height", rect.height);

    // Reset
    this.g.selectAll("*").remove();

    // Select layout
    if (this.currentLayout === "treemap") this.renderTreemap();
    else if (this.currentLayout === "pack") this.renderPack();
  }

  renderTreemap() {
    // Generate the tree
    d3
      .treemap()
      .size([this.width, this.height])
      .paddingOuter(3) // Allow for title space
      .paddingTop(15)
      .paddingInner(1)(this.data);

    // Use id for internal nodes
    const nodes = this.g
      .selectAll(".node")
      .data(this.data.descendants(), (d) => d.data.id);

    // Set relative positioning start point
    const nodeEnter = nodes
      .join("g")
      .attr(
        "class",
        (d) => `node ${d.children ? "node-internal" : "node-leaf"}`,
      )
      .attr("transform", (d) => `translate(${d.x0},${d.y0})`);

    // Draw the different communities and add the two diferent cations
    nodeEnter
      .append("rect")
      .attr("width", (d) => d.x1 - d.x0)
      .attr("height", (d) => d.y1 - d.y0)
      .attr("fill", (d) =>
        d.children ? "#2a2d37" : this.colorScale(d.data.ViolentCrimesPerPop),
      )
      .on("click", (e, d) => {
        if (d.depth === 2) this.dispatch(setHighlightedState(d.data.state));
      })
      .on("mouseenter", (e, d) => {
        if (d.depth === 2) {
          this.dispatch(setHoveredCommunity(d.data.id));
          this.tooltip.show(e, d.data);
        }
      })
      .on("mouseleave", () => {
        this.dispatch(setHoveredCommunity(null));
        this.tooltip.hide();
      });

    // Draw the state code over the leaf
    nodeEnter
      .filter((d) => d.depth === 1)
      .append("text")
      .attr("x", 5)
      .attr("y", 12)
      .text((d) => d.data.stateCode);
  }

  renderPack() {
    // Generate the pack
    d3.pack().size([this.width, this.height]).padding(3)(this.data);

    // Set relative positioning start point
    const nodeEnter = this.g
      .selectAll(".node")
      .data(this.data.descendants())
      .join("g")
      .attr(
        "class",
        (d) => `node ${d.children ? "node-internal" : "node-leaf"}`,
      )
      .attr("transform", (d) => `translate(${d.x},${d.y})`);

    // Draw the points
    nodeEnter
      .append("circle")
      .attr("r", (d) => d.r)
      .attr("fill", (d) =>
        d.children
          ? "rgba(255,255,255,0.05)"
          : this.colorScale(d.data.ViolentCrimesPerPop),
      )
      .on("click", (e, d) => {
        if (d.depth === 2) this.dispatch(setHighlightedState(d.data.state));
      })
      .on("mouseenter", (e, d) => {
        if (d.depth === 2) {
          this.dispatch(setHoveredCommunity(d.data.id));
          this.tooltip.show(e, d.data);
        }
      })
      .on("mouseleave", () => {
        this.dispatch(setHoveredCommunity(null));
        this.tooltip.hide();
      });
  }

  update(state) {
    const { selectedCommunities, highlightedState, hoveredCommunity } = state;

    // Satete selector
    const getNodeState = (d) => {
      if (d.data.id === hoveredCommunity) return "hovered";
      if (selectedCommunities.includes(d.data.id)) return "selected";
      if (d.data.state === highlightedState) return "highlighted";
      return "default";
    };

    // Leaf nodes (communities)
    this.g
      .selectAll(".node-leaf rect, .node-leaf circle")
      .transition()
      .duration(200)
      .style("stroke", (d) => {
        const s = getNodeState(d);
        if (s === "hovered") return "#fff";
        if (s === "selected") return "#4ecca3";
        return "rgba(0,0,0,0.1)";
      })
      .style("stroke-width", (d) => {
        const s = getNodeState(d);
        if (s === "hovered") return 3;
        if (s === "selected") return 3;
        if (s === "highlighted") return 3;
        return 1;
      })
      .attr("class", (d) =>
        selectedCommunities.includes(d.data.id)
          ? "node-leaf pulse"
          : "node-leaf",
      );

    // Internal nodes (states)
    this.g
      .selectAll(".node-internal rect, .node-internal circle")
      .transition()
      .duration(200)
      .style("stroke", (d) => {
        d.data.state === highlightedState ? "#4ecca3" : "rgba(255,255,255,0.1)";
      })
      .style("stroke-width", (d) => (d.data.state === highlightedState ? 2 : 1))
      .attr("class", (d) =>
        d.data.state === highlightedState
          ? "node-internal pulse"
          : "node-internal",
      );
  }
}
