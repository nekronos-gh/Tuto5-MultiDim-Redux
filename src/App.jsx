import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { getDataSet } from "./redux/DataSetSlice";
import ScatterplotContainer from "./components/scatterplot/ScatterplotContainer";
import HierarchyContainer from "./components/hierarchy/HierarchyContainer";
import "./App.css";

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getDataSet());
  }, [dispatch]);

  return (
    <div className="App">
      <header>
        <h1>Where should I live in the US?</h1>
      </header>
      <div className="dashboard">
        <div className="panel scatterplot-panel">
          <ScatterplotContainer />
        </div>
      </div>
    </div>
  );
}

export default App;
