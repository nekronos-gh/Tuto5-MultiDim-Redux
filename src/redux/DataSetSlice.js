import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import Papa from "papaparse";

const FIPS_TO_STATE = {
  1: "Alabama",
  2: "Alaska",
  4: "Arizona",
  5: "Arkansas",
  6: "California",
  8: "Colorado",
  9: "Connecticut",
  10: "Delaware",
  11: "Washington DC",
  12: "Florida",
  13: "Georgia",
  16: "Idaho",
  18: "Indiana",
  19: "Iowa",
  20: "Kansas",
  21: "Kentucky",
  22: "Louisiana",
  23: "Maine",
  24: "Maryland",
  25: "Massachusetts",
  27: "Minnesota",
  28: "Mississippi",
  29: "Missouri",
  32: "Nevada",
  33: "New Hampshire",
  34: "New Jersey",
  35: "New Mexico",
  36: "New York",
  37: "North Carolina",
  38: "North Dakota",
  39: "Ohio",
  40: "Oklahoma",
  41: "Oregon",
  42: "Pennsylvania",
  44: "Rhode Island",
  45: "South Carolina",
  46: "South Dakota",
  47: "Tennessee",
  48: "Texas",
  49: "Utah",
  50: "Vermont",
  51: "Virginia",
  53: "Washington",
  54: "West Virginia",
  55: "Wisconsin",
  56: "Wyoming",
};

// get the data in asyncThunk
export const getDataSet = createAsyncThunk(
  "communities/fetchData",
  async (args, thunkAPI) => {
    try {
      const response = await fetch("data/communities.csv");
      const responseText = await response.text();
      console.log("loaded file length:" + responseText.length);
      const responseJson = Papa.parse(responseText, {
        header: true,
        dynamicTyping: true,
      });

      // Perform some cleanup and setup on the data
      return responseJson.data
        .filter(
          (item) =>
            item.communityname &&
            item.ViolentCrimesPerPop !== "?" &&
            item.ViolentCrimesPerPop != null &&
            item.medIncome !== "?" &&
            item.medIncome != null &&
            item.population !== "?" &&
            item.population != null,
        )
        .map((item, i) => ({
          ...item,
          id: i,
          state: FIPS_TO_STATE[item.state] || `State ${item.state}`,
          communityname: item.communityname
            .replace(
              /(city|township|borough|village|division|district|town|valle)$/i,
              "",
            )
            .replace(/([a-z])([A-Z])/g, "$1 $2")
            .trim(),
        }));
      // when a result is returned, extraReducer below is triggered with the case setSeoulBikeData.fulfilled
    } catch (error) {
      console.error("error catched in asyncThunk" + error);
      return thunkAPI.rejectWithValue(error);
    }
  },
);

export const dataSetSlice = createSlice({
  name: "dataSet",
  initialState: [],
  reducers: {
    // add reducer if needed
  },
  extraReducers: (builder) => {
    builder.addCase(getDataSet.pending, (state, action) => {
      console.log("extraReducer getDataSet.pending");
      // do something with state, e.g. to change a status
    });
    builder.addCase(getDataSet.fulfilled, (state, action) => {
      return action.payload;
    });
    builder.addCase(getDataSet.rejected, (state, action) => {
      // Add any fetched house to the array
      const error = action.payload;
      console.log("extraReducer getDataSet.rejected with error" + error);
    });
  },
});

// Action creators are generated for each case reducer function
// export const { reducerAction } = dataSetSlice.actions

export default dataSetSlice.reducer;
