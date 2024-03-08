'use client';

import Cookies from 'js-cookie';
// import XMLParser from "react-xml-parser";
import localforage from 'localforage';
import axios from 'axios';
// import { userData } from "@/app/pages/Default/page";
// import { useUserData } from "@/app/hooks/useAuth";
import imageCompression from 'browser-image-compression';
import localForage from 'localforage';
import {
	getMedicalAssessments,
	getPrefillXML,
	getSubmissionXML,
	sendLogs,
	uploadMedia
} from '../api';
import { store } from '../../redux/store';

export const makeHasuraCalls = async (query, userData) =>
	fetch(process.env.NEXT_PUBLIC_HASURA_URL, {
		method: 'POST',
		headers: {
			Accept: 'application/json',
			'Content-Type': 'application/json',
			Authorization: `Bearer ${userData?.user.token}`
		},
		body: JSON.stringify(query)
	})
		.then(async (response) => await validateResponse(response))
		.catch((error) => error);

const validateResponse = async (response) => {
	const apiRes = await response.json();
	const jsonResponse = {
		...apiRes,
		responseStatus: false
	};
	return jsonResponse;
};

export const makeDataForPrefill = (prev, xmlDoc, key, finalObj, formName) => {
	if (Array.isArray(xmlDoc) && xmlDoc.length == 0 && prev.value) {
		finalObj[key] = prev.value;
	} else {
		for (const el in xmlDoc) {
			makeDataForPrefill(
				xmlDoc[el],
				xmlDoc[el].children,
				`${key}_*_${xmlDoc[el].name}`,
				finalObj,
				formName
			);
		}
	}
};

export const updateFormData = async (startingForm) => {
	try {
		const data = await getFromLocalForage(
			`${startingForm}${new Date().toISOString().split('T')[0]}`
		);
		const prefilledForm = await getSubmissionXML(startingForm, data.formData, data.imageUrls);
		return prefilledForm;
	} catch (err) {}
};

export const setCookie = (cname, cvalue) => {
	try {
		Cookies.set(cname, JSON.stringify(cvalue));
	} catch (error) {
		return false;
	}
};

export const getCookie = (cname) => {
	try {
		const cookie = Cookies.get(cname);
		if (cookie) return JSON.parse(cookie);
	} catch (error) {
		return false;
	}
};

export const logout = () => {
	localStorage.clear();
	sessionStorage.clear();
	window.location = '/';
	localforage.removeItem('appEnvs');
	removeCookie('userData');
};

export const removeCookie = (cname) => {
	try {
		Cookies.remove(cname);
		return true;
	} catch (error) {
		return false;
	}
};

export const isImage = (key, filename) => {
	if (
		filename.includes('.png') ||
		filename.includes('.tif') ||
		filename.includes('.tiff') ||
		filename.includes('.jpg') ||
		filename.includes('.jpeg') ||
		filename.includes('.bmp') ||
		filename.includes('.gif') ||
		filename.includes('.eps')
	)
		return true;
	if (key.includes('img') || key.includes('image')) return true;
	return false;
};

export const getFromLocalForage = async (key, isLoggedIn = true, userData) => {
	const user = userData;
	console.log(user);
	try {
		if (isLoggedIn) return await localforage.getItem(`${user?.user.id}_${key}`);
		return await localforage.getItem(key);
	} catch (err) {
		console.log(err);
		return null;
	}
};

export const setToLocalForage = async (key, value, isLoggedIn = true, user) => {
	// const user = getCookie("userData");
	console.log(user);
	if (isLoggedIn) await localforage.setItem(`${user?.user.id}_${key}`, value);
	else await localforage.setItem(key, value);
};

