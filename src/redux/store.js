import { configureStore, createSlice, current } from "@reduxjs/toolkit";
import { cloneDeep, forEach, map } from "lodash";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage"; // defaults to localStorage for web
import { replaceMediaObject } from "./actions/replaceMediaObject";
import { _updateSubmissionMedia } from "./actions/updateSubmissionMedia";
import { removeSubmission } from "./actions/removeSubmission";
// import storage from 'redux-persist-indexeddb-storage';

// const authSlice = createSlice({
//   name: 'auth',
//   initialState: {
//     isAuthenticated: false,
//     user: null,
//     location: null,
//     formSubmitted: [],
//   },
//   reducers: {
//     login: (state, action) => {
//       state.isAuthenticated = true;
//       state.user = action.payload;
//     },
//     logoutUser: (state) => {
//       state.isAuthenticated = false;
//       state.user = null;
//     },
//     coordinates: (state, action) => {
//       state.location = action.payload;
//     },
//     form: (state, action) => {
//       state.formSubmitted.push(action.payload); // Push the new form name into the array
//     },
//   },
// });

const userDataSlice = createSlice({
  name: "userData",
  initialState: {
    isAuthenticated: false,
    user: null,
    assignedLocations: [],
    currentLocation: {},
    currentCitizen: {},
    forms: {},
    searchQuery: {},
    searchSavedQuery: {},
    submissions: {},
    status: "",
    error: {},
    isOffline: false,
    pendingSubmissions: []
  },
  reducers: {
    login: (state, action) => {
      state.isAuthenticated = true;
      state.user = action.payload;
      state.assignedLocations = action.payload?.user?.data?.villages;
    },
    logoutUser: (state) => {
      console.log("Logging user out")
      state.isAuthenticated = false;
      state.user = null;
      state.assignedLocations = [];
      state.currentLocation = {};
      state.currentCitizen = {};
      state.forms = {};
      state.searchQuery = {};
      state.searchSavedQuery = {};
      state.submissions = {};
      state.status = {};
      state.error = {};
      state.isOffline = false;
      state.pendingSubmissions = [];
    },
    setCurrentLocation: (state, action) => {
      state.currentLocation = action.payload;
    },
    setAssignedLocations: (state, action) => {
      state.assignedLocations = action.payload;
    },
    addCitizen: (state, action) => {
      const currLocIndex = state.assignedLocations.findIndex(
        (el) => el.villageCode == state.currentLocation.villageCode
      );
      console.log("FIND CURRENT-->", currLocIndex);
      console.log(
        "Add Citizen --->",
        current(state.currentLocation),
        action.payload
      );
      let newCurrLocation = {
        ...state.currentLocation,
        citizens: [
          ...(state?.currentLocation?.citizens || []),
          { citizenId: action.payload.id },
        ],
      };
      state.currentLocation = newCurrLocation;
      state.assignedLocations = [
        ...state.assignedLocations.slice(0, currLocIndex),
        newCurrLocation,
        ...state.assignedLocations.slice(currLocIndex + 1),
      ];
    },
    addFormUri: (state, action) => {
      state.forms = {
        ...state.forms,
        [action.payload.formId]: action.payload.formUrl,
      };
    },
    saveCitizenFormData: (state, action) => {
      // state.submissions = { ...state?.submissions, [action.payload.spdpVillageId]: [...(state?.submissions?.[action.payload.spdpVillageId] || []), action.payload.formData] }
      state.submissions = {
        ...state?.submissions,
        [action.payload.spdpVillageId]: [
          ...(state?.submissions?.[action.payload.spdpVillageId] || []),
          action.payload,
        ],
      };
    },
    bulkSaveSubmission: (state, action) => {
      state.submissions = action.payload;

    },
    updateCitizenFormData: (state, action) => {
      let submissionArray = state.submissions[action.payload.spdpVillageId];
      const submissionIndex = submissionArray.findIndex(
        (submission) => submission.citizenId === action.payload.citizenId
      );

      if (submissionIndex !== -1) {
        submissionArray[submissionIndex] = {
          ...action.payload,
        };
      }

      state.submissions = {
        ...state.submissions,
        [action.payload.spdpVillageId]: submissionArray,
      };
    },
    updateSubmissionMedia: (state, action) => {
      console.log({ state: cloneDeep(state), action });
      const villageData = map(
        state?.submissions?.[action?.payload?.villageId],
        (item, index) => {
          return item?.citizenId === action?.payload?.citizenId
            ? {
              ...item,
              submissionData: action?.payload?.isLandRecord
                ? {
                  ...item.submissionData,
                  landRecords: action?.payload?.images,
                }
                : {
                  ...item.submissionData,
                  rorRecords: action?.payload?.images,
                },
            }
            : item;
        }
      );
      state.submissions = {
        ...state.submissions,
        [action.payload.villageId]: villageData,
      };
    },
    clearSubmissions: (state, action) => {
      let tempState = state?.submissions;
      delete tempState[action.payload];
      state.submissions = tempState;
    },
    setCurrentCitizen: (state, action) => {
      state.currentCitizen = action.payload;
    },
    updateSearchQuery: (state, action) => {
      state.searchQuery = {
        ...state.searchQuery,
        [action.payload.villageId]: action.payload.query,
      };
    },
    updateSearchSavedQuery: (state, action) => {
      state.searchSavedQuery = {
        ...state.searchSavedQuery,
        [action.payload.villageId]: action.payload.query,
      };
    },
    updateIsOffline: (state, action) => {
      state.isOffline = action.payload
    },
    clearSubmissionBatch: (state, action) => {
      let currSubmission = current(state.submissions[action.payload[0]?.spdpVillageId]);
      let newSubmissions = currSubmission.filter(el => el.citizenId != action.payload.find(x => x.citizenId == el.citizenId)?.citizenId);
      state.submissions[action.payload[0]?.spdpVillageId] = newSubmissions;
    },
    updatePendingSubmissions: (state, action) => {
      state.pendingSubmissions = action.payload
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(replaceMediaObject.fulfilled, (state, action) => {
        state.status = "succeeded";
        forEach(action?.payload?.result, (fileData) => {
          const fileMeta = JSON.parse(fileData?.meta);
          state.submissions[fileMeta.villageId] = map(
            state.submissions[fileMeta.villageId],
            (prev) => {
              if (prev?.citizenId === fileMeta?.citizenId) {
                if (fileMeta?.isLandRecord)
                  return {
                    ...prev,
                    submissionData: {
                      ...prev?.submissionData,
                      landRecords: prev?.submissionData?.landRecords
                        ? [
                          ...prev?.submissionData?.landRecords,
                          fileData.filename,
                        ]
                        : [fileData.filename],
                    },
                  };
                else
                  return {
                    ...prev,
                    submissionData: {
                      ...prev?.submissionData,
                      rorRecords: prev?.submissionData?.rorRecords
                        ? [
                          ...prev?.submissionData?.rorRecords,
                          fileData.filename,
                        ]
                        : [fileData.filename],
                    },
                  };
              } else return prev
            }
          );
        });
        return state;
      })
      .addCase(replaceMediaObject.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(_updateSubmissionMedia.fulfilled, (state, action) => {
        console.log("shri ram _updateSubmissionMedia:", { state: cloneDeep(state), action });
        forEach(action?.payload, (fileData) => {
          const fileMeta = JSON.parse(fileData?.meta);
          state.submissions[fileMeta.villageId] = map(
            state.submissions[fileMeta.villageId],
            (prev) => {
              if (prev?.citizenId === fileMeta?.citizenId) {
                if (fileMeta?.isLandRecord)
                  return {
                    ...prev,
                    submissionData: {
                      ...prev?.submissionData,
                      landRecords: prev?.submissionData?.landRecords
                        ? [
                          ...prev?.submissionData?.landRecords,
                          fileData.filename,
                        ]
                        : [fileData.filename],
                    },
                  };
                else
                  return {
                    ...prev,
                    submissionData: {
                      ...prev?.submissionData,
                      rorRecords: prev?.submissionData?.rorRecords
                        ? [
                          ...prev?.submissionData?.rorRecords,
                          fileData.filename,
                        ]
                        : [fileData.filename],
                    },
                  };
              } else return prev
            }
          );
        });
        return state;
        // const villageData = map(
        //   state?.submissions?.[action?.payload?.villageId],
        //   (item, index) => {
        //     return item?.citizenId === action?.payload?.citizenId
        //       ? {
        //           ...item,
        //           submissionData: action?.payload?.isLandRecord
        //             ? {
        //                 ...item.submissionData,
        //                 landRecords: action?.payload?.images,
        //               }
        //             : {
        //                 ...item.submissionData,
        //                 rorRecords: action?.payload?.images,
        //               },
        //         }
        //       : item;
        //   }
        // );
        // state.submissions = {
        //   ...state.submissions,
        //   [action.payload.villageId]: villageData,
        // };
      }).addCase(removeSubmission.fulfilled, (state, action) => {
        let tempState = state?.submissions;
        forEach(Object.keys(action.payload), (key) => {
          delete tempState[key];
        })
        state.submissions = tempState;
      })
  },
});

const persistConfig = {
  key: "root", // key for the root of the storage
  storage,
  // storage: storage('myDB') // storage to use (e.g., localStorage)
};

const persistedUserDataReduces = persistReducer(
  persistConfig,
  userDataSlice.reducer
);

const store = configureStore({
  reducer: {
    // Using persisted reducers
    userData: persistedUserDataReduces,
  },
});

const persistor = persistStore(store);

export const {
  login,
  logoutUser,
  setCurrentLocation,
  setAssignedLocations,
  addCitizen,
  saveCitizenFormData,
  addFormUri,
  setCurrentCitizen,
  updateSearchQuery,
  updateSearchSavedQuery,
  clearSubmissions,
  updateCitizenFormData,
  updateSubmissionMedia,
  updateIsOffline,
  bulkSaveSubmission,
  clearSubmissionBatch,
  updatePendingSubmissions
} = userDataSlice.actions;

export { store, persistor };

export const tokenSelector = (state) => state?.userData?.user?.token;
export const allSubmissionsSelector = (state) => state?.userData?.submissions;