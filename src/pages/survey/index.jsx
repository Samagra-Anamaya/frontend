'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { useOfflineSyncContext } from 'offline-sync-handler-test';
import CircularProgress from '@mui/material/CircularProgress';
import { toast } from 'react-toastify';
import { logEvent } from 'firebase/analytics';

import { Button } from '@mui/material';
import Lottie from 'react-lottie';
import isOnline from 'is-online';
import * as Sentry from '@sentry/nextjs';

import { map, omit } from 'lodash';
import { clearSubmissionBatch, setCurrentCitizen, tokenSelector } from '../../redux/store';

import SelectionItem from '../../components/SelectionItem';
import CommonModal from '../../components/Modal';
import { analytics } from '../../services/firebase/firebase';
import * as warning from '../../utils/lottie/warning.json';
import * as done from '../../utils/lottie/done.json';
import Banner from '../../components/Banner';
import Breadcrumb from '../../components/Breadcrumb';
import { chunkArray, getImagesForVillage, sleep } from '../../services/utils';

import { replaceMediaObject } from '../../redux/actions/replaceMediaObject';
import styles from './index.module.scss';
import { surveyPageModalStyles, surveyPageWarningModalStyles } from '../../utils/modal-styles';

const SurveyPage = ({ params }) => {
	/* Component States and Refs */
	const offlinePackage = useOfflineSyncContext();
	const userData = useSelector((state) => state?.userData);
	const [loading, setLoading] = useState(false);
	const [isMediaUploaded, setIsMediaUploaded] = useState(false);
	const _currLocation = useSelector((state) => state?.userData?.currentLocation);
	const submissions = useSelector(
		(state) => state?.userData?.submissions?.[_currLocation?.villageCode]
	);
	const [hydrated, setHydrated] = React.useState(false);
	const [submitModal, showSubmitModal] = useState(false);
	const [submissionCompleted, setSubmissionCompleted] = useState(false);
	const [disableSubmitEntries, setDisableSubmitEntries] = useState(false);
	const [warningModal, showWarningModal] = useState(false);
	const [isOfflineResponse, setIsOfflineResponse] = useState(false);
	const token = useSelector(tokenSelector);
	const router = useRouter();
	const dispatch = useDispatch();
	const containerRef = useRef();

	/* Use Effects */
	useEffect(() => {
		window.scrollTo({ top: 0, behavior: 'smooth' });
		setHydrated(true);
	}, []);

	useEffect(() => {
		if (containerRef.current) {
			containerRef.current.scrollIntoView();
		}
	});

	useEffect(() => {
		if (submissions?.length) {
			let mediaUploaded = false;
			submissions.forEach((submission) => {
				if (
					(!submission?.submissionData?.landRecords?.length &&
						submission?.submissionData?.rorRecords?.length) ||
					(submission?.submissionData?.landRecords?.length &&
						!submission?.submissionData?.rorRecords?.length) ||
					(submission?.submissionData?.landRecords?.length &&
						submission?.submissionData?.rorRecords?.length)
				) {
					mediaUploaded = true;
				} else {
					mediaUploaded = false;
				}
			});
			setIsMediaUploaded(mediaUploaded);
		}
	}, [submissions]);

	const checkSavedRequests = useCallback(async () => {
		const savedRequests = await offlinePackage.getStoredRequests();
		console.log('Saved Requests ->', savedRequests);
		if (savedRequests?.length) {
			const currRequest = savedRequests.filter(
				(el) => el?.meta?.villageId === _currLocation.villageCode
			);
			console.log('curr Reques->', currRequest);
			if (currRequest?.length && submissions?.length > 0) {
				setDisableSubmitEntries(true);
			}
		}
	}, [_currLocation.villageCode, offlinePackage, submissions?.length]);

	useEffect(() => {
		checkSavedRequests();
	}, [checkSavedRequests, loading]);

	useEffect(() => {
		checkSavedRequests();
	}, [checkSavedRequests]);

	/* Utility Functions */
	const addNewCitizen = useCallback(() => {
		if (disableSubmitEntries) {
			showWarningModal(true);
			return;
		}
		const newCitId = uuidv4();
		dispatch(setCurrentCitizen({ citizenId: newCitId }));
		router.push(`/citizen-survey`);
	}, [disableSubmitEntries, dispatch, router]);

	const clearEntriesAndProceed = () => {
		offlinePackage.clearStoredRequests();
		showWarningModal(false);
		const newCitId = uuidv4();
		dispatch(setCurrentCitizen({ citizenId: newCitId }));
		router.push(`/citizen-survey`);
	};

	const breadcrumbItems = useMemo(
		() => [{ label: 'Home', to: '/' }, { label: _currLocation?.villageName }],
		[_currLocation?.villageName]
	);

	async function uploadImagesInBatches() {
		const images = await getImagesForVillage(_currLocation?.villageCode);
		console.log('hola Images for ', _currLocation.villageCode, images);
		const BATCH_SIZE = 10;
		const DELAY_TIME = 3000; // Delay time in milliseconds (5 seconds)
		const _BACKEND_SERVICE_URL = process.env.NEXT_PUBLIC_BACKEND_SERVICE_URL;

		setLoading(true);
		// Splitting the images array into batches of 20
		const batches = chunkArray(images, BATCH_SIZE);

		const promises = [];

		// eslint-disable-next-line no-restricted-syntax
		for (const batch of batches) {
			// eslint-disable-next-line no-restricted-syntax
			for (const _image of batch) {
				const data = new FormData();
				_image?.images.forEach((file) => {
					console.log('holacd:', { file, _image });
					data.append('files', file.file ?? file, `${uuidv4()}.webp`);
				});

				// eslint-disable-next-line no-await-in-loop
				const modifiedMeta = await omit(_image, ['images']);
				data.append('meta', JSON.stringify(modifiedMeta));

				const config = {
					method: 'POST',
					url: `${_BACKEND_SERVICE_URL}/upload/multiple`,
					meta: modifiedMeta,
					data,
					isFormdata: true,
					headers: {
						Authorization: `Bearer ${token}`
					},
					timeout: 120000
				};

				try {
					// eslint-disable-next-line no-await-in-loop
					const response = await offlinePackage?.sendRequest(config);
					if (response?.name === 'AxiosError') {
						if (response?.message === 'Network Error') {
							toast.warn(
								"Your request has been saved, it'll be submitted once you're back in connection"
							);
						} else {
							Sentry.captureException({ response, userData });
							toast.error(
								`Something went wrong:${response?.response?.data?.message || response?.message}`
							);
						}
						promises.push(response);
					} else if (response?.result?.length) {
						dispatch(replaceMediaObject(response)).then((res) => {
							console.log('Dispatch Res ---->', res);
							promises.push(res);
						});
					}
				} catch (error) {
					console.error('Error uploading image', error);
					Sentry.captureException({ error, userData });
				}
			}

			// Introduce a delay before processing the next batch
			// eslint-disable-next-line no-await-in-loop
			await sleep(DELAY_TIME);
		}

		promises.forEach((res) => {
			// In case offline
			if (res === undefined || !res || res?.name === 'AxiosError') {
				showSubmitModal(false);
				checkSavedRequests();
				return;
			}
			if (res?.type.includes('fulfilled')) {
				setIsMediaUploaded(true);
			}
		});

		setLoading(false);
	}

	async function performBatchSubmission() {
		const online = await isOnline();
		if (!online) {
			toast.warn('You are not connected to internet, please try once back in network');
			return;
		}
		const BATCH_SIZE = 10;
		const DELAY_TIME = 3000; // Delay time in milliseconds (5 seconds)
		const BACKEND_SERVICE_URL = process.env.NEXT_PUBLIC_BACKEND_SERVICE_URL;

		setLoading(true);

		const batches = chunkArray(submissions, BATCH_SIZE);
		const responses = [];

		// eslint-disable-next-line no-restricted-syntax, guard-for-in
		for (const el in batches) {
			const batch = batches[el];

			const submissionData = {
				[_currLocation.villageCode]: batch
			};

			const config = {
				method: 'POST',
				url: `${BACKEND_SERVICE_URL}/submissions/bulk`,
				data: submissionData,
				headers: {
					Authorization: `Bearer ${token}`
				},
				timeout: process.env.NEXT_PUBLIC_REQUEST_TIMEOUT
			};

			try {
				// Introduce a delay before processing the next batch
				// eslint-disable-next-line no-await-in-loop
				await sleep(DELAY_TIME);
				// eslint-disable-next-line no-await-in-loop
				const response = await offlinePackage?.sendRequest(config);
				console.log('Batch Submission Response', { response }, response.name);
				if (response?.name === 'AxiosError') {
					Sentry.captureException({ response, userData });
					toast.error(
						`Something went wrong:${response?.response?.data?.message || response?.message}`
					);

					if (el === batches.length - 1) {
						setLoading(false);
						showSubmitModal(false);
						return;
					}
				} else if (response && Object.keys(response)?.length) {
					logEvent(analytics, 'submission_successfull', {
						villageId: _currLocation.villageCode,
						villageName: _currLocation.villageName,
						user_id: userData?.user?.user?.username,
						app_status: navigator.onLine ? 'online' : 'offline'
					});
					responses.push(response);
					dispatch(clearSubmissionBatch(batch));
				} else if (!response || response === undefined) {
					Sentry.captureException({ response, userData });
					toast.warn(
						"Your request has been saved, it'll be submitted once you're back in connection"
					);
					setIsOfflineResponse(true);
				} else {
					toast.error(
						`An error occured while submitting form. Please try again \nError String : ${JSON.stringify(
							response
						)}`
					);
					checkSavedRequests();
					logEvent(analytics, 'submission_failure', {
						villageId: _currLocation.villageCode,
						villageName: _currLocation.villageName,
						user_id: userData?.user?.user?.username,
						app_status: navigator.onLine ? 'online' : 'offline'
					});
					responses.push(response);
				}
			} catch (error) {
				console.error('Error Submitting Submission Data: ', error);
				Sentry.captureException({ error, userData });
			}
		}

		setLoading(false);
		setSubmissionCompleted(true);
	}

	const startSubmission = () => {
		logEvent(analytics, 'submit_entries_clicked', {
			villageId: _currLocation.villageCode,
			villageName: _currLocation.villageName,
			user_id: userData?.user?.user?.username,
			app_status: navigator.onLine ? 'online' : 'offline'
		});
		showSubmitModal(true);
	};

	const selectionItems = useMemo(
		() => [
			{
				id: 1,
				leftImage: '/assets/surveyIcon1.png',
				rightImage: '/assets/circleArrow.png',
				onClick: () => {
					logEvent(analytics, 'add_new_citizen_clicked', {
						villageId: _currLocation.villageCode,
						villageName: _currLocation.villageName,
						user_id: userData?.user?.user?.username
					});
					addNewCitizen();
				},
				mainText: 'Add New Land Record',
				href: null,
				clName: null,
				htmlId: null
			},
			{
				id: 2,
				leftImage: '/assets/assessment.png',
				rightImage: '/assets/circleArrow.png',
				onClick: () => {
					logEvent(analytics, 'completed_entries_clicked', {
						villageId: _currLocation.villageCode,
						villageName: _currLocation.villageName,
						user_id: userData?.user?.user?.username
					});
				},
				mainText: 'View Submitted Titles',
				href: '/synced-titles',
				clName: 'synced',
				htmlId: 'syncedTitles'
			},
			{
				id: 3,
				leftImage: '/assets/surveyIcon3.png',
				rightImage: '/assets/circleArrow.png',
				onClick: () => {
					logEvent(analytics, 'saved_entries_clicked', {
						villageId: _currLocation.villageCode,
						villageName: _currLocation.villageName,
						user_id: userData?.user?.user?.username
					});
				},
				mainText: 'View Saved Titles',
				href: '/saved-entries',
				htmlId: 'submittedTitles'
			},
			{
				id: 4,
				leftImage: '/assets/surveyIcon1.png',
				rightImage: '/assets/circleArrow.png',
				onClick: () => {
					logEvent(analytics, 'view_status_clickde', {
						villageId: _currLocation.villageCode,
						villageName: _currLocation.villageName,
						user_id: userData?.user?.user?.username
					});
				},
				mainText: 'View Request Status',
				href: '/request-status'
			},
			{
				id: 5,
				leftImage: '/assets/surveyIcon1.png',
				rightImage: '/assets/circleArrow.png',
				onClick: () => {
					logEvent(analytics, 'view_flagged_title_clicked', {
						villageId: _currLocation.villageCode,
						villageName: _currLocation.villageName,
						user_id: userData?.user?.user?.username
					});
				},
				mainText: 'View Flagged Titles',
				href: '/flagged-titles',
				clName: 'synced',
				htmlId: 'syncedTitles'
			}
		],
		[
			_currLocation.villageCode,
			_currLocation.villageName,
			addNewCitizen,
			userData?.user?.user?.username
		]
	);

	return !hydrated ? null : (
		<div className={styles.container} ref={containerRef}>
			<Banner />
			<Breadcrumb items={breadcrumbItems} />

			<div className="px-3">
				<p className={styles.headerText}>{_currLocation.villageName} </p>
				<p className={styles.villageCode}>{_currLocation.villageCode}</p>

				{disableSubmitEntries ? (
					<div className={styles.submitBtnDisabled}>Pending Submission to Server</div>
				) : (
					submissions?.length > 0 && (
						<Button
							variant="contained"
							color="success"
							fullWidth
							sx={{ marginBottom: 5 }}
							onClick={startSubmission}
						>
							Submit Saved Titles
						</Button>
					)
				)}

				{map(selectionItems, (item) => (
					<SelectionItem
						key={item.id}
						leftImage={item.leftImage}
						rightImage={item.rightImage}
						onClick={item.onClick}
						mainText={item.mainText}
						href={item.href ?? null}
						clName={item.clName ?? null}
						htmlId={item?.htmlId ?? null}
					/>
				))}
			</div>
			{submitModal && (
				<CommonModal sx={{ maxHeight: '50vh', maxWidth: '80vw', overflow: 'scroll' }}>
					<>
						{loading ? (
							<div style={{ ...surveyPageModalStyles.container, justifyContent: 'center' }}>
								<CircularProgress color="success" size={70} />
							</div>
						) : (
							<div style={surveyPageModalStyles.container}>
								{submissionCompleted ? (
									<>
										<Lottie
											options={{
												loop: true,
												autoplay: true,
												animationData: isOfflineResponse ? warning : done,
												rendererSettings: {
													preserveAspectRatio: 'xMidYMid slice'
												}
											}}
											style={
												!isOfflineResponse && {
													marginTop: -20,
													marginBottom: -40
												}
											}
											height={isOfflineResponse ? 150 : 200}
											width={isOfflineResponse ? 150 : 200}
										/>
										<p
											style={
												isOfflineResponse
													? surveyPageModalStyles.warningOfflineText
													: surveyPageModalStyles.mainText
											}
										>
											{isOfflineResponse
												? `Your request has been saved, it'll be submitted once you're back in connection`
												: 'Land Titles Synced Successfully'}
										</p>
										<Button
											color={isOfflineResponse ? 'warning' : 'success'}
											variant="contained"
											fullWidth
											onClick={() => {
												setSubmissionCompleted(false);
												showSubmitModal(false);
												setIsOfflineResponse(false);
											}}
										>
											{isOfflineResponse ? 'Close' : 'Done'}
										</Button>
									</>
								) : (
									<div style={surveyPageModalStyles.mainContainer}>
										<div style={surveyPageModalStyles.mainText}>
											A total of {submissions?.length} entries will be submitted for{' '}
											{_currLocation.villageName}
										</div>
										<p style={surveyPageModalStyles.warningText}>
											Please ensure you are in good internet connectivity before submitting
										</p>
										<div style={surveyPageModalStyles.btnContainer}>
											{isMediaUploaded ? (
												<Button
													style={surveyPageModalStyles.confirmBtn}
													onClick={() => {
														logEvent(analytics, 'submit_entries_confirm', {
															villageId: _currLocation.villageCode,
															villageName: _currLocation.villageName,
															user_id: userData?.user?.user?.username,
															app_status: navigator.onLine ? 'online' : 'offline'
														});
														performBatchSubmission();
													}}
												>
													Submit
												</Button>
											) : (
												<Button
													style={surveyPageModalStyles.confirmBtn}
													onClick={() => {
														logEvent(analytics, 'submit_entries_confirm', {
															villageId: _currLocation.villageCode,
															villageName: _currLocation.villageName,
															user_id: userData?.user?.user?.username,
															app_status: navigator.onLine ? 'online' : 'offline'
														});
														uploadImagesInBatches();
													}}
												>
													Upload Media
												</Button>
											)}

											<Button
												style={surveyPageModalStyles.exitBtn}
												onClick={() => {
													logEvent(analytics, 'submit_entries_cancelled', {
														villageId: _currLocation.villageCode,
														villageName: _currLocation.villageName,
														user_id: userData?.user?.user?.username,
														app_status: navigator.onLine ? 'online' : 'offline'
													});
													showSubmitModal(false);
												}}
											>
												Cancel
											</Button>
										</div>
									</div>
								)}
							</div>
						)}
					</>
				</CommonModal>
			)}

			{warningModal && (
				<CommonModal sx={{ maxHeight: '30vh', overflow: 'scroll' }}>
					<div style={surveyPageWarningModalStyles.container}>
						<div style={surveyPageWarningModalStyles.warningText}>
							Adding new entries will delete all previous pending submissions in offline mode.
						</div>
						<p style={surveyPageWarningModalStyles.mainText}>
							You will have to re-submit saved titles in villages again {'(your data is safe)'}
						</p>
						<div style={surveyPageWarningModalStyles.btnContainer}>
							<Button
								style={surveyPageWarningModalStyles.confirmBtn}
								onClick={() => {
									clearEntriesAndProceed();
								}}
							>
								Confirm
							</Button>
							<Button
								style={surveyPageWarningModalStyles.exitBtn}
								onClick={() => showWarningModal(false)}
							>
								Cancel
							</Button>
						</div>
					</div>
				</CommonModal>
			)}
		</div>
	);
};

export default SurveyPage;