export const handleFormEvents = async (startingForm, afterFormSubmit, e, user) => {
	// const user = getCookie("userData");
	const appEnvs = await getFromLocalForage('appEnvs', false);
	const ENKETO_URL = process.env.NEXT_PUBLIC_ENKETO_URL;

	if (e.origin == ENKETO_URL && JSON.parse(e?.data)?.state !== 'ON_FORM_SUCCESS_COMPLETED') {
		console.log('Form Change Event------->', e);
		// var formData = new XMLParser().parseFromString(JSON.parse(e.data).formData);
		const { formData } = JSON.parse(e.data);
		if (formData) {
			const images = JSON.parse(e.data).fileURLs;
			const prevData = await getFromLocalForage(
				`${startingForm}${new Date().toISOString().split('T')[0]}`
			);
			console.log('Local Forage Data ---->', prevData);
			await setToLocalForage(
				`${startingForm}${new Date().toISOString().split('T')[0]}`,
				{
					formData: JSON.parse(e.data).formData,
					imageUrls: { ...prevData?.imageUrls, ...images }
				},
				true,
				user
			);
		}
	}
	afterFormSubmit(e);
};

export const getFormData = async ({
	loading,
	scheduleId,
	formSpec,
	startingForm,
	formId,
	setData,
	setEncodedFormSpec,
	setEncodedFormURI
}) => {
	const res = await getMedicalAssessments();
	if (res?.data?.assessment_schedule?.[0]) {
		loading.current = true;
		const ass = res?.data?.assessment_schedule?.[0];
		scheduleId.current = ass.id;
		setData({
			schedule_id: ass.id,
			id: ass.institute.id,
			district: ass.institute.district,
			instituteName: ass.institute.name,
			specialization: ass.institute?.institute_specializations?.[0]?.specializations,
			courses: ass.institute?.institute_types?.[0]?.types,
			type: ass.institute.sector,
			latitude: ass.institute.latitude,
			longitude: ass.institute.longitude
		});
		const formData = await getFromLocalForage(
			`${startingForm}${new Date().toISOString().split('T')[0]}`
		);
		console.log('Form Data Local Forage --->', formData);
		if (formData) {
			setEncodedFormSpec(encodeURI(JSON.stringify(formSpec.forms[formId])));
			const prefilledForm = await getPrefillXML(
				startingForm,
				formSpec.forms[formId].onSuccess,
				formData.formData,
				formData.imageUrls
			);
			console.log('Prefilled Form:', prefilledForm);
			setEncodedFormURI(prefilledForm);
			// setEncodedFormURI(
			//   getFormURI(
			//     formId,
			//     formSpec.forms[formId].onSuccess,
			//     formData
			//   )
			// );
		} else {
			const prefilledForm = await getPrefillXML(startingForm, formSpec.forms[formId].onSuccess);
			console.log('Prefilled Form Empty:', prefilledForm);
			setEncodedFormURI(prefilledForm);
		}
	} else setData(null);
	loading.current = false;
};

// export const cacheForms = async (formName) => {
//   const user = getCookie("userData");
//   console.log("userData:", user)
//   console.log("Caching Forms ... ");
//   let prefilledFormUrl = await getPrefillXML(formName, {});
//   console.log(prefilledFormUrl)
//   let transformedForm = await axios.get('http://localhost:8085/transform?xform=' + prefilledFormUrl);
//   console.log("Trans form:", transformedForm.data)
//   setToLocalForage(formName, transformedForm.data);
// }

// export const compressImage = async (imageFile) => {
// 	const options = {
// 		maxSizeMB: 0.1,
// 		maxWidthOrHeight: 1920,
// 		useWebWorker: true,
// 		fileType: 'image/webp'
// 	};

// 	const compressedFile = await imageCompression(imageFile, options);
// 	console.log('compressedFile instanceof Blob', compressedFile instanceof Blob); // true
// 	console.log(`compressedFile size ${compressedFile.size / 1024 / 1024} MB`); // smaller than maxSizeMB

// 	return compressedFile;
// };

