import { createSlice } from "@reduxjs/toolkit";

export const itemInteractionSlice = createSlice({
  name: "itemInteraction",
  initialState: {
    selectedCommunities: [], // array of IDs brushed in scatterplot
    highlightedState: null, // state name clicked in hierarchy
    hoveredCommunity: null, // community name hovered
  },
  reducers: {
    setSelectedCommunities: (state, action) => {
      state.selectedCommunities = action.payload;
    },
    setHighlightedState: (state, action) => {
      state.highlightedState = action.payload;
    },
    setHoveredCommunity: (state, action) => {
      state.hoveredCommunity = action.payload;
    },
  },
});

export const {
  setSelectedCommunities,
  setHighlightedState,
  setHoveredCommunity,
} = itemInteractionSlice.actions;

export default itemInteractionSlice.reducer;
