"use client";
import React, { useState } from "react";
import styles from "./index.module.scss";
import {
    TextField,
    Button,
    InputLabel,
    Select,
    MenuItem,
    FormControl,
    Tooltip,
} from "@mui/material";

import MobileStepper from '@mui/material/MobileStepper';
import ImageUploading from 'react-images-uploading';

import "react-datepicker/dist/react-datepicker.css";
import moment from "moment";
import { toast } from "react-toastify";
import { MDBContainer } from "mdbreact";

const CitizenForm = (props) => {
    const { handleSubmit, setFormState, formState, currCitizen, submittedModal, formEditable, mode, savedEntries = false, setLandImages, setRorImages, rorImages, landImages } = props;

    const [activeStep, setActiveStep] = useState(0);

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

    return (
        <>
            <MobileStepper
                variant="progress"
                steps={3}
                position="static"
                activeStep={activeStep}
                sx={{ width: '170vw', marginRight: '-85vw', marginBottom: '1rem' }}
            />
            
            {
               
                activeStep == 0 && <form onSubmit={(e) => { e.preventDefault(), setActiveStep(1) }} className={styles.userForm}>
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
                            onChange={e => setFormState((prevState) => ({ ...prevState, isAadhaarAvailable: e.target.value }))}
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
                    {formState?.isAadhaarAvailable ?
                        <Tooltip title={!formEditable ? "Aadhar will be display in hashed format" : ''}>
                            <TextField
                                type={"text"}
                                variant="standard"
                                label={"Aadhar Number"}
                                onChange={(e) => {
                                    if (/^[0-9]*$/.test(e.target.value))
                                        setFormState((prevState) => ({
                                            ...prevState,
                                            aadharNumber: e.target.value,
                                        }));
                                }}
                                value={savedEntries ? "**** **** " + formState?.aadharNumber.slice(8) : formEditable ? formState?.aadharNumber : mode == 'qr' ? formState?.aadharNumber : "**** **** " + formState.lastDigits}
                                required
                                inputProps={{ maxLength: 12, minLength: 12 }}
                                disabled={!formEditable ? true : false}
                                sx={{ mb: 4, width: "80%" }}
                            />
                        </Tooltip>
                        : <></>}
                    <Button variant="contained" sx={{ position: 'absolute', bottom: '10px' }} color="success" size="large" type="submit" className={styles.submitBtn}>Next</Button>
                </form>
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
                        <p>Land Record Images</p>
                        <div>
                            {landImages?.map(el => {
                                let objectURL = URL.createObjectURL(el);
                                console.log(objectURL)
                                return <img src={objectURL} style={{ width: '7rem', margin: '0rem 1rem 1rem 1rem' }} />
                            })}
                        </div>
                    </div>}
                    {formState?.landTitleSerialNumber && formEditable && <ImageUploading
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
                                <div className={styles.imagePreviewContainer}>
                                    {imageList.map((image, index) => (
                                        <div key={index} className="image-item">
                                            <img src={image['land_records']} alt="" width="100" />
                                            <div className="image-item__btn-wrapper">
                                                <Button color="error" variant="outlined" onClick={() => onImageRemove(index)}>Remove</Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </ImageUploading>}
                    <TextField
                        variant='standard'
                        label={"Claimant Name"}
                        onChange={e => {
                            if (/^[a-zA-Z ]*$/.test(e.target.value))
                                setFormState((prevState) => ({
                                    ...prevState, claimantName: e.target.value
                                }))
                        }}
                        value={formState?.claimantName}
                        required
                        sx={{ mb: 4, width: '80%' }}
                        disabled={!formEditable ? true : false}

                    />
                    {formEditable && <FormControl sx={{ mb: 4, width: '80%' }}>
                        <InputLabel id="co-claimant-select-label">Co-Claimant Available?</InputLabel>
                        <Select
                            labelId="co-claimant-select-label"
                            id="co-claimant-select"
                            value={formState?.coClaimantAvailable}
                            variant="standard"
                            label="Co-Claimant Available"
                            required
                            onChange={e => setFormState((prevState) => ({ ...prevState, coClaimantAvailable: e.target.value }))}
                        >
                            <MenuItem value={true}>Yes</MenuItem>
                            <MenuItem value={false}>No</MenuItem>
                        </Select>
                    </FormControl>}

                    {!formEditable && <FormControl sx={{ mb: 4, width: '80%' }}>
                        <InputLabel id="co-claimant-select-label">Co-Claimant Available?</InputLabel>
                        <Select
                            labelId="co-claimant-select-label"
                            id="co-claimant-select"
                            value={formState?.coClaimantAvailable}
                            variant="standard"
                            label="Co-Claimant Available"
                            required
                            disabled
                            onChange={e => setFormState((prevState) => ({ ...prevState, coClaimantAvailable: e.target.value }))}
                        >
                            <MenuItem value={true}>Yes</MenuItem>
                            <MenuItem value={false}>No</MenuItem>
                        </Select>
                    </FormControl>}
                    {formState?.coClaimantAvailable ? <TextField
                        variant='standard'
                        label={"Co-Claimant Name"}
                        onChange={e => {
                            if (/^[a-zA-Z ]*$/.test(e.target.value))
                                setFormState((prevState) => ({
                                    ...prevState, coClaimantName: e.target.value
                                }))
                        }}
                        value={formState?.coClaimantName}
                        required
                        sx={{ mb: 4, width: '80%' }}
                        disabled={!formEditable ? true : false}

                    /> : <></>}
                    <TextField
                        variant='standard'
                        label={"Mother/Father's Name"}
                        onChange={e => setFormState((prevState) => ({ ...prevState, parentName: e.target.value }))}
                        value={formState?.parentName}
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
                    {formEditable && <FormControl sx={{ mb: 4, width: '80%' }}>
                        <InputLabel id="social-category-label">Social Category</InputLabel>
                        <Select
                            labelId="social-category-label"
                            id="social-category"
                            value={formState?.socialCategory}
                            variant="standard"
                            label="Social Category"
                            required
                            onChange={e => setFormState((prevState) => ({ ...prevState, socialCategory: e.target.value }))}
                        >
                            <MenuItem value={'FDST'}>Forest Dwelling Scheduled Tribe {'(FDST)'}</MenuItem>
                            <MenuItem value={'OTFD'}>Other Tribal Forest Dwellers {`(OTFD)`}</MenuItem>
                        </Select>
                    </FormControl>}
                    {!formEditable && <TextField
                        variant='standard'
                        label={"Social Category"}
                        value={formState?.socialCategory}
                        required
                        sx={{ mb: 4, width: '80%' }}
                        disabled={!formEditable ? true : false}

                    />}
                    <TextField
                        variant='standard'
                        label={"Tribe Name"}
                        onChange={e => setFormState((prevState) => ({ ...prevState, tribeName: e.target.value }))}
                        value={formState?.tribeName}
                        required
                        sx={{ mb: 4, width: '80%' }}
                        disabled={!formEditable ? true : false}

                    />
                    <TextField
                        variant='standard'
                        label={"Area (In Hectares)"}
                        onChange={e => setFormState((prevState) => ({ ...prevState, area: e.target.value }))}
                        value={formState?.area}
                        required
                        sx={{ mb: 4, width: '80%' }}
                        disabled={!formEditable ? true : false}

                    />
                    <Button variant="contained" style={{ position: 'relative' }} color="success" size="large" type="submit" className={styles.submitBtn}>Next</Button>
                </form>
            }
            {activeStep == 2 && <form
                onSubmit={(e) => {
                    console.log("Submitting form -> ", e)
                    e?.preventDefault();
                    if (formState?.rorUpdated && !rorImages.length) {
                        toast("Please upload ROR records!", {
                            type: 'error'
                        })
                        return;
                    }
                    handleSubmit();
                }}
                className={styles.userForm}>
                <TextField
                    variant='standard'
                    label={"Plots Claimed Under FRA)"}
                    onChange={e => setFormState((prevState) => ({ ...prevState, fraPlotsClaimed: e.target.value }))}
                    value={formState?.fraPlotsClaimed}
                    required
                    type={'number'}
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
                        type={'number'}
                        sx={{ mb: 4, width: '80%' }}
                        disabled={!formEditable ? true : false}
                    />
                })}
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
                                            <img src={image['ror_records']} alt="" width="100" />
                                            <div className="image-item__btn-wrapper">
                                                <Button variant="outlined" color="error" onClick={() => onImageRemove(index)}>Remove</Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </ImageUploading>}
                    {rorImages.length > 0 && !formEditable && <div>
                        <p>ROR Record Images</p>
                        <div>
                            {rorImages?.map(el => {
                                console.log("landrecord ->", el);
                                let objectURL = URL.createObjectURL(el);
                                console.log(objectURL)
                                return <img src={objectURL} style={{ width: '7rem', margin: '0rem 1rem 1rem 1rem' }} />
                            })}
                        </div>
                    </div>}
                </> : <></>}
                {!submittedModal && formEditable && <Button variant="contained" style={{ position: 'relative' }} color="success" size="large" type="submit" className={styles.submitBtn}>Submit</Button>}
            </form>}
        </>
    );
};

export default CitizenForm;