export const compressImage = async (imageFile, flag, disableuserlogs) => {
	const user = store?.getState()?.userData?.user;
	const options = {
		maxSizeMB: 0.1,
		maxWidthOrHeight: 1920,
		useWebWorker: flag?.enabled ? flag?.value?.split(',')?.includes(user?.user?.username) : true,
		fileType: 'image/webp'
	};
	try {
		const compressedFile = flag?.enabled
			? flag?.value?.split(',')?.includes(user?.user?.username)
				? await compressImageToTargetSize(imageFile)
				: await imageCompression(imageFile, options)
			: await imageCompression(imageFile, options);
		// const compressedFile =  await compressImageToTargetSize(imageFile) ;
		return compressedFile;
	} catch (err) {
		if (imageFile instanceof Blob) {
			// let uploadedFile = await uploadMedia([imageFile], user)
			//  sendLogs({ meta: `at compressImage inside if, fileName: ${imageFile?.name}, minioName: ${JSON.stringify(uploadedFile)}`, gpId: store?.getState().userData?.user?.user?.username, error: err?.message || err?.toString(), useWebWorker: flag?.enabled ? flag?.value?.split(',')?.includes(user?.user?.username) : true }, disableuserlogs?.enabled ? disableuserlogs?.value?.split(',')?.includes(user?.user?.username) : true)
			return imageFile;
		}

		const uploadedFile = await uploadMedia([imageFile], user);
		sendLogs(
			{
				meta: `at compressImage inside else, fileName: ${
					imageFile?.name
				}, minioName: ${JSON.stringify(uploadedFile)}`,
				gpId: store?.getState().userData?.user?.user?.username,
				error: err?.message || err?.toString(),
				useWebWorker: flag?.enabled ? flag?.value?.split(',')?.includes(user?.user?.username) : true
			},
			disableuserlogs?.enabled
				? disableuserlogs?.value?.split(',')?.includes(user?.user?.username)
				: true
		);
		throw new Error('Invalid File Type');
	}
};

const compressImageToTargetSize = (
	file,
	targetSizeKB = 1000,
	maxWidth = 1920,
	maxHeight = 1080,
	step = 0.05,
	quality = 0.7
) =>
	new Promise((resolve, reject) => {
		const img = new Image();
		img.src = URL.createObjectURL(file);
		img.onload = () => {
			let { width } = img;
			let { height } = img;

			if (width > height) {
				if (width > maxWidth) {
					height *= maxWidth / width;
					width = maxWidth;
				}
			} else if (height > maxHeight) {
				width *= maxHeight / height;
				height = maxHeight;
			}

			const attemptCompression = (quality) => {
				const canvas = document.createElement('canvas');
				canvas.width = width;
				canvas.height = height;
				const ctx = canvas.getContext('2d');
				ctx.drawImage(img, 0, 0, width, height);
				canvas.toBlob(
					(blob) => {
						if (blob.size / 1024 > targetSizeKB && quality > step) {
							// Check if the size is larger than target
							attemptCompression(quality - step); // Reduce quality
						} else {
							resolve(blob);
						}
					},
					'image/jpeg',
					quality
				);
			};

			attemptCompression(quality);
		};
		img.onerror = reject;
	});

export const storeImages = async (data, disableuserlogs) => {
	try {
		const imageRecords = (await localForage.getItem('imageRecords')) || [];
		imageRecords.push(data);
		return await localForage.setItem('imageRecords', imageRecords);
	} catch (err) {
		// const user = store?.getState()?.userData?.user;
		// let uploadedFiles = await uploadMedia([data.images], user)
		// sendLogs({ meta: `at storeImages, minioNames: ${JSON.stringify(uploadedFiles)}`, gpId: store?.getState().userData?.user?.user?.username, error: err?.message || err?.toString() }, disableuserlogs?.enabled ? disableuserlogs?.value?.split(',')?.includes(user?.user?.username) : true)
		throw err;
	}
};

// export const storeImages = async (data) => {
// 	const imageRecords = (await localForage.getItem('imageRecords')) || [];
// 	imageRecords.push(data);
// 	return await localForage.setItem('imageRecords', imageRecords);
// };

