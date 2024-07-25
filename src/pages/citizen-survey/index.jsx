/* eslint-disable no-await-in-loop */
/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable no-nested-ternary */

'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter, useParams, usePathname, useSearchParams } from 'next/navigation';
import Lottie from 'react-lottie';
import { useOfflineSyncContext } from 'offline-sync-handler-test';

import { logEvent } from 'firebase/analytics';
import CircularProgress from '@mui/material/CircularProgress';
import moment from 'moment';
import { MobileStepper } from '@mui/material';
import { toast } from 'react-toastify';
import * as Sentry from '@sentry/nextjs';
import { filter } from 'lodash';
import { useFlags } from 'flagsmith/react';
import * as submissionLottie from '../../utils/lottie/submission.json';
import { analytics } from '../../services/firebase/firebase';
import {
	compressImage,
	getCitizenImageRecords,
	getImages,
	removeCitizenImageRecord,
	storeImages,
	sanitizeForm,
	toBase64
} from '../../services/utils';
import Banner from '../../components/Banner';
import Breadcrumb from '../../components/Breadcrumb';
import { saveCitizenFormData } from '../../redux/actions/saveCitizenFormData';
import { getStorageQuota, sendLogs } from '../../services/api';
import CitizenForm from '../../components/CitizenForm';
import CommonModal from '../../components/Modal';
import styles from './index.module.scss';

// Lottie Options
const defaultOptions = {
	loop: true,
	autoplay: true,
	animationData: submissionLottie,
	rendererSettings: {
		preserveAspectRatio: 'xMidYMid slice'
	}
};

const CitizenSurveyPage = ({ params, props }) => {
	/* Util Hooks */
	const { sendRequest } = useOfflineSyncContext();
	const router = useRouter();
	const searchParam = useSearchParams();
	const dispatch = useDispatch();

	const isFeedbackPage = searchParam.get('isFeedback');
	/* Use States */
	const [hydrated, setHydrated] = React.useState(false);
	const [formState, setFormState] = useState({});
	const [landImages, setLandImages] = useState([]);
	const [rorImages, setRorImages] = useState([]);
	const [rorPdfs, setRorPdfs] = useState([]);
	const [totalSteps, setTotalSteps] = useState(0);
	const [activeStep, setActiveStep] = useState(0);
	const [formStartTime, setFormStartTime] = useState(moment().valueOf());

	const user = useSelector((state) => state?.userData?.user?.user);
	const _currLocation = useSelector((state) => state?.userData?.currentLocation);
	const currCitizen = useSelector((state) => state?.userData?.currentCitizen);
	const [submittedModal, showSubmittedModal] = useState(false);
	const [isMobile, setIsMobile] = useState(true);
	const [loading, setLoading] = useState(false);
	const [saveSuccess, setSaveSuccess] = useState(false);
	const { usemainworker } = useFlags(['usemainworker']);
	const { disableuserlogs } = useFlags(['disableuserlogs']);
	const user2 = useSelector((state) => state?.userData?.user);
	const submissions = useSelector((state) =>
		filter(state?.userData?.submissions?.[_currLocation?.villageCode], { isUpdate: true })
	);
	const isFlaggedEntry = useMemo(() => !!currCitizen?.feedback, [currCitizen?.feedback]);
	console.log('CURR CITIZEN -->', currCitizen);

	const getImagesFromStore = useCallback(async () => {
		let { landRecords, rorRecords } = await getCitizenImageRecords(currCitizen.citizenId);
		if (currCitizen?.submissionData && Object.keys(currCitizen?.submissionData)?.length > 0) {
			if (landRecords?.images?.length) setLandImages(landRecords.images)
			if (rorRecords?.images?.length) {
				let rr = rorRecords?.images;
				for (let i = 0; i < rr?.length; i++) {
					if (rr[i]?.type == 'application/pdf') rr[i] = await toBase64(rr[i]);
				}
				setRorImages(rr)
			}
		}
	}, [currCitizen.citizenId, currCitizen?.submissionData]);

	const feedbacks = useMemo(() => {
		if (!isFlaggedEntry) return null;
		return currCitizen?.feedback?.feedbackData;
	}, [currCitizen?.feedback?.feedbackData, isFlaggedEntry]);

	console.log({ feedbacks });
	/* Use Effects */
	useEffect(() => {
		setHydrated(true);
		if (window.innerWidth < 769) setIsMobile(true);
		else setIsMobile(false);
		if (currCitizen?.status === 'SUBMITTED') {
			setFormState(currCitizen.submissionData);
		} else if (currCitizen?.status === 'FLAGGED') {
			const updated = filter(submissions, { citizenId: currCitizen?.citizenId })?.[0]
				?.submissionData;
			if (updated) setFormState(updated);
			else setFormState(currCitizen?.submissionData);
		} else if (
			currCitizen?.submissionData &&
			Object.keys(currCitizen?.submissionData)?.length > 0
		) {
			console.log('holacd: else2', currCitizen);
			setFormState(currCitizen.submissionData);
		}
		getImagesFromStore();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [currCitizen?.status, currCitizen.submissionData, getImagesFromStore]);

	useEffect(() => {
		setFormStartTime(moment().valueOf());
		logEvent(analytics, 'form_start', {
			villageId: _currLocation.villageCode,
			villageName: _currLocation.villageName,
			user_id: user?.username,
			app_status: navigator.onLine ? 'online' : 'offline',
			capturedAt: moment().utc(),
			time: new Date().toISOString()
		});
	}, []);

	/* Util Functions */

	const handleUpdate = useCallback(async () => {
		if (loading) return;
		let newFormState;

		try {
			const indexDbStats = await getStorageQuota();

			logEvent(analytics, 'form-filling_time', {
				user_id: user?.username,
				villageId: _currLocation.villageCode,
				time: (moment().valueOf() - formStartTime) / 1000 / 60
			});
			setLoading(true);
			showSubmittedModal(true);
			const capturedAt = moment().utc();
			const newLandImages = filter(landImages, (lImg) => typeof lImg !== 'string');
			var newRorImages = filter(rorImages, (lImg) => typeof lImg !== 'string');
			setTotalSteps((newLandImages?.length || 0) + (newRorImages?.length || 0));

			for (const el in newLandImages) {
				const compressedImg = await compressImage(
					newLandImages[el].file,
					usemainworker,
					disableuserlogs
				);
				setActiveStep(Number(el) + 1);
				newLandImages[el] = compressedImg;
			}

			for (const el in newRorImages) {
				const compressedImg = await compressImage(
					newRorImages[el].file,
					usemainworker,
					disableuserlogs
				);
				setActiveStep((newLandImages?.length || 0) + Number(el) + 1);

				newRorImages[el] = compressedImg;
			}

			if (!indexDbStats.isAvailable) {
				toast.error('Device space full, please make space before continuing');
				setLoading(false);
				showSubmittedModal(false);
				return;
			}

			if (!landImages?.length) {
				toast.error('Land images cannot be empty!');
				setLoading(false);
				showSubmittedModal(false);
				return;
			}

			newRorImages = [...newRorImages, ...(rorPdfs?.filter(el => el?.file != null)?.map(x => x?.file) || [])]

			if (newLandImages?.length)
				await storeImages(
					{
						citizenId: currCitizen.citizenId,
						images: newLandImages,
						isLandRecord: true,
						villageId: _currLocation.villageCode
					},
					disableuserlogs
				);
			if (newRorImages?.length)
				await storeImages(
					{
						citizenId: currCitizen.citizenId,
						images: newRorImages,
						isLandRecord: false,
						villageId: _currLocation.villageCode
					},
					disableuserlogs
				);

			newFormState = sanitizeForm({ ...formState });

			// newFormState['landRecords'] = landImages;
			// newFormState['rorRecords'] = rorImages;
			newFormState.imageUploaded = false;
			if (!formState?.isAadhaarAvailable) {
				delete formState?.aadharNumber;
			}
			if (!formState?.rorUpdated) {
				delete formState?.khataNumber;
				delete formState?.landImages;
			}
			if (!formState?.coClaimantAvailable) {
				delete formState?.coClaimantName;
			}
			console.log('hola:', { newFormState });

			dispatch(
				saveCitizenFormData({
					submissionData: newFormState,
					spdpVillageId: _currLocation.villageCode,
					citizenId: currCitizen.citizenId,
					submitterId: user.username,
					isUpdate: true,
					capturedAt
				})
			).then(async (res) => {
				if (res?.type?.includes('fulfilled')) {
					setSaveSuccess(true);
					logEvent(analytics, 'form_saved', {
						villageId: _currLocation.villageCode,
						villageName: _currLocation.villageName,
						user_id: user?.username,
						app_status: navigator.onLine ? 'online' : 'offline',
						capturedAt
					});
				} else {
					sendLogs(
						{
							meta: 'at handleSubmit citizenSurvey inside try',
							gpId: user2?.user?.username,
							error: res?.error || JSON.stringify(res),
							currentForm: newFormState
						},
						disableuserlogs?.enabled
							? disableuserlogs?.value?.split(',')?.includes(user2?.user?.username)
							: true
					);
					toast.warn(`Something went wrong while saving form, ${JSON.stringify(res?.error)}`);
					removeCitizenImageRecord(currCitizen.citizenId);
					setLoading(false);
					showSubmittedModal(false);
					logEvent(analytics, 'unable_to_save_form', {
						villageId: _currLocation.villageCode,
						villageName: _currLocation.villageName,
						user_id: user?.username,
						app_status: navigator.onLine ? 'online' : 'offline',
						capturedAt,
						res: JSON.stringify(res)
					});
					Sentry.captureException({ err: res?.error || JSON.stringify(res), user });
				}
			});

			setLoading(false);
		} catch (err) {
			if (err?.message === 'Invalid File Type' || err === 'Invalid File Type') {
				toast.error(`Please check your media files, some of the files may be corrupt or invalid.`);
			} else {
				Sentry.captureException({ err: err?.message || err?.toString(), user });
				toast.error(`An error occurred while saving: ${err?.message || err?.toString()}`);
				return;
			}
			setLoading(false);
			showSubmittedModal(false);
		}
	}, [
		_currLocation.villageCode,
		_currLocation.villageName,
		currCitizen.citizenId,
		dispatch,
		formStartTime,
		formState,
		landImages,
		loading,
		rorImages,
		user,
		user2?.user?.username,
		disableuserlogs,
		usemainworker
	]);
	// const handleUpdate = useCallback(async () => {
	// 	if (loading) return;
	// 	try {
	// 		logEvent(analytics, 'form-filling_time', {
	// 			user_id: user?.username,
	// 			villageId: _currLocation.villageCode,
	// 			time: (moment().valueOf() - formStartTime) / 1000 / 60
	// 		});
	// 		setLoading(true);
	// 		showSubmittedModal(true);
	// 		const capturedAt = moment().utc();
	// 		setTotalSteps((landImages?.length || 0) + (rorImages?.length || 0));
	// 		console.log('checks', { landImages, formState });
	// 		const newLandImages = filter(landImages, (lImg) => typeof lImg !== 'string');
	// 		Object.values(newLandImages).forEach(async (image, index) => {
	// 			const compressedImg = await compressImage(image.file);
	// 			setActiveStep(index + 1);
	// 			newLandImages[index] = compressedImg;
	// 		});

	// 		const newRorImages = filter(rorImages, (rImg) => typeof rImg !== 'string');
	// 		Object.values(newRorImages).forEach(async (image, index) => {
	// 			const compressedImg = await compressImage(image.file);
	// 			setActiveStep(index + 1);
	// 			newRorImages[index] = compressedImg;
	// 		});
	// 		console.log('checks:', { newRorImages, newLandImages });
	// 		// Object.values(rorImages).forEach(async (image, index) => {
	// 		// 	const compressedImg = await compressImage(image.file);
	// 		// 	setActiveStep((landImages?.length || 0) + index + 1);
	// 		// 	rorImages[index] = compressedImg;
	// 		// });

	// 		if (newLandImages?.length)
	// 			await storeImages({
	// 				citizenId: currCitizen.citizenId,
	// 				images: newLandImages,
	// 				isLandRecord: true,
	// 				villageId: _currLocation.villageCode
	// 			});
	// 		if (newRorImages?.length)
	// 			await storeImages({
	// 				citizenId: currCitizen.citizenId,
	// 				images: newRorImages,
	// 				isLandRecord: false,
	// 				villageId: _currLocation.villageCode
	// 			});

	// 		const newFormState = sanitizeForm({ ...formState });

	// 		newFormState.imageUploaded = false;
	// 		if (!formState?.isAadhaarAvailable) {
	// 			delete formState?.aadharNumber;
	// 		}
	// 		if (!formState?.rorUpdated) {
	// 			delete formState?.khataNumber;
	// 			delete formState?.landImages;
	// 		}
	// 		if (!formState?.coClaimantAvailable) {
	// 			delete formState?.coClaimantName;
	// 		}
	// 		console.log('checks:', { newFormState });
	// 		dispatch(
	// 			saveCitizenFormData({
	// 				submissionData: newFormState,
	// 				spdpVillageId: _currLocation.villageCode,
	// 				citizenId: currCitizen.citizenId,
	// 				submitterId: user.username,
	// 				capturedAt
	// 			})
	// 		).then(async (res) => {
	// 			if (res?.type?.includes('fulfilled')) {
	// 				setSaveSuccess(true);
	// 				logEvent(analytics, 'form_saved', {
	// 					villageId: _currLocation.villageCode,
	// 					villageName: _currLocation.villageName,
	// 					user_id: user?.username,
	// 					app_status: navigator.onLine ? 'online' : 'offline',
	// 					capturedAt
	// 				});
	// 			} else {
	// 				await sendLogs(res, user2);
	// 				toast.warn(`Something went wrong while saving form, ${JSON.stringify(res?.error)}`);
	// 				removeCitizenImageRecord(currCitizen.citizenId);
	// 				setLoading(false);
	// 				showSubmittedModal(false);
	// 				logEvent(analytics, 'unable_to_save_form', {
	// 					villageId: _currLocation.villageCode,
	// 					villageName: _currLocation.villageName,
	// 					user_id: user?.username,
	// 					app_status: navigator.onLine ? 'online' : 'offline',
	// 					capturedAt,
	// 					res: JSON.stringify(res)
	// 				});
	// 				Sentry.captureException({ err: res?.error, user });
	// 			}
	// 		});
	// 		// }

	// 		setLoading(false);
	// 	} catch (err) {
	// 		Sentry.captureException({ err, user });
	// 		toast.error('An error occurred while saving', err?.message || err?.toString());
	// 		console.log(err);
	// 		setLoading(false);
	// 	}
	// }, [
	// 	_currLocation.villageCode,
	// 	_currLocation.villageName,
	// 	currCitizen.citizenId,
	// 	dispatch,
	// 	formStartTime,
	// 	formState,
	// 	landImages,
	// 	loading,
	// 	rorImages,
	// 	user,
	// 	user2
	// ]);
	const handleSubmit = async () => {
		if (loading) return;
		let newFormState;
		try {
			const indexDbStats = await getStorageQuota();

			logEvent(analytics, 'form-filling_time', {
				user_id: user?.username,
				villageId: _currLocation.villageCode,
				time: (moment().valueOf() - formStartTime) / 1000 / 60
			});
			setLoading(true);
			showSubmittedModal(true);
			let capturedAt = moment().utc();
			setTotalSteps((landImages?.length || 0) + (rorImages?.length || 0))

			newFormState = sanitizeForm({ ...formState });

			console.log("SANITIZED FORM ---->", newFormState)
			// newFormState['landRecords'] = landImages;
			// newFormState['rorRecords'] = rorImages;
			newFormState['imageUploaded'] = false;

			// Fetch aadhar vault reference if aadhaar available
			if (newFormState?.isAadhaarAvailable) {
				const config = {
					method: "POST",
					url: `https://adv.odisha.gov.in/AadhaarVaultEncryption/rest/getRefFromAadhaar`,
					data: {
						aadhaarNo: newFormState?.aadharNumber,
						schemeId: 17
					}
				};

				const res = await sendRequest(config);
				const vaultReference = res?.aadhaarDetails?.referenceNo;
				console.log("Res --->", vaultReference)

				if (!vaultReference) {
					toast.info("Cannot assign Aadhaar vault reference as you're offline right now. Your request has been saved");
					// return;
				} else newFormState['aadhaarVaultReference'] = vaultReference;
			}

			if (!newFormState?.isAadhaarAvailable) {
				delete newFormState?.aadharNumber;
			}
			if (!newFormState?.rorUpdated) {
				delete newFormState?.khataNumber;
				delete newFormState?.landImages;
			}
			if (!newFormState?.coClaimantAvailable) {
				delete newFormState?.coClaimantName;
			}


			for (let el in landImages) {
				const compressedImg = await compressImage(landImages[el].file, usemainworker, disableuserlogs);
				setActiveStep(Number(el) + 1);
				landImages[el] = compressedImg;
			}

			for (let el in rorImages) {
				const compressedImg = await compressImage(rorImages[el].file, usemainworker, disableuserlogs);
				setActiveStep((landImages?.length || 0) + Number(el) + 1);

				rorImages[el] = compressedImg;
			}
			const newRorImages = [...rorImages, ...rorPdfs?.map(el => el?.file)];

			if (!indexDbStats.isAvailable) {
				toast.error("Device space full, please make space before continuing");
				setLoading(false);
				showSubmittedModal(false);
				return;
			}

			if (!landImages?.length) {
				toast.error("Land images cannot be empty!");
				setLoading(false);
				showSubmittedModal(false);
				return;
			}

			if (landImages?.length) await storeImages(
				{
					citizenId: currCitizen.citizenId,
					images: landImages,
					isLandRecord: true,
					villageId: _currLocation.villageCode
				},
				disableuserlogs
			);
			if (newRorImages?.length) await storeImages(
				{
					citizenId: currCitizen.citizenId,
					images: newRorImages,
					isLandRecord: false,
					villageId: _currLocation.villageCode
				},
				disableuserlogs
			);

			dispatch(
				saveCitizenFormData({
					submissionData: newFormState,
					spdpVillageId: _currLocation.villageCode,
					citizenId: currCitizen.citizenId,
					submitterId: user.username,
					isUpdate: false,
					capturedAt
				})
			).then(async (res) => {
				if (res?.type?.includes('fulfilled')) {
					setSaveSuccess(true);
					logEvent(analytics, "form_saved", {
						villageId: _currLocation.villageCode,
						villageName: _currLocation.villageName,
						user_id: user?.username,
						app_status: navigator.onLine ? 'online' : 'offline',
						capturedAt: capturedAt
					});
				}
				else {
					sendLogs({
						meta: 'at handleSubmit citizenSurvey inside try', gpId: user2?.user?.username, error: res?.error || JSON.stringify(res), currentForm: newFormState
					}, disableuserlogs?.enabled ? disableuserlogs?.value?.split(',')?.includes(user2?.user?.username) : true);
					toast.warn("Something went wrong while saving form, " + JSON.stringify(res?.error));
					removeCitizenImageRecord(currCitizen.citizenId);
					setLoading(false);
					showSubmittedModal(false)
					logEvent(analytics, "unable_to_save_form", {
						villageId: _currLocation.villageCode,
						villageName: _currLocation.villageName,
						user_id: user?.username,
						app_status: navigator.onLine ? 'online' : 'offline',
						capturedAt: capturedAt,
						res: JSON.stringify(res)
					});
					Sentry.captureException({ err: res?.error || JSON.stringify(res), user });
				}
			})
			// }

			setLoading(false);

		} catch (err) {
			if (err?.message == 'Invalid File Type' || err == 'Invalid File Type') {
				toast.error(`Please check your media files, some of the files may be corrupt or invalid.`)
			} else {
				Sentry.captureException({ err: err?.message || err?.toString(), user });
				toast.error(`An error occurred while saving: ${err?.message || err?.toString()}`)
				// sendLogs({
				//   meta: 'at handleSubmit citizenSurveyPage inside catch',
				//   gpId: user2?.user?.username,
				//   error: err?.message || err?.toString(),
				//   currentForm: newFormState
				// }, disableuserlogs?.enabled ? disableuserlogs?.value?.split(',')?.includes(user2?.user?.username) : true)
				return;
			}
			// sendLogs({
			//   meta: 'at handleSubmit citizenSurveyPage inside catch after else',
			//   gpId: user2?.user?.username,
			//   error: err?.message || err?.toString(),
			//   currentForm: newFormState
			// }, disableuserlogs?.enabled ? disableuserlogs?.value?.split(',')?.includes(user2?.user?.username) : true)
			console.log(err);
			setLoading(false);
			showSubmittedModal(false);
		}
	};

	const breadcrumbItems = useMemo(
		() => [
			{ label: 'Home', to: '/' },
			{ label: _currLocation.villageName, to: '/survey' },
			{ label: 'Land Survey' }
		],
		[_currLocation.villageName]
	);
	console.log('holacd:', { formState });
	return !hydrated ? null : (
		<>
			<div className={styles.root}>
				<Banner />
				<Breadcrumb items={breadcrumbItems} />
				<CitizenForm
					isFeedbackPage={!!isFeedbackPage}
					feedbacks={feedbacks}
					formEditable={
						!(
							currCitizen?.status === 'SUBMITTED' ||
							(currCitizen?.submissionData && Object?.keys(currCitizen?.submissionData))?.length > 0
						) || currCitizen?.status === 'FLAGGED'
					}
					handleSubmit={handleSubmit}
					handleUpdate={handleUpdate}
					setFormState={setFormState}
					formState={formState}
					currCitizen={currCitizen}
					submittedModal={submittedModal}
					savedEntries={
						(currCitizen?.status === 'FLAGGED'
							? false
							: currCitizen?.submissionData &&
							Object?.keys(currCitizen?.submissionData)?.length > 0 &&
							currCitizen?.status !== 'SUBMITTED') || false
					}
					rorImages={rorImages}
					setRorImages={setRorImages}
					landImages={landImages}
					setLandImages={setLandImages}
					rorPdfs={rorPdfs}
					setRorPdfs={setRorPdfs}
				/>

				{submittedModal && (
					<CommonModal
						sx={{ maxHeight: '55vh', maxWidth: '90vw', overflow: 'scroll', padding: '1rem' }}
					>
						{loading ? (
							<div
								style={{
									display: 'flex',
									flexDirection: 'column',
									width: '100%',
									height: '100%',
									justifyContent: 'center',
									alignItems: 'center'
								}}
							>
								<CircularProgress color="success" size={50} />
								<p style={{ textAlign: 'center', padding: '2rem 0rem' }}>
									Please wait while we compress and optimize images
								</p>
								<MobileStepper
									variant="progress"
									steps={totalSteps}
									position="static"
									activeStep={activeStep}
									sx={{ width: '130vw', marginRight: '-63vw', marginBottom: '1rem' }}
								/>
								<p>
									{activeStep}/{totalSteps}
								</p>
							</div>
						) : saveSuccess ? (
							<div className={styles.submitModal}>
								<div>
									<Lottie
										options={defaultOptions}
										style={{ marginTop: -40 }}
										height={200}
										width={200}
									/>
								</div>
								<div
									style={{
										display: 'flex',
										flexDirection: 'column',
										width: '100%',
										justifyContent: 'center',
										alignItems: 'center'
									}}
								>
									<p style={{ fontSize: '1.5rem', marginTop: -40, fontWeight: 600 }}>
										Land Title Data Saved
									</p>
									<p>You will get edit access after next cycle</p>
									<p>Please get the filled form validated by GP/Tehsildar before syncing</p>
									<div
										onClick={() => router.back()}
										style={{
											width: '100%',
											display: 'flex',
											justifyContent: 'center',
											alignItems: 'center',
											background: '#017922',
											height: '3.5rem',
											borderRadius: '0.75rem',
											color: '#fff',
											marginTop: 30,
											cursor: 'pointer'
										}}
									>
										Return to Village Screen
									</div>
								</div>
							</div>
						) : (
							<></>
						)}
					</CommonModal>
				)}
				<style>
					{`
        .MuiInputLabel-outlined {
        margin-left: -14px;
                    }
                `}
				</style>
			</div>
		</>
	);
};

export default CitizenSurveyPage;
