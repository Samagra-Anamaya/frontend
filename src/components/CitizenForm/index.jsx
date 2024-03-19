/* eslint-disable no-nested-ternary */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */

'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Stepper, Step, StepLabel } from '@mui/material';

import 'react-datepicker/dist/react-datepicker.css';
import { toast } from 'react-toastify';
import 'react-responsive-carousel/lib/styles/carousel.min.css'; // requires a loader

import { useSelector } from 'react-redux';
import { validateAadhaar } from '../../services/utils';
import { getImageFromMinio } from '../../services/api';

import Step1 from '../FormSteps/Step1';
import Step2 from '../FormSteps/Step2';
import Step3 from '../FormSteps/Step3';

const steps = ['Aadhaar Details', 'Tribe & Land Details', 'Plot Details'];

const CitizenForm = (props) => {
	const {
		handleSubmit,
		setFormState,
		formState,
		submittedModal,
		formEditable,
		savedEntries = false,
		setLandImages,
		setRorImages,
		rorImages,
		landImages,
		feedbacks,
		isFeedbackPage,
		handleUpdate
	} = props;

	const [activeStep, setActiveStep] = useState(0);
	const user = useSelector((state) => state?.userData?.user);

	const handleLandImages = (imageList) => {
		setLandImages(imageList);
	};

	const handleRorImages = (imageList) => {
		setRorImages(imageList);
	};

	const getRecordImages = useCallback(async () => {
		if (formState?.landRecords?.length) {
			const landImagesPromises = Object.entries(formState.landRecords).map(async ([key, value]) => {
				const imageUri = await getImageFromMinio(value, user);
				return imageUri;
			});

			const _landImages = await Promise.all(landImagesPromises);
			setLandImages(_landImages);
		}
		if (formState?.rorRecords?.length) {
			const rorImagesPromises = Object.entries(formState.rorRecords).map(async ([key, value]) => {
				const imageUri = await getImageFromMinio(value, user);
				return imageUri;
			});

			const _rorImages = await Promise.all(rorImagesPromises);
			setRorImages(_rorImages);
		}
	}, [formState.landRecords, formState.rorRecords, setLandImages, setRorImages, user]);

	useEffect(() => {
		getRecordImages();
	}, [getRecordImages]);

	const onFormSubmit = useCallback(
		(e) => {
			e.preventDefault();
			if (formEditable && formState?.aadharNumber && !validateAadhaar(formState?.aadharNumber)) {
				toast('Please enter a valid Aadhaar Number!', {
					type: 'error'
				});
				return;
			}
			setActiveStep(1);
		},
		[formEditable, formState]
	);

	return (
		<>
			<Stepper
				activeStep={activeStep}
				alternativeLabel
				sx={{ width: window.innerWidth > 500 ? '100%' : '100vw', marginBottom: '1rem' }}
			>
				{steps.map((label) => (
					<Step key={label}>
						<StepLabel>{label}</StepLabel>
					</Step>
				))}
			</Stepper>
			{activeStep === 0 && (
				<Step1
					isFeedbackPage={isFeedbackPage}
					onFormSubmit={onFormSubmit}
					formEditable={formEditable}
					formState={formState}
					setFormState={setFormState}
					savedEntries={savedEntries}
					feedbacks={feedbacks}
				/>
			)}
			{activeStep === 1 && (
				<Step2
					isFeedbackPage={isFeedbackPage}
					feedbacks={feedbacks}
					setActiveStep={setActiveStep}
					formEditable={formEditable}
					setFormState={setFormState}
					formState={formState}
					landImages={landImages}
					handleLandImages={handleLandImages}
				/>
			)}
			{activeStep === 2 && (
				<Step3
					isFeedbackPage={isFeedbackPage}
					setActiveStep={setActiveStep}
					formEditable={formEditable}
					setFormState={setFormState}
					formState={formState}
					rorImages={rorImages}
					handleRorImages={handleRorImages}
					handleSubmit={handleSubmit}
					submittedModal={submittedModal}
					feedbacks={feedbacks}
					handleUpdate={handleUpdate}
				/>
			)}
		</>
	);
};

export default CitizenForm;
