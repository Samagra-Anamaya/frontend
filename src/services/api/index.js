import axios, { AxiosError, AxiosResponse } from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { isNull, omitBy } from 'lodash';
import { store } from '../../redux/store';
import packageJson from '../../../package.json';

const APP_VERSION = packageJson.version;
// const BASE_URL = process.env.NEXT_PUBLIC_USER_SERVICE_URL;
// const applicationId = process.env.NEXT_PUBLIC_APPLICATION_ID;
// const BACKEND_SERVICE_URL = process.env.NEXT_PUBLIC_BACKEND_SERVICE_URL;
// const USER = store.getState().userData.user;

export const getEnvVariables = () => ({
	BASE_URL: process.env.NEXT_PUBLIC_USER_SERVICE_URL,
	applicationId: process.env.NEXT_PUBLIC_APPLICATION_ID,
	BACKEND_SERVICE_URL: process.env.NEXT_PUBLIC_BACKEND_SERVICE_URL
});

export const getUser = () => store.getState().userData.user;
export const userLogin = async (username, pass) => {
	try {
		const res = await axios.post(`${getEnvVariables().BASE_URL}login`, {
			password: pass,
			loginId: username,
			applicationId: getEnvVariables().applicationId
		});
		return res.data;
	} catch (err) {
		return err;
	}
};

export const getVillageDetails = async (id) => {
	try {
		const user = store?.getState()?.userData?.user;
		const res = await axios.get(
			`${getEnvVariables().BACKEND_SERVICE_URL}/utils/villageData/${id}`,
			{
				headers: {
					Authorization: `Bearer ${user.token}`
				}
			}
		);
		return res.data;
	} catch (err) {
		return err;
	}
};

export const getVillageSubmissions = async (id, page, token, status = 'PFA') => {
	try {
		const params = omitBy(
			{
				page,
				status,
				limit: 5
			},
			isNull
		);
		const res = await axios.get(`${getEnvVariables().BACKEND_SERVICE_URL}/submissions/${id}`, {
			params,
			headers: {
				Authorization: `Bearer ${token}`
			}
		});
		return res.data;
	} catch (err) {
		console.log(err);
		return null;
	}
};

export const searchCitizen = async (villageId, query, user) => {
	try {
		const res = await axios.get(
			`${getEnvVariables().BACKEND_SERVICE_URL}/submissions/search/${villageId}/${query}`,
			{
				headers: {
					Authorization: `Bearer ${user?.token}`
				}
			}
		);
		return res.data;
	} catch (err) {
		console.log(err);
		return null;
	}
};

export const getEntriesMade = async (user) => {
	try {
		const res = await axios.get(
			`${getEnvVariables().BACKEND_SERVICE_URL}/submissions/enumerator/${user?.user?.uniqueUsername
			}?page=1&limit=1`,
			{
				headers: {
					Authorization: `Bearer ${user?.token}`
				}
			}
		);
		return res.data;
	} catch (err) {
		console.log(err);
		return null;
	}
};

export const uploadMedia = async (files) => {
	try {
		console.log({ files });
		const data = new FormData();
		files.forEach((file) => {
			data.append('files', file, `${uuidv4()}.webp`);
		});
		const res = await axios.post(`${getEnvVariables().BACKEND_SERVICE_URL}/upload/multiple`, data, {
			headers: {
				Authorization: `Bearer ${getUser().token}`
			}
		});
		return res.data.map((images) => images?.result?.filename);
	} catch (err) {
		return { err };
	}
};

export const getImageFromMinio = async (filename, user) => {
	const res = await axios.get(`${getEnvVariables().BACKEND_SERVICE_URL}/upload/${filename}`, {
		headers: {
			Authorization: `Bearer ${user?.token}`
		}
	});
	return res?.data?.includes('http://minio:9000')
		? res?.data?.replace('http://minio:9000', process.env.NEXT_PUBLIC_MINIO_SERVICE_URL)
		: res?.data;
};

export const getStorageQuota = () =>
	new Promise((resolve, reject) => {
		if (navigator.storage && navigator.storage.estimate) {
			navigator.storage.estimate().then((estimate) => {
				const availableSpace = estimate.quota - estimate.usage;
				resolve({
					quota: estimate.quota,
					usage: estimate.usage,
					available: availableSpace,
					isAvailable: availableSpace > 104857600
				});
			});
		} else {
			resolve({ quota: 0, usage: 0, available: 0, isAvailable: 0 });
		}
	});

// export const sendLogs = async (data, user) => {
// 	const res = await axios.post(
// 		`${getEnvVariables().BACKEND_SERVICE_URL}/utils/logSubmissionError`,
// 		data,
// 		{
// 			headers: {
// 				Authorization: `Bearer ${user?.token}`
// 			}
// 		}
// 	);
// 	return res?.data;
// };
// eslint-disable-next-line consistent-return
export const sendLogs = async (data, enabled = true) => {
	try {
		if (enabled) {
			const indexDbStats = await getStorageQuota();
			const res = await axios.post(
				`${getEnvVariables().BACKEND_SERVICE_URL}/utils/logSubmissionError`,
				{
					appVersion: APP_VERSION,
					deviceInfo: navigator.userAgent,
					timestamp: Date.now(),
					quota: `${indexDbStats ? indexDbStats.quota / 1000000 : 0} MB`,
					usage: `${indexDbStats ? indexDbStats.usage / 1000000 : 0} MB`,
					available: `${indexDbStats ? indexDbStats.available / 1000000 : 0} MB`,
					...data
				}
			);
			return res?.data;
		}
	} catch (err) {
		console.log({ err });
	}
};

export const getNewToken = async (refreshToken, token) => {
	try {
		const res = await axios.post(
			`${getEnvVariables().BASE_URL}refresh-token`,
			{
				refreshToken,
				token
			},
			{
				headers: {
					'x-application-id': `${getEnvVariables().applicationId}`
				}
			}
		);
		return res?.data;
	} catch (err) {
		console.log(err);
		return null;
	}
};

export const updateAppVersion = async () => {
	return axios.post(BACKEND_SERVICE_URL + `/utils/updateAppVersion`, {
		appVersion: APP_VERSION,
		createdAt: new Date()
	});
}

export const getAppVersion = async () => {
	return axios.get(BACKEND_SERVICE_URL + `/utils/getAppVersion`);
}

export const getAadharVaultReference = async (aadhaarNo) => {
	try {
		let res = await axios.post('http://117.239.112.230/AadhaarVaultEncryption/rest/getRefFromAadhaar', {
			aadhaarNo,
			schemeId: 17
		});
		return res?.data?.aadhaarDetails?.referenceNo;
	} catch (err) {
		return false;
	}
}
