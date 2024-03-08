/* eslint-disable no-restricted-syntax */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/img-redundant-alt */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { MDBListGroupItem } from 'mdbreact';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, CircularProgress } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { filter, omit } from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import { useOfflineSyncContext } from 'offline-sync-handler-test';
import { toast } from 'react-toastify';
import * as Sentry from '@sentry/nextjs';

import FileUploadIcon from '@mui/icons-material/FileUpload';
import { getImagesForSubmission } from '../../services/utils';
import { replaceMediaObject } from '../../redux/actions/replaceMediaObject';
import { clearSubmission, tokenSelector } from '../../redux/store';
import { getEnvVariables } from '../../services/api';

const FlaggedItem = (props) => {
	const {
		leftImage,
		submission,
		mainText,
		mainSubtext,
		onClick,
		onSubBtnClick,
		onSecondaryAction,
		secondaryImage = null,
		secondaryLoading = false,
		clName
	} = props;
	const offlinePackage = useOfflineSyncContext();
	const dispatch = useDispatch();
	const userData = useSelector((state) => state?.userData);
	const [isLoading, setIsLoading] = useState(false);
	const token = useSelector(tokenSelector);
	const [submissionImages, setSubmissionImages] = useState(null);
	const _currLocation = useSelector((state) => state?.userData?.currentLocation);
	const [reFetch, setRefetch] = useState(false);
	const submissions = useSelector((state) =>
		filter(state?.userData?.submissions?.[_currLocation?.villageCode], { isUpdate: true })
	);

	useEffect(() => {
		const fetchImages = async () => {
			const images = await getImagesForSubmission(submission?.citizenId);
			return filter(images, { citizenId: submission?.citizenId });
		};
		fetchImages().then((res) => {
			setSubmissionImages(res);
		});
	}, [submission?.citizenId, reFetch]);

	const isImagesAvailable = useMemo(() => !!submissionImages?.length, [submissionImages?.length]);

	async function onMediaUpload() {
		const _BACKEND_SERVICE_URL = process.env.NEXT_PUBLIC_BACKEND_SERVICE_URL;

		setIsLoading(true);
		const promises = [];

		for (const _image of submissionImages) {
			const data = new FormData();
			_image?.images.forEach((file) => {
				data.append('files', file || file.file, `${uuidv4()}.webp`);
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
						if (res?.type.includes('fulfilled')) {
							// setIsMediaUploaded(true);
							setSubmissionImages(null);
						}
						promises.push(res);
					});
				}
			} catch (error) {
				Sentry.captureException({ error, userData });
			}
		}

		promises.forEach((res) => {
			if (res === undefined || !res || res?.name === 'AxiosError') {
				return;
			}
			if (res?.type.includes('fulfilled')) {
				setSubmissionImages(null);
				setRefetch(true);
			}
		});

		setIsLoading(false);
	}

	const isDataSubmitted = useMemo(
		() => !filter(submissions, { citizenId: submission?.citizenId }).length > 0,
		[submission?.citizenId, submissions]
	);

	const updatedData = useMemo(
		() => filter(submissions, { citizenId: submission?.citizenId })?.[0],
		[submission?.citizenId, submissions]
	);

	const onSubmit = useCallback(async () => {
		setIsLoading(true);

		const newSubmissionData = {
			...filter(submissions, { citizenId: submission?.citizenId })?.[0],
			status: 'PFA'
		};

		const config = {
			method: 'PUT',
			url: `${getEnvVariables().BACKEND_SERVICE_URL}/submissions/${submission?.id}`,
			data: newSubmissionData,
			headers: {
				Authorization: `Bearer ${token}`
			},
			timeout: process.env.NEXT_PUBLIC_REQUEST_TIMEOUT
		};
		try {
			const response = await offlinePackage?.sendRequest(config);

			if (response) {
				setIsLoading(false);
			}
			if (response?.name === 'AxiosError') {
				Sentry.captureException({ response, userData });
				toast.error(
					`Something went wrong:${response?.response?.data?.message || response?.message}`
				);

				setIsLoading(false);
			} else if (response && response?.result?.updateSubmission) {
				dispatch(clearSubmission(submission));
				setTimeout(() => {
					window.location.reload();
				}, 1000);
			} else if (!response || response === undefined) {
				Sentry.captureException({ response, userData });
				toast.warn(
					"Your request has been saved, it'll be submitted once you're back in connection"
				);
				// setIsOfflineResponse(true);
			} else {
				toast.error(
					`An error occured while submitting form. Please try again \nError String : ${JSON.stringify(
						response
					)}`
				);
				// checkSavedRequests();

				// responses.push(response);
			}
		} catch (error) {
			console.error('Error Submitting Submission Data: ', error);
			Sentry.captureException({ error, userData });
		}
	}, [dispatch, offlinePackage, submission, submissions, token, userData]);

	return (
		<MDBListGroupItem
			className={`d-flex justify-content-between align-items-center ${clName}  p-2`}
			style={{ borderRadius: '10px', marginBottom: '5px', ...props.sx }}
		>
			<div className="d-flex align-items-center" onClick={onClick ?? null}>
				<img
					src={leftImage}
					alt=""
					style={{ width: '45px', height: '45px', marginRight: '10px' }}
					className="rounded-circle"
				/>
				<div className="ms-3">
					<p className="fw-bold mb-1 bold">
						{(updatedData?.submissionData?.claimantName ?? mainText) || 'N/A'}
					</p>
					<p className="text-muted mb-0" style={{ fontSize: '12px' }}>
						{mainSubtext || 'N/A'}
					</p>
				</div>
			</div>
			{isImagesAvailable && !isLoading && !isDataSubmitted && (
				<FileUploadIcon onClick={onMediaUpload} />
			)}
			{!isDataSubmitted && !isImagesAvailable && !isLoading && (
				<Button onClick={onSubmit}>Update</Button>
			)}
			{isLoading && <CircularProgress color="success" />}

			{secondaryImage && (
				<>
					{secondaryLoading ? (
						<CircularProgress color="success" />
					) : (
						<img
							alt="image"
							src={secondaryImage}
							onClick={
								onSecondaryAction
									? (ev) => {
											ev.preventDefault();
											ev.stopPropagation();
											onSecondaryAction();
									  }
									: null
							}
							style={{ width: '40px', height: '40px' }}
						/>
					)}
				</>
			)}
		</MDBListGroupItem>
	);
};

export default FlaggedItem;
