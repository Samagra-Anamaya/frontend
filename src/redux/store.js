/* eslint-disable no-unsafe-optional-chaining */
import { configureStore, createSlice, current } from "@reduxjs/toolkit";
import { cloneDeep, forEach, map } from "lodash";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage"; // defaults to localStorage for web
import { replaceMediaObject } from "./actions/replaceMediaObject";
import { _updateSubmissionMedia } from "./actions/updateSubmissionMedia";
import { _updateSubmissionEntries } from "./actions/updateSubmissionEntries";
import { saveCitizenFormData } from "./actions/saveCitizenFormData";
import { removeSubmission } from "./actions/removeSubmission";
import { ptBR } from "@mui/x-date-pickers";
import { loginUser } from "./actions/login";
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
	name: 'userData',
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
		status: '',
		error: {},
		isOffline: false,
		canSubmit: true,
		pendingSubmissions: []
	},
	reducers: {
		login: (state, action) => {
			state.isAuthenticated = true;
			state.user = action.payload;
			state.assignedLocations = action.payload?.user?.data?.villages;
		},
		logoutUser: (state) => {
			console.log('Logging user out');
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
				// eslint-disable-next-line eqeqeq
				(el) => el.villageCode == state.currentLocation.villageCode
			);

			const newCurrLocation = {
				...state.currentLocation,
				citizens: [...(state?.currentLocation?.citizens || []), { citizenId: action.payload.id }]
			};
			state.currentLocation = newCurrLocation;
			state.assignedLocations = [
				...state.assignedLocations.slice(0, currLocIndex),
				newCurrLocation,
				...state.assignedLocations.slice(currLocIndex + 1)
			];
		},
		addFormUri: (state, action) => {
			state.forms = {
				...state.forms,
				[action.payload.formId]: action.payload.formUrl
			};
		},
		// saveCitizenFormData: (state, action) => {
		//   // state.submissions = { ...state?.submissions, [action.payload.spdpVillageId]: [...(state?.submissions?.[action.payload.spdpVillageId] || []), action.payload.formData] }
		//   state.submissions = {
		//     ...state?.submissions,
		//     [action.payload.spdpVillageId]: [
		//       ...(state?.submissions?.[action.payload.spdpVillageId] || []),
		//       action.payload,
		//     ],
		//   };
		// },
		bulkSaveSubmission: (state, action) => {
			state.submissions = action.payload;
		},
		updateCitizenFormData: (state, action) => {
			const submissionArray = state.submissions[action.payload.spdpVillageId];
			const submissionIndex = submissionArray.findIndex(
				(submission) => submission.citizenId === action.payload.citizenId
			);

			if (submissionIndex !== -1) {
				submissionArray[submissionIndex] = {
					...action.payload
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
		updateCanSubmit: (state, action) => {
			state.canSubmit = action.payload
		},
		clearSubmissionBatch: (state, action) => {
			let currSubmission = current(state.submissions[action.payload[0]?.spdpVillageId]);
			let newSubmissions = currSubmission.filter(el => el.citizenId != action.payload.find(x => x.citizenId == el.citizenId)?.citizenId);
			state.submissions[action.payload[0]?.spdpVillageId] = newSubmissions;
		},
		clearSubmission: (state, action) => {
			const currSubmission = state.submissions[action.payload?.spdpVillageId];
			const newSubmissions = currSubmission.filter(
				(el) => el.citizenId !== action.payload?.citizenId
			);

			state.submissions[action.payload?.spdpVillageId] = newSubmissions;
		},
		updatePendingSubmissions: (state, action) => {
			state.pendingSubmissions = action.payload
		},
		updateUserToken: (state, action) => {
			state.user = { ...state.user, token: action.payload.token, refreshToken: action.payload.refreshToken, tokenExpirationInstant: action.payload.tokenExpirationInstant }
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
				console.log("Updating Submission Media ---->", { state: cloneDeep(state), action });
				forEach(action?.payload, (fileData) => {
					const fileMeta = JSON.parse(fileData?.meta);
					state.submissions[fileMeta.villageId] = map(
						state.submissions[fileMeta.villageId],
						(prev) => {
							if (prev?.citizenId === fileMeta?.citizenId) {
								if (fileMeta?.isLandRecord) {
									let prevLandRecords = prev?.submissionData?.landRecords || [];
									if (prevLandRecords?.length) {
										return {
											...prev,
											submissionData: {
												...prev?.submissionData,
												landRecords: prevLandRecords.includes(fileData.filename) ? prevLandRecords : [...prevLandRecords, fileData.filename],
											},
										};
									} else
										return {
											...prev,
											submissionData: {
												...prev?.submissionData,
												landRecords: [fileData.filename],
											},
										};
								}
								else {
									let prevRorRecords = prev?.submissionData?.rorRecords || [];
									if (prevRorRecords?.length) {
										return {
											...prev,
											submissionData: {
												...prev?.submissionData,
												rorRecords: prevRorRecords.includes(fileData.filename) ? prevRorRecords : [...prevRorRecords, fileData.filename],
											},
										};
									} else
										return {
											...prev,
											submissionData: {
												...prev?.submissionData,
												rorRecords: [fileData.filename],
											},
										};
								}
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
			}).addCase(loginUser.fulfilled, (state, action) => {
				state.isAuthenticated = true;
				state.user = action.payload;
				state.assignedLocations = action.payload?.user?.data?.villages;
			}).addCase(saveCitizenFormData.fulfilled, (state, action) => {
				state.submissions = {
					...state?.submissions,
					[action.payload.spdpVillageId]: [
						...(state?.submissions?.[action.payload.spdpVillageId] || []),
						action.payload,
					],
				};
			}).addCase(_updateSubmissionEntries.fulfilled, (state, action) => {
				Object.keys(state.submissions).forEach(x => {
					state.submissions[x] = state.submissions[x]?.map(el => {
						if (el?.submissionData?.aadharNumber == action.payload.aadhaar) {
							return { ...el, submissionData: { ...el.submissionData, aadhaarVaultReference: action.payload.referenceNo } }
						}
						return el;
					})
				})
				return state;
			})
	},
});

const persistConfig = {
	key: 'root', // key for the root of the storage
	storage
	// storage: storage('myDB') // storage to use (e.g., localStorage)
};

const persistedUserDataReduces = persistReducer(persistConfig, userDataSlice.reducer);

const store = configureStore({
	reducer: {
		// Using persisted reducers
		userData: persistedUserDataReduces
	}
});

const persistor = persistStore(store);

export const {
	login,
	logoutUser,
	setCurrentLocation,
	setAssignedLocations,
	addCitizen,
	addFormUri,
	setCurrentCitizen,
	updateSearchQuery,
	updateSearchSavedQuery,
	clearSubmissions,
	updateCitizenFormData,
	updateSubmissionMedia,
	updateIsOffline,
	updateCanSubmit,
	bulkSaveSubmission,
	clearSubmissionBatch,
	updatePendingSubmissions,
	updateUserToken,
	clearSubmission
} = userDataSlice.actions;

export { store, persistor };

export const tokenSelector = (state) => state?.userData?.user?.token;
export const allSubmissionsSelector = (state) => state?.userData?.submissions;
export const currentVillageSubmissions = (state) =>
	state.userData.submissions[state.userData.currentLocation.villageCode];
export const getVillageSubmissions = (id) => (state) => {
	console.log({ id, state: state.userData.submissions });
	return state.userData.submissions[id];
};
export const currentLocationSelector = (state) => state?.userData?.currentLocation;
