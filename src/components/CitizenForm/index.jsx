"use client";
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
import { Stepper } from "@mui/material";
import { Step } from "@mui/material";
import { StepLabel } from "@mui/material";

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


const steps = [
    'Aadhaar Details',
    'Tribe & Land Details',
    'Plot Details',
];

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
    const { handleSubmit, setFormState, formState, currCitizen, submittedModal, formEditable, mode, savedEntries = false, setLandImages, setRorImages, rorImages, landImages, rorPdfs, setRorPdfs } = props;
    const [currentImage, setCurrentImage] = useState(0);
    const [isViewerOpen, setIsViewerOpen] = useState(false);
    const [activeStep, setActiveStep] = useState(0);
    const [currentPdf, setCurrentPdf] = useState(null);
    const [pdfModal, showPdfModal] = useState(false);

    const user = useSelector((state) => state?.userData?.user);

    console.log("FORM EDITABLE -->", formEditable)
    console.log("formState ->", formState)

    const handleLandImages = (imageList, addUpdateIndex) => {
        // data for submit
        console.log(imageList, addUpdateIndex);
        setLandImages(imageList);
    };

    const handleRorImages = (imageList, addUpdateIndex) => {
        // data for submit
        console.log(imageList, addUpdateIndex);
        setRorImages(imageList);
    };

    const openImageViewer = useCallback((index) => {
        setCurrentImage(index);
        setIsViewerOpen(true);
    }, []);

    const closeImageViewer = () => {
        setCurrentImage(0);
        setIsViewerOpen(false);
    };

    const getRecordImages = async () => {
        if (formState?.landRecords?.length) {
            let landImages = []
            for (let el in formState.landRecords) {
                let imageUri = await getImageFromMinio(formState.landRecords[el], user);
                landImages.push(imageUri);
            }
            setLandImages(landImages);
        }
        if (formState?.rorRecords?.length) {
            let rorImages = [];
            for (let el in formState.rorRecords) {
                let imageUri = await getImageFromMinio(formState.rorRecords[el], user);
                rorImages.push(imageUri);
            }
            setRorImages(rorImages);
        }
    }

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

    console.log({ rorImages })
    return (
        <>
            <Stepper activeStep={activeStep} alternativeLabel
                sx={{ width: window.innerWidth > 500 ? '100%' : '100vw', marginBottom: '1rem' }}

            >
                {steps.map((label) => (
                    <Step key={label}>
                        <StepLabel>{label}</StepLabel>
                    </Step>
                ))}
            </Stepper>
            {

                activeStep == 0 && <form onSubmit={(e) => {
                    e.preventDefault();
                    if (formEditable && formState?.aadharNumber && !validateAadhaar(formState?.aadharNumber)) {
                        toast("Please enter a valid Aadhaar Number!", {
                            type: 'error'
                        })
                        return;
                    }
                    setActiveStep(1);
                }}
                    className={styles.userForm}>
                    {formEditable ? <FormControl sx={{ mb: 4, width: '80%' }}>
                        <InputLabel id="aadhar-select-label">Is Aadhaar Available?</InputLabel>
                        <Select
                            labelId="aadhar-select-label"
                            id="aadhar-select"
                            value={formState?.isAadhaarAvailable}
                            variant="standard"
                            label="Is Aadhaar Available"
                            required
                            className={styles.testClass}
                            onChange={e => {
                                setFormState((prevState) => ({ ...prevState, isAadhaarAvailable: e.target.value }))
                                if (!e.target.value) setFormState((prevState) => ({ ...prevState, aadharNumber: "" }))
                            }}
                        >
                            <MenuItem value={true}>Yes</MenuItem>
                            <MenuItem value={false}>No</MenuItem>
                        </Select>
                    </FormControl> : <TextField
                        type={"text"}
                        variant="standard"
                        label={"Is Aadhaar Available?"}
                        value={formState?.isAadhaarAvailable ? 'Yes' : 'No'}
                        required
                        inputProps={{ maxLength: 12, minLength: 12 }}
                        disabled={true}
                        sx={{ mb: 4, width: "80%" }}
                    />}
                    {
                        formState?.isAadhaarAvailable ?
                            <Tooltip title={!formEditable ? "Aadhaar will be display in hashed format" : ''}>
                                <TextField
                                    type={"text"}
                                    variant="standard"
                                    label={"Aadhaar Number"}
                                    onChange={(e) => {
                                        if (/^[0-9]*$/.test(e.target.value))
                                            setFormState((prevState) => ({
                                                ...prevState,
                                                aadharNumber: e.target.value,
                                            }));
                                    }}
                                    value={savedEntries ? `**** **** ${formState?.lastDigits ? formState?.lastDigits : formState?.aadharNumber.slice(8)}` : formEditable ? formState?.aadharNumber : "**** **** " + formState.lastDigits}
                                    required
                                    inputProps={{ maxLength: 12, minLength: 12 }}
                                    disabled={!formEditable ? true : false}
                                    sx={{ mb: 4, width: "80%" }}
                                />
                            </Tooltip>
                            : <></>
                    }
                    <Button variant="contained" sx={{ position: 'absolute', bottom: '10px' }} color="success" size="large" type="submit" className={styles.submitBtn}>Next</Button>
                </form >
            }
            {
                activeStep == 1 && <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        setActiveStep(1);
                        if (formEditable && !landImages?.length) {
                            toast("Please upload land records!", {
                                type: 'error'
                            })
                            return;
                        }
                        setActiveStep(2);
                    }}
                    className={styles.userForm}>
                    <TextField
                        variant='standard'
                        label={"Land Title Serial Number"}
                        onChange={e => setFormState((prevState) => ({ ...prevState, landTitleSerialNumber: e.target.value }))}
                        value={formState?.landTitleSerialNumber}
                        required
                        sx={{ mb: 4, width: '80%' }}
                        disabled={!formEditable ? true : false}

                    />
                    {landImages.length > 0 && !formEditable && <div>
                        <p style={{ textAlign: 'center' }}>Land Record Images</p>
                        <div className={styles.imageRecordContainer}>
                            {landImages?.map((el, index) => {
                                if (typeof el == 'string') {
                                    return <img src={el} onClick={() => openImageViewer(index)} style={{ width: '7rem', margin: '0rem 1rem 1rem 1rem' }} />

                                } else {
                                    let objectURL = URL.createObjectURL(el);
                                    console.log(objectURL)
                                    return <img src={objectURL} onClick={() => openImageViewer(index)} style={{ width: '7rem', margin: '0rem 1rem 1rem 1rem' }} />
                                }
                            })}
                        </div>
                        {isViewerOpen && (
                            <ImageViewer
                                src={landImages}
                                currentIndex={currentImage}
                                disableScroll={false}
                                closeOnClickOutside={true}
                                onClose={closeImageViewer}
                                backgroundStyle={{ background: '#fff', zIndex: 10, border: '5px solid #017922' }}
                                closeComponent={<p style={{ fontSize: '3rem', color: '#000', opacity: 1, paddingRight: '1rem' }}>X</p>}
                            />
                        )}
                    </div>}
                    {formState?.landTitleSerialNumber && formEditable && <><ImageUploading
                        multiple
                        value={landImages}
                        onChange={handleLandImages}
                        maxNumber={69}
                        dataURLKey="land_records"
                    >
                        {({
                            imageList,
                            onImageUpload,
                            onImageUpdate,
                            onImageRemove,
                            isDragging,
                            dragProps,
                        }) => (
                            <div className={styles.uploadImageWrapper}>
                                <Button
                                    onClick={onImageUpload}
                                    {...dragProps}
                                    variant="outlined"
                                >
                                    Upload Land Records
                                </Button>
                                {/* <Carousel>
                                    {imageList.map((image, index) => (
                                        <div key={index} className="image-item">
                                            <div className="image-item__btn-wrapper">
                                                <Button color="error" variant="outlined" onClick={() => onImageRemove(index)}>Remove</Button>
                                            </div>
                                            <img src={image['land_records']} alt="" width="100" />
                                        </div>
                                    ))}
                                </Carousel> */}
                                <div className={styles.imagePreviewContainer}>
                                    {imageList.map((image, index) => (
                                        <div key={index} className="image-item">
                                            <img src={image['land_records']} alt="" width="100" onClick={() => openImageViewer(index)} />
                                            <div className="image-item__btn-wrapper">
                                                <Button color="error" variant="outlined" onClick={() => onImageRemove(index)}>Remove</Button>
                                            </div>
                                        </div>
                                    ))}
                                    {isViewerOpen && (
                                        <ImageViewer
                                            src={imageList.map(el => el['land_records'])}
                                            currentIndex={currentImage}
                                            disableScroll={false}
                                            closeOnClickOutside={true}
                                            onClose={closeImageViewer}
                                            backgroundStyle={{ background: '#fff', zIndex: 10, border: '5px solid #017922' }}
                                            closeComponent={<p style={{ fontSize: '3rem', color: '#000', opacity: 1, paddingRight: '1rem' }}>X</p>}
                                        />
                                    )}
                                </div>
                            </div>
                        )}
                    </ImageUploading>
                    </>
                    }
                    <TextField
                        variant='standard'
                        label={"Claimant Name"}
                        onChange={e => {
                            if (/^[a-zA-Z ]*$/.test(e.target.value))
                                setFormState((prevState) => ({
                                    ...prevState, claimantName: e.target.value
                                }))
                        }}
                        value={formState?.claimantName || ""}
                        required
                        sx={{ mb: 4, width: '80%' }}
                        disabled={!formEditable ? true : false}

                    />

                    <TextField
                        variant='standard'
                        label={"No. of Co Claimants"}
                        onChange={e => {
                            const newValue = e.target.value;
                            if (newValue === '' || ((parseInt(newValue, 10) >= 0 && parseInt(newValue, 10) <= 20)) && /^\d+$/.test(newValue)) {
                                console.log("inside newvalue", newValue)
                                setFormState((prevState) => ({ ...prevState, noOfCoClaimants: newValue }))
                            }
                        }}
                        value={formState?.noOfCoClaimants || ''}
                        required
                        sx={{ mb: 4, width: '80%' }}
                        disabled={!formEditable ? true : false}
                    />
                    {formState.noOfCoClaimants > 0 && Array.from(Array(Number(formState.noOfCoClaimants)).keys()).map(el => {
                        return <TextField
                            variant='standard'
                            label={`Co Claiamant ${el + 1} Name`}
                            onChange={e => {
                                if (/^[a-zA-Z ]*$/.test(e.target.value)) setFormState((prevState) => ({ ...prevState, [`coClaimant${el + 1}`]: e.target.value }))
                            }}
                            value={formState?.[`coClaimant${el + 1}`] || ""}
                            required
                            sx={{ mb: 4, width: '80%' }}
                            disabled={!formEditable ? true : false}
                        />
                    })}

                    <TextField
                        variant='standard'
                        label={"No. of Dependents"}
                        onChange={e => {
                            const newValue = e.target.value;
                            if (newValue === '' || ((parseInt(newValue, 10) >= 0 && parseInt(newValue, 10) <= 20) && /^\d+$/.test(newValue))) {
                                setFormState((prevState) => ({ ...prevState, noOfDependents: newValue }))
                            }
                        }}
                        value={formState?.noOfDependents || ''}
                        required
                        sx={{ mb: 4, width: '80%' }}
                        disabled={!formEditable ? true : false}
                    />
                    {formState.noOfDependents > 0 && Array.from(Array(Number(formState.noOfDependents)).keys()).map(el => {
                        return <TextField
                            variant='standard'
                            label={`Dependent ${el + 1} Name`}
                            onChange={e => { if (/^[a-zA-Z ]*$/.test(e.target.value)) setFormState((prevState) => ({ ...prevState, [`dependent${el + 1}`]: e.target.value })) }}
                            value={formState?.[`dependent${el + 1}`] || ""}
                            required
                            sx={{ mb: 4, width: '80%' }}
                            disabled={!formEditable ? true : false}
                        />
                    })}

                    <TextField
                        variant='standard'
                        label={"Mother/Father's Name"}
                        onChange={e => { if (/^[a-zA-Z ]*$/.test(e.target.value)) setFormState((prevState) => ({ ...prevState, parentName: e.target.value })) }}
                        value={formState?.parentName || ""}
                        required
                        sx={{ mb: 4, width: '80%' }}
                        disabled={!formEditable ? true : false}

                    />
                    <TextField
                        variant='standard'
                        label={"Full Address"}
                        onChange={e => setFormState((prevState) => ({ ...prevState, address: e.target.value }))}
                        value={formState?.address}
                        required
                        sx={{ mb: 4, width: '80%' }}
                        disabled={!formEditable ? true : false}

                    />
                    {/* <TextField
                        variant='standard'
                        label={"Tribe Name"}
                        onChange={e => setFormState((prevState) => ({ ...prevState, tribeName: e.target.value }))}
                        value={formState?.tribeName}
                        required
                        sx={{ mb: 4, width: '80%' }}
                        disabled={!formEditable ? true : false}

                    /> */}
                    {formEditable && <Autocomplete
                        disablePortal
                        id="tribe-input"
                        options={tribeOptions}
                        sx={{ mb: 4, width: '80%' }}
                        value={formState?.tribeName}
                        disableClearable
                        onChange={(e, value) => { setFormState((prevState) => ({ ...prevState, tribeName: value?.label })) }}
                        renderInput={(params) => <TextField {...params} variant='standard' required label={"Tribe Name"} InputProps={{
                            ...params.InputProps,
                            type: 'search',
                        }} />}
                    />}
                    {!formEditable && <TextField
                        variant='standard'
                        label={"Tribe Name"}
                        value={formState?.tribeName}
                        required
                        sx={{ mb: 4, width: '80%' }}
                        disabled={!formEditable ? true : false}

                    />}
                    {formEditable && <FormControl sx={{ mb: 4, width: '80%' }}>
                        <InputLabel id="area-units-label">Area Units</InputLabel>
                        <Select
                            labelId="area-units-label"
                            id="area-units"
                            value={formState?.areaUnits}
                            variant="standard"
                            label="Area Units"
                            required
                            onChange={e => setFormState((prevState) => ({ ...prevState, areaUnits: e.target.value }))}
                        >
                            <MenuItem value={'Acres'}>Acres</MenuItem>
                            <MenuItem value={'Hectares'}>Hectares</MenuItem>
                        </Select>
                    </FormControl>}
                    {!formEditable && <TextField
                        variant='standard'
                        label={"Area Units"}
                        value={formState?.areaUnits}
                        required
                        sx={{ mb: 4, width: '80%' }}
                        disabled={!formEditable ? true : false}

                    />}
                    <TextField
                        variant='standard'
                        label={"Area"}
                        onChange={e => {
                            const newValue = e.target.value;
                            if (newValue === '' || ((parseFloat(newValue, 10) >= 0))) {
                                setFormState((prevState) => ({ ...prevState, area: newValue }))
                            }
                        }}
                        inputProps={{ type: 'number', step: 'any' }}
                        value={formState?.area || ""}
                        required
                        sx={{ mb: 4, width: '80%' }}
                        disabled={!formEditable ? true : false}

                    />
                    <TextField
                        variant='standard'
                        label={"Description of boundaries by prominent landmarks including khasra/compartment No"}
                        onChange={e => setFormState((prevState) => ({ ...prevState, boundariesDesc: e.target.value }))}
                        value={formState?.boundariesDesc}
                        required
                        sx={{ mb: 4, width: '80%' }}
                        disabled={!formEditable ? true : false}

                    />
                    <div className={styles.btnContainer}>
                        <Button variant="contained" style={{ position: 'relative' }} color="success" size="large" onClick={() => setActiveStep(0)} className={styles.submitBtn}>Back</Button>
                        <Button variant="contained" style={{ position: 'relative' }} color="success" size="large" type="submit" className={styles.submitBtn}>Next</Button>
                    </div>
                </form >
            }
            {
                activeStep == 2 && <form
                    onSubmit={(e) => {
                        console.log("Submitting form -> ", e)
                        e?.preventDefault();
                        if (formState?.rorUpdated && !rorImages?.length && !rorPdfs?.length) {
                            toast("Please upload ROR records!", {
                                type: 'error'
                            })
                            return;
                        } else if (formState?.forestLandType == 'revenueForest' && formState?.typeOfBlock == 'revenueBlock' && formState?.fraPlotsClaimed == 0) {
                            toast("Plots claimed cannot be zero!", {
                                type: 'error'
                            })
                            return;
                        }
                        handleSubmit();
                    }}
                    className={styles.userForm} style={rorPdfs?.length ? { height: 'auto' } : {}}>
                    {formEditable ? <FormControl sx={{ mb: 4, width: '80%' }}>
                        <InputLabel id="land-type-label">Type of Forest Land</InputLabel>
                        <Select
                            labelId="land-type-label"
                            id="land-type"
                            value={formState?.forestLandType}
                            variant="standard"
                            label="Type of Forest Land"
                            required
                            onChange={e => { setFormState((prevState) => ({ ...prevState, forestLandType: e.target.value })) }}
                        >
                            <MenuItem value={'revenueForest'}>Revenue Forest</MenuItem>
                            <MenuItem value={'reservedForest'}>Reserved Forest</MenuItem>
                        </Select>
                    </FormControl> : <TextField
                        variant='standard'
                        label={"Type of Forest Land"}
                        onChange={e => setFormState((prevState) => ({ ...prevState, forestLandType: e.target.value }))}
                        value={formState?.forestLandType == 'revenueForest' ? 'Revenue Forest' : 'Reserved Forest'}
                        required
                        sx={{ mb: 4, width: '80%' }}
                        disabled={!formEditable ? true : false}

                    />}
                    {formState?.forestLandType == 'revenueForest' ? formEditable ? <FormControl sx={{ mb: 4, width: '80%' }}>
                        <InputLabel id="block-type-label">Type of Block</InputLabel>
                        <Select
                            labelId="block-type-label"
                            id="block-type"
                            value={formState?.typeOfBlock}
                            variant="standard"
                            label="Type of Block"
                            required
                            onChange={e => {
                                const currForm = { ...formState };
                                if (e.target.value == 'revenueBlock') {
                                    delete currForm.compartmentNo;
                                } else {
                                    delete currForm.fraPlotsClaimed;
                                }
                                currForm.typeOfBlock = e.target.value;
                                setFormState(currForm);
                            }}
                        >
                            <MenuItem value={'jungleBlock'}>Jungle Block</MenuItem>
                            <MenuItem value={'revenueBlock'}>Revenue Block</MenuItem>
                        </Select>
                    </FormControl> : <TextField
                        variant='standard'
                        label={"Type of Block"}
                        onChange={e => setFormState((prevState) => ({ ...prevState, typeOfBlock: e.target.value }))}
                        value={formState?.typeOfBlock == 'jungleBlock' ? 'Jungle Block' : 'Revenue Block'}
                        required
                        sx={{ mb: 4, width: '80%' }}
                        disabled={!formEditable ? true : false}

                    /> : <></>}


                    {formState?.forestLandType == 'revenueForest' && formState?.typeOfBlock == 'jungleBlock' ? <TextField
                        variant='standard'
                        label={"Compartment No"}
                        onChange={e => setFormState((prevState) => ({ ...prevState, compartmentNo: e.target.value }))}
                        value={formState?.compartmentNo}
                        required
                        sx={{ mb: 4, width: '80%' }}
                        disabled={!formEditable ? true : false}

                    /> : <></>}


                    {formState?.forestLandType == 'revenueForest' && formState?.typeOfBlock == 'revenueBlock' ? <>
                        <TextField
                            variant='standard'
                            label={"No. of Plots Claimed Under FRA"}
                            onChange={e => {
                                const newValue = e.target.value;
                                if (newValue === '' || (((parseInt(newValue, 10) >= 0 && parseInt(newValue, 10) <= 50)) && /^\d+$/.test(newValue))) {
                                    setFormState((prevState) => ({ ...prevState, fraPlotsClaimed: newValue }))
                                }
                            }}
                            value={formState?.fraPlotsClaimed || ''}
                            required
                            sx={{ mb: 4, width: '80%' }}
                            disabled={!formEditable ? true : false}
                        />
                        {formState.fraPlotsClaimed > 0 && Array.from(Array(Number(formState.fraPlotsClaimed)).keys()).map(el => {
                            return <TextField
                                variant='standard'
                                label={`Plot Number ${el + 1}`}
                                onChange={e => setFormState((prevState) => ({ ...prevState, [`plotNumber${el + 1}`]: e.target.value }))}
                                value={formState?.[`plotNumber${el + 1}`]}
                                required
                                sx={{ mb: 4, width: '80%' }}
                                disabled={!formEditable ? true : false}
                            />
                        })}
                    </> : <></>
                    }

                    {formState?.forestLandType == 'reservedForest' ? <TextField
                        variant='standard'
                        label={"Compartment No"}
                        onChange={e => setFormState((prevState) => ({ ...prevState, compartmentNo: e.target.value }))}
                        value={formState?.compartmentNo}
                        required
                        sx={{ mb: 4, width: '80%' }}
                        disabled={!formEditable ? true : false}

                    /> : <></>}

                    {formEditable ? <FormControl sx={{ mb: 4, width: '80%' }}>
                        <InputLabel id="ror-updated-label">Has ROR been updated? *</InputLabel>
                        <Select
                            labelId="ror-updated-label"
                            id="ror-updated"
                            value={formState?.rorUpdated}
                            variant="standard"
                            label="Has ROR been updated?"
                            required
                            onChange={e => setFormState((prevState) => ({ ...prevState, rorUpdated: e.target.value }))}
                        >
                            <MenuItem value={true}>Yes</MenuItem>
                            <MenuItem value={false}>No</MenuItem>
                        </Select>
                    </FormControl> : <TextField
                        variant='standard'
                        label={"Has ROR been updated?"}
                        onChange={e => setFormState((prevState) => ({ ...prevState, address: e.target.value }))}
                        value={formState?.rorUpdated ? 'Yes' : 'No'}
                        required
                        sx={{ mb: 4, width: '80%' }}
                        disabled={!formEditable ? true : false}

                    />}
                    {formState?.rorUpdated ? <>
                        <TextField
                            variant='standard'
                            label={`Khata Number`}
                            onChange={e => setFormState((prevState) => ({ ...prevState, khataNumber: e.target.value }))}
                            value={formState?.khataNumber}
                            required
                            sx={{ mb: 4, width: '80%' }}
                            disabled={!formEditable ? true : false}
                        />
                        {formEditable && <ImageUploading
                            multiple
                            value={rorImages}
                            onChange={handleRorImages}
                            maxNumber={69}
                            dataURLKey="ror_records"
                        >
                            {({
                                imageList,
                                onImageUpload,
                                onImageRemove,
                                isDragging,
                                dragProps,
                            }) => (
                                <div className={styles.uploadImageWrapper}>
                                    <Button
                                        onClick={onImageUpload}
                                        {...dragProps}
                                        variant="outlined"
                                    >
                                        Upload ROR Records
                                    </Button>
                                    <div className={styles.imagePreviewContainer}>
                                        {imageList.map((image, index) => (
                                            <div key={index} className="image-item">
                                                <img src={image['ror_records']} alt="" width="100" onClick={() => openImageViewer(index)} />
                                                <div className="image-item__btn-wrapper">
                                                    <Button variant="outlined" color="error" onClick={() => onImageRemove(index)}>Remove</Button>
                                                </div>
                                            </div>
                                        ))}
                                        {isViewerOpen && (
                                            <ImageViewer
                                                src={imageList.map(el => el['ror_records'])}
                                                currentIndex={currentImage}
                                                disableScroll={false}
                                                closeOnClickOutside={true}
                                                onClose={closeImageViewer}
                                                backgroundStyle={{ background: '#fff', zIndex: 10, border: '5px solid #017922' }}
                                                closeComponent={<p style={{ fontSize: '3rem', color: '#000', opacity: 1, paddingRight: '1rem' }}>X</p>}
                                            />
                                        )}
                                    </div>
                                </div>
                            )}
                        </ImageUploading>}

                        {rorImages.length > 0 && !formEditable && <div>
                            <p style={{ textAlign: 'center' }}>ROR Records</p>
                            <div className={styles.imageRecordContainer}>
                                {rorImages?.map((el, index) => {
                                    if (typeof el == 'string') {
                                        if (!el.includes('pdf'))
                                            return <img src={el} onClick={() => openImageViewer(index)} style={{ width: '7rem', margin: '0rem 1rem 1rem 1rem' }} />
                                        if (el.includes('pdf'))
                                            return <div className={styles.pdfItem} style={{ width: '20vw', height: '17vh' }}>
                                                <div className={styles.pdfView} style={{ width: '20vw', height: '17vh' }} onClick={() => handlePdfSelection(el)}>
                                                    <Viewer plugins={[thumbnailPluginInstance]} defaultScale={0.2} fileUrl={el} />
                                                </div>
                                            </div>
                                    }
                                    else {
                                        if (el?.type != 'application/pdf') {
                                            let objectURL = URL.createObjectURL(el);
                                            return <img src={objectURL} onClick={() => openImageViewer(index)} style={{ width: '7rem', margin: '0rem 1rem 1rem 1rem' }} />
                                        }
                                    }
                                })}
                            </div>
                            {isViewerOpen && (
                                <ImageViewer
                                    src={rorImages.map(el => typeof el == 'string' ? el : URL.createObjectURL(el))}
                                    currentIndex={currentImage}
                                    disableScroll={false}
                                    closeOnClickOutside={true}
                                    onClose={closeImageViewer}
                                    backgroundStyle={{ background: '#fff', zIndex: 10, border: '5px solid #017922' }}
                                    closeComponent={<p style={{ fontSize: '3rem', color: '#000', opacity: 1, paddingRight: '1rem' }}>X</p>}
                                />
                            )}
                        </div>}


                        {formEditable && <Button component="label" role={undefined} tabIndex={-1} variant="outlined" sx={{ width: '80%', marginTop: 0, marginBottom: 10 }}>
                            Upload ROR Records PDF
                            <VisuallyHiddenInput onChange={handlePdfUpload} accept="application/pdf,application/vnd.ms-excel" type="file" />
                        </Button>}


                        <div className={styles.pdfContainer}>
                            <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
                                {rorPdfs?.map(el =>
                                    <div className={styles.pdfItem}>
                                        <div className={styles.pdfView} onClick={() => handlePdfSelection(el?.base64File)}>
                                            <Viewer plugins={[thumbnailPluginInstance]} defaultScale={0.2} fileUrl={el?.base64File} />
                                        </div>
                                        <Button onClick={() => {
                                            if (rorPdfs?.length == 1)
                                                setRorPdfs([]);
                                            else
                                                setRorPdfs((prev) => prev.filter(x => x?.base64File != el?.base64File))
                                        }} variant="outlined" color="error" sx={{ marginTop: 2 }} fullWidth>Remove</Button>
                                    </div>
                                )}
                            </Worker>
                        </div >

                        {pdfModal && <CommonModal sx={{ height: '100vh', maxWidth: '100vw', margin: 0, padding: 0 }}>
                            <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
                                <Viewer defaultLayoutPlugin={[defaultLayoutPluginInstance]} fileUrl={currentPdf} />
                            </Worker>
                            <div className={styles.goBackBtn} onClick={() => { setCurrentPdf(null); showPdfModal(false); }}>Go Back</div>
                        </CommonModal>}

                    </> : <></>}
                    {!submittedModal && formEditable && <div className={styles.btnContainer}>
                        <Button variant="contained" style={{ position: 'relative' }} color="success" size="large" onClick={() => setActiveStep(1)} className={styles.submitBtn}>Back</Button>
                        <Button variant="contained" style={{ position: 'relative' }} color="success" size="large" type="submit" className={styles.submitBtn}>Save</Button>
                    </div>}
                    {!submittedModal && !formEditable && <Button variant="contained" style={{ position: 'relative' }} color="success" size="large" onClick={() => setActiveStep(1)} className={styles.submitBtn}>Back</Button>}
                </form >
            }
        </>
    );
};

export default CitizenForm;
