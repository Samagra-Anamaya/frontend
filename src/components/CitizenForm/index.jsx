'use client';
/* eslint-disable no-nested-ternary */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */


import { Stepper, Step, StepLabel } from '@mui/material';

import 'react-datepicker/dist/react-datepicker.css';
import 'react-responsive-carousel/lib/styles/carousel.min.css'; // requires a loader


import Step1 from '../FormSteps/Step1';
import Step2 from '../FormSteps/Step2';
import Step3 from '../FormSteps/Step3';

const steps = ['Aadhaar Details', 'Tribe & Land Details', 'Plot Details'];

import React, { useCallback, useEffect, useMemo, useState } from "react";
import styles from "./index.module.scss";
import {
    TextField,
    Button,
    InputLabel,
    Select,
    MenuItem,
    FormControl,
    Tooltip,
    Input
} from "@mui/material";
import { styled } from '@mui/material/styles';
import Autocomplete from '@mui/material/Autocomplete';
import MobileStepper from '@mui/material/MobileStepper';
import ImageUploading from 'react-images-uploading';

import "react-datepicker/dist/react-datepicker.css";
import { toast } from "react-toastify";
import "react-responsive-carousel/lib/styles/carousel.min.css"; // requires a loader
import { Carousel } from 'react-responsive-carousel';
import ImageViewer from 'react-simple-image-viewer';
import { toBase64, validateAadhaar } from "../../services/utils";
import { getImageFromMinio } from "../../services/api";
import { useSelector } from "react-redux";
import { getTbName } from "./tribe-names";

import { Worker } from '@react-pdf-viewer/core';
import { Viewer } from '@react-pdf-viewer/core';

// Import the styles
import '@react-pdf-viewer/core/lib/styles/index.css';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';

// Import styles
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

import { thumbnailPlugin } from '@react-pdf-viewer/thumbnail';

// Import styles
import '@react-pdf-viewer/thumbnail/lib/styles/index.css';
import CommonModal from "../Modal";

const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
});

const CitizenForm = (props) => {
    const defaultLayoutPluginInstance = defaultLayoutPlugin();
    const thumbnailPluginInstance = thumbnailPlugin();
    const { Thumbnails } = thumbnailPluginInstance;
    const { handleSubmit, setFormState, formState, currCitizen, submittedModal, formEditable, mode, savedEntries = false, setLandImages, setRorImages, rorImages, landImages, rorPdfs, setRorPdfs, feedbacks,
        isFeedbackPage,
        handleUpdate } = props;
    const [currentImage, setCurrentImage] = useState(0);
    const [isViewerOpen, setIsViewerOpen] = useState(false);
    const [activeStep, setActiveStep] = useState(0);
    const [currentPdf, setCurrentPdf] = useState(null);
    const [pdfModal, showPdfModal] = useState(false);

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

    // useEffect(() => {
    //     getRecordImages();
    // }, [getRecordImages]);

    const handlePdfUpload = async (e) => {
        let file = e.target.files[0];
        const base64File = await toBase64(file);
        setRorPdfs((prev) => [...prev, { file: file, base64File: base64File }]);
    }

    const handlePdfSelection = (el) => {
        setCurrentPdf(el);
        showPdfModal(true);
    }

    useEffect(() => {
        getRecordImages();
    }, [])

    const tribeOptions = useMemo(() => getTbName(), []);


    const onFormSubmit = useCallback(
        (e) => {
            e.preventDefault();
            if (formEditable && formState?.aadharNumber && !validateAadhaar(formState?.aadharNumber)) {
                toast("Please enter a valid Aadhaar Number!", {
                    type: 'error'
                })
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
                    formEditable={formEditable}
                    setFormState={setFormState}
                    formState={formState}
                    rorImages={rorImages}
                    handleSubmit={handleSubmit}
                    submittedModal={submittedModal}
                    feedbacks={feedbacks}
                    handleUpdate={handleUpdate}
                    rorPdfs={rorPdfs}
                    setRorPdfs={setRorPdfs}
                    pdfModal={pdfModal}
                    currentPdf={currentPdf}
                    setActiveStep={setActiveStep}
                    handleRorImages={handleRorImages}
                    handlePdfUpload={handlePdfUpload}
                    handlePdfSelection={handlePdfSelection}
                    setCurrentPdf={setCurrentPdf}
                    showPdfModal={showPdfModal}
                />
            )}
        </>
    );
};

export default CitizenForm;
