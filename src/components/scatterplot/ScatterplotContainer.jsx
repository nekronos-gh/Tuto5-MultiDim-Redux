import React, { useEffect, useRef, useMemo } from "react";
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

  // Get the selected State
  const highlightedState = useSelector(
    (state) => state.itemInteraction.highlightedState,
  );

  // Find the corresponding state code
  const stateCode = useMemo(() => {
    if (!highlightedState) return null;
    return dataState.find((d) => d.state === highlightedState)?.stateCode;
  }, [highlightedState, dataState]);

  return (
    <div ref={containerRef} className="visualization-container">
      {highlightedState && (
        <div className="state-badge">
          <span className="state-badge__code">{stateCode}</span>
          <span className="state-badge__name">{highlightedState}</span>
        </div>
      )}
    </div>
  );
}

export default ScatterplotContainer;
