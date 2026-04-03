import React, { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import HierarchyD3 from "./HierarchyD3";
import "./HierarchyD3.css";

function HierarchyContainer() {
  const data = useSelector((state) => state.dataSet);
  const interactionState = useSelector((state) => state.itemInteraction);
  const dispatch = useDispatch();

  const containerRef = useRef(null);
  const d3InstanceRef = useRef(null);
  const [layout, setLayout] = useState("treemap");

  // Initialize the Hierarchy
  useEffect(() => {
    if (
      data &&
      data.length > 0 &&
      containerRef.current &&
      !d3InstanceRef.current
    ) {
      d3InstanceRef.current = new HierarchyD3(
        containerRef.current,
        data,
        dispatch,
      );
    }
  }, [data, dispatch]);

  // Update when changin the layout type
  useEffect(() => {
    if (d3InstanceRef.current) {
      d3InstanceRef.current.setLayout(layout);
    }
  }, [layout]);

  useEffect(() => {
    if (d3InstanceRef.current) {
      d3InstanceRef.current.update(interactionState);
    }
  }, [interactionState, layout]);

  // Render again when ther is a change in window size
  useEffect(() => {
    const handleResize = () => {
      if (d3InstanceRef.current) d3InstanceRef.current.render();
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    // Buttons to select visualization
    <div className="visualization-container">
      <div className="controls">
        <button
          className={layout === "treemap" ? "active" : ""}
          onClick={() => setLayout("treemap")}
        >
          Treemap
        </button>
        <button
          className={layout === "pack" ? "active" : ""}
          onClick={() => setLayout("pack")}
        >
          Circle Pack
        </button>
      </div>
      <div ref={containerRef} className="visualization-container" />
    </div>
  );
}

export default HierarchyContainer;
