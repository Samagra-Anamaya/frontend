import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { store } from '../../redux/store';

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

export const getVillageSubmissions = async (id, page, token) => {
	try {
		const res = await axios.get(
			`${getEnvVariables().BACKEND_SERVICE_URL}/submissions/${id}?limit=5&page=${page}`,
			{
				headers: {
					Authorization: `Bearer ${token}`
				}
			}
		);
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
			`${getEnvVariables().BACKEND_SERVICE_URL}/submissions/enumerator/${
				user?.user?.uniqueUsername
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

export const sendLogs = async (data, user) => {
	const res = await axios.post(
		`${getEnvVariables().BACKEND_SERVICE_URL}/utils/logSubmissionError`,
		data,
		{
			headers: {
				Authorization: `Bearer ${user?.token}`
			}
		}
	);
	return res?.data;
};
