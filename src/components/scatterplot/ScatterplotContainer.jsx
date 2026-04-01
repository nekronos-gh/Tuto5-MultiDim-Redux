import React, { useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import ScatterplotD3 from "./ScatterplotD3";
import "./ScatterplotD3.css";

function ScatterplotContainer() {
  const dataState = useSelector((state) => state.dataSet);
  const interactionState = useSelector((state) => state.itemInteraction);
  const dispatch = useDispatch();

  const containerRef = useRef(null);
  const d3InstanceRef = useRef(null);

  // Initialize the Scatterplot
  useEffect(() => {
    if (
      dataState &&
      dataState.length > 0 &&
      containerRef.current &&
      !d3InstanceRef.current
    ) {
      d3InstanceRef.current = new ScatterplotD3(
        containerRef.current,
        dataState,
        dispatch,
      );
    }
  }, [dataState, dispatch]);

  // Update when there is an interaction
  useEffect(() => {
    if (d3InstanceRef.current) {
      d3InstanceRef.current.update(interactionState);
    }
  }, [interactionState]);

  // Render again when ther is a change in window size
  useEffect(() => {
    const handleResize = () => {
      if (d3InstanceRef.current) d3InstanceRef.current.render();
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return <div ref={containerRef} className="visualization-container" />;
}

export default ScatterplotContainer;