export const getImages = async () => await localForage.getItem('imageRecords');

export const getImagesForVillage = async (villageId) => {
	const imageRecords = await getImages();
	if (imageRecords?.length > 0) {
		return imageRecords.filter((el) => el.villageId === villageId);
	}
	return [];
};

export const getImagesForSubmission = async (submissionId) => {
	const imageRecords = await getImages();
	if (imageRecords?.length > 0) {
		return imageRecords.filter((el) => el.citizenId === submissionId);
	}
	return [];
};

export const getCitizenImageRecords = async (citizenId) => {
	const imageRecords = await getImages();
	if (imageRecords?.length > 0) {
		const landRecords = imageRecords.filter(
			(el) => el.citizenId === citizenId && el.isLandRecord
		)?.[0];
		const rorRecords = imageRecords.filter(
			(el) => el.citizenId === citizenId && !el.isLandRecord
		)?.[0];
		return { landRecords, rorRecords };
	}
	return {};
};

export const removeCitizenImageRecord = async (citizenId) => {
	const images = await getImages();
	if (images?.length > 0) {
		const imageRecords = images.filter((el) => el.citizenId != citizenId);
		await localForage.setItem('imageRecords', imageRecords);
	}
};

const d = [
	[0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
	[1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
	[2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
	[3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
	[4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
	[5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
	[6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
	[7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
	[8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
	[9, 8, 7, 6, 5, 4, 3, 2, 1, 0]
];

// permutation table
const p = [
	[0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
	[1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
	[5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
	[8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
	[9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
	[4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
	[2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
	[7, 0, 4, 6, 9, 1, 3, 2, 5, 8]
];

// validates Aadhar number received as string
function isBcryptHash(str) {
	// Bcrypt hashes typically start with $2a$, $2b$, $2y$, or $2x$
	const bcryptRegex = /^\$2[aybx]\$[0-9]{2}\$.{53}$/;
	return bcryptRegex.test(str);
}
export function validateAadhaar(aadharNumber) {
	if (isBcryptHash(aadharNumber)) {
		return true;
	}
	let c = 0;
	const invertedArray = aadharNumber.split('').map(Number).reverse();

	invertedArray.forEach((val, i) => {
		c = d[c][p[i % 8][val]];
	});

	return c === 0;
}

// Function to split the array into chunks of a specified size
export const chunkArray = (arr, size) => {
	const chunks = [];
	for (let i = 0; i < arr.length; i += size) {
		chunks.push(arr.slice(i, i + size));
	}
	return chunks;
};

// Sleep function to introduce a delay
export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Sanitize Form before saving in redux store
export const sanitizeForm = (form) => {
	if (form.forestLandType == 'revenueForest' && form.typeOfBlock != 'jungleBlock') {
		delete form.compartmentNo;
	}
	if (form.forestLandType == 'reservedForest') {
		delete form.typeOfBlock;
		if (form.fraPlotsClaimed) {
			for (let i = 1; i <= form.fraPlotsClaimed; i++) {
				delete form[`plotNumber${i}`];
			}
		}
		delete form.fraPlotsClaimed;
	}
	return form;
};

export const checkTokenValidity = () => {
	const userData = store.getState()?.userData?.user;
	let days = 999;
	if (userData) {
		const timeleft = userData.tokenExpirationInstant - new Date().getTime();
		days = Math.ceil(timeleft / 1000 / 60 / 60 / 24);
	}
	return days || 999;
};

export const refreshToken = async () => {
	const userData = store.getState()?.userData?.user;
	if (userData) {
		const res = await getNewToken(userData.refreshToken, userData.token);
		if (res?.result?.user) {
			store.dispatch(
				updateUserToken({
					token: res.result.user.token,
					refreshToken: res.result.user.refreshToken,
					tokenExpirationInstant: res.result.user.tokenExpirationInstant
				})
			);
		}
	}
};
