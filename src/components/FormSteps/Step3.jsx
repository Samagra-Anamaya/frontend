/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */

import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
	Button,
	FormControl,
	IconButton,
	InputLabel,
	MenuItem,
	Select,
	TextField
} from '@mui/material';
import ImageViewer from 'react-simple-image-viewer';
import ImageUploading from 'react-images-uploading';
import CloseIcon from '@mui/icons-material/Close';
import { map } from 'lodash';
import styles from './step.module.scss';
import { styled } from '@mui/material/styles';

import { Worker } from '@react-pdf-viewer/core';
import { Viewer } from '@react-pdf-viewer/core';


// Import the styles
import '@react-pdf-viewer/core/lib/styles/index.css';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';

// Import styles
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

import { thumbnailPlugin } from '@react-pdf-viewer/thumbnail';
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

const Step3 = ({
	setActiveStep,
	formEditable,
	setFormState,
	formState,
	rorImages,
	handleRorImages,
	handleSubmit,
	submittedModal,
	feedbacks,
	isFeedbackPage,
	handleUpdate,
	rorPdfs,
	setRorPdfs,
	pdfModal,
	currentPdf,
	handlePdfUpload,
	handlePdfSelection,
	setCurrentPdf,
	showPdfModal
}) => {
	const defaultLayoutPluginInstance = defaultLayoutPlugin();
	const thumbnailPluginInstance = thumbnailPlugin();
	const [isViewerOpen, setIsViewerOpen] = useState(false);
	const [currentImage, setCurrentImage] = useState(0);
	const [viewerSource, setViewerSource] = useState(null);

	const openImageViewer = useCallback((index, source) => {
		setViewerSource(source);
		setCurrentImage(index);
		setTimeout(() => setIsViewerOpen(true), 10);
	}, []);

	const closeImageViewer = useCallback(() => {
		setCurrentImage(0);
		setIsViewerOpen(false);
	}, []);

	const onFormSubmit = useCallback(
		(e) => {
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
			isFeedbackPage ? handleUpdate() : handleSubmit();
		},
		[
			formState?.forestLandType,
			formState?.fraPlotsClaimed,
			formState?.rorUpdated,
			formState?.typeOfBlock,
			handleSubmit,
			handleUpdate,
			isFeedbackPage,
			rorImages.length
		]
	);

	const activeImageViewer = useMemo(() => {
		if (isFeedbackPage) return 'feedbackViewer';
		if (rorImages.length > 0 && !formEditable) return 'savedViewer';
		return 'editableViewer';
	}, [formEditable, isFeedbackPage, rorImages.length]);

	useEffect(() => {
		if (isFeedbackPage) {
			setRorPdfs(rorImages?.filter(el => el?.includes('pdf'))?.map(x => ({ file: null, base64File: x })) || [])
		}
	}, [isFeedbackPage])

	return (
		<form onSubmit={onFormSubmit} className={styles.userForm} style={rorPdfs?.length ? { height: 'auto' } : {}}>
			{formEditable && (
				<>
					<FormControl sx={{ mb: 4, width: '80%' }}>
						<InputLabel id="land-type-label">Type of Forest Land</InputLabel>
						<Select
							labelId="land-type-label"
							id="land-type"
							value={formState?.forestLandType}
							variant="standard"
							label="Type of Forest Land"
							required
							onChange={(e) => {
								setFormState((prevState) => ({ ...prevState, forestLandType: e.target.value }));
							}}
						>
							<MenuItem value={'revenueForest'}>Revenue Forest</MenuItem>
							<MenuItem value={'reservedForest'}>Reserved Forest</MenuItem>
						</Select>
					</FormControl>

					{formState?.forestLandType === 'revenueForest' && (
						<FormControl sx={{ mb: 4, width: '80%' }}>
							<InputLabel id="block-type-label">Type of Block</InputLabel>
							<Select
								labelId="block-type-label"
								id="block-type"
								value={formState?.typeOfBlock}
								variant="standard"
								label="Type of Block"
								required
								onChange={(e) => {
									const currForm = { ...formState };
									if (e.target.value === 'revenueBlock') {
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
						</FormControl>
					)}
				</>
			)}
			{!formEditable && (
				<TextField
					variant="standard"
					label={'Type of Forest Land'}
					onChange={(e) =>
						setFormState((prevState) => ({ ...prevState, forestLandType: e.target.value }))
					}
					value={
						formState?.forestLandType === 'revenueForest' ? 'Revenue Forest' : 'Reserved Forest'
					}
					required
					sx={{ mb: 4, width: '80%' }}
					disabled={!formEditable}
				/>
			)}
			{formState?.forestLandType === 'revenueForest' && !formEditable && (
				<TextField
					variant="standard"
					label={'Type of Block'}
					onChange={(e) =>
						setFormState((prevState) => ({ ...prevState, typeOfBlock: e.target.value }))
					}
					value={formState?.typeOfBlock === 'jungleBlock' ? 'Jungle Block' : 'Revenue Block'}
					required
					sx={{ mb: 4, width: '80%' }}
					disabled={!formEditable}
				/>
			)}
			{formState?.forestLandType === 'revenueForest' &&
				formState?.typeOfBlock === 'jungleBlock' && (
					<TextField
						variant="standard"
						label={'Compartment No'}
						onChange={(e) =>
							setFormState((prevState) => ({ ...prevState, compartmentNo: e.target.value }))
						}
						value={formState?.compartmentNo}
						required
						sx={{ mb: 4, width: '80%' }}
						disabled={!formEditable}
						error={isFeedbackPage ? !!feedbacks?.compartmentNo : false}
						helperText={isFeedbackPage ? feedbacks?.compartmentNo || null : null}
					/>
				)}
			{formState?.forestLandType === 'revenueForest' &&
				formState?.typeOfBlock === 'revenueBlock' && (
					<>
						<TextField
							variant="standard"
							label={'No. of Plots Claimed Under FRA'}
							onChange={(e) => {
								const newValue = e.target.value;
								if (newValue === '' || parseInt(newValue, 10) >= 0) {
									setFormState((prevState) => ({ ...prevState, fraPlotsClaimed: newValue }));
								}
							}}
							value={formState?.fraPlotsClaimed}
							required
							sx={{ mb: 4, width: '80%' }}
							disabled={!formEditable}
							error={isFeedbackPage ? !!feedbacks?.fraPlotsClaimed : false}
							helperText={isFeedbackPage ? feedbacks?.fraPlotsClaimed || null : null}
						/>
						{formState.fraPlotsClaimed > 0 &&
							Array.from(Array(Number(formState.fraPlotsClaimed)).keys()).map((el) => (
								<TextField
									key={el}
									variant="standard"
									label={`Plot Number ${el + 1}`}
									onChange={(e) =>
										setFormState((prevState) => ({
											...prevState,
											[`plotNumber${el + 1}`]: e.target.value
										}))
									}
									value={formState?.[`plotNumber${el + 1}`]}
									required
									sx={{ mb: 4, width: '80%' }}
									disabled={!formEditable}
								/>
							))}
					</>
				)}
			{formState?.forestLandType === 'reservedForest' && (
				<TextField
					variant="standard"
					label={'Compartment No'}
					onChange={(e) =>
						setFormState((prevState) => ({ ...prevState, compartmentNo: e.target.value }))
					}
					value={formState?.compartmentNo}
					required
					sx={{ mb: 4, width: '80%' }}
					disabled={!formEditable}
					error={isFeedbackPage ? !!feedbacks?.compartmentNo : false}
					helperText={isFeedbackPage ? feedbacks?.compartmentNo || null : null}
				/>
			)}
			{formEditable ? (
				<FormControl sx={{ mb: 4, width: '80%' }}>
					<InputLabel id="ror-updated-label">Has ROR been updated? *</InputLabel>
					<Select
						labelId="ror-updated-label"
						id="ror-updated"
						value={formState?.rorUpdated}
						variant="standard"
						label="Has ROR been updated?"
						required
						onChange={(e) =>
							setFormState((prevState) => ({ ...prevState, rorUpdated: e.target.value }))
						}
					>
						<MenuItem value>Yes</MenuItem>
						<MenuItem value={false}>No</MenuItem>
					</Select>
				</FormControl>
			) : (
				<TextField
					variant="standard"
					label={'Has ROR been updated?'}
					onChange={(e) => setFormState((prevState) => ({ ...prevState, address: e.target.value }))}
					value={formState?.rorUpdated ? 'Yes' : 'No'}
					required
					sx={{ mb: 4, width: '80%' }}
					disabled={!formEditable}
				/>
			)}

			{formState?.rorUpdated && (
				<>
					<TextField
						variant="standard"
						label={`Khata Number`}
						onChange={(e) =>
							setFormState((prevState) => ({ ...prevState, khataNumber: e.target.value }))
						}
						value={formState?.khataNumber}
						required
						sx={{ mb: 4, width: '80%' }}
						disabled={!formEditable}
						error={isFeedbackPage ? !!feedbacks?.khataNumber : false}
						helperText={isFeedbackPage ? feedbacks?.khataNumber || null : null}
					/>

					{activeImageViewer === 'feedbackViewer' && (
						<>
							<ImageUploading
								multiple
								value={rorImages}
								onChange={handleRorImages}
								maxNumber={69}
								dataURLKey="ror_records"
							>
								{({ imageList, onImageUpload, onImageRemove, isDragging, dragProps }) => (
									<div className={styles.uploadImageWrapper}>
										<Button onClick={onImageUpload} {...dragProps} variant="outlined">
											Upload ROR Records
										</Button>
										<div className={styles.imagePreviewContainer}>
											{imageList.map((image, index) => {
												const imageSrc = imageList.map((el) => el?.ror_records || el);
												if (typeof image == 'string' && !image.includes('pdf'))
													return (
														<div key={index} className={styles.imageItem}>
															<img
																src={image.ror_records || image}
																alt=""
																width="100"
																style={{ height: '100px', width: '140px', borderRadius: '10px' }}
																onClick={() => openImageViewer(index, imageSrc)}
															/>
															<div className={styles.removeBtn}>
																<IconButton aria-label="delete" onClick={() => onImageRemove(index)}>
																	<CloseIcon style={{ color: 'white' }} />
																</IconButton>
															</div>
														</div>
													);
											})}
										</div>
									</div>
								)}
							</ImageUploading>
							<Button component="label" role={undefined} tabIndex={-1} variant="outlined" sx={{ width: '80%', marginTop: 0, marginBottom: 10 }}>
								Upload ROR Records PDF
								<VisuallyHiddenInput onChange={handlePdfUpload} accept="application/pdf,application/vnd.ms-excel" type="file" />
							</Button>

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
						</>
					)}
					{activeImageViewer === 'editableViewer' && (
						<ImageUploading
							multiple
							value={rorImages}
							onChange={handleRorImages}
							maxNumber={69}
							dataURLKey="ror_records"
						>
							{({ imageList, onImageUpload, onImageRemove, dragProps }) => (
								<div className={styles.uploadImageWrapper}>
									<Button onClick={onImageUpload} {...dragProps} variant="outlined">
										Upload ROR Records
									</Button>
									<div className={styles.imagePreviewContainer}>
										{imageList.map((image, index) => {
											const imageSrc = rorImages?.map((_el) => {
												if (typeof _el === 'string') return _el;
												if (_el?.file) return URL.createObjectURL(_el?.file);
												return URL.createObjectURL(_el);
											});
											return (
												<div key={index} className={styles.imageItem}>
													<img
														src={image.ror_records}
														alt=""
														width="100"
														style={{ height: '100px', width: '140px', borderRadius: '10px' }}
														onClick={() => openImageViewer(index, imageSrc)}
													/>

													<div className={styles.removeBtn}>
														<IconButton aria-label="delete" onClick={() => onImageRemove(index)}>
															<CloseIcon style={{ color: 'white' }} />
														</IconButton>
													</div>
												</div>
											);
										})}
									</div>
								</div>
							)}
						</ImageUploading>
					)}

					{rorImages.length > 0 && activeImageViewer == 'savedViewer' && <div>
						<p style={{ textAlign: 'center' }}>ROR Records</p>
						<div className={styles.imageRecordContainer}>
							{rorImages?.map((el, index) => {
								const imageSrc = rorImages?.map((_el) => {
									if (typeof _el === 'string') return _el;
									if (_el?.file) return URL.createObjectURL(_el?.file);
									return URL.createObjectURL(_el);
								});
								if (typeof el == 'string') {
									if (!el.includes('pdf'))
										return <img src={el} onClick={() => openImageViewer(index, imageSrc)} style={{ width: '7rem', margin: '0rem 1rem 1rem 1rem' }} />
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
										return <img src={objectURL} onClick={() => openImageViewer(index, imageSrc)} style={{ width: '7rem', margin: '0rem 1rem 1rem 1rem' }} />
									}
								}
							})}
						</div>
					</div>}

					{activeImageViewer == 'editableViewer' && <> <Button component="label" role={undefined} tabIndex={-1} variant="outlined" sx={{ width: '80%', marginTop: 0, marginBottom: 10 }}>
						Upload ROR Records PDF
						<VisuallyHiddenInput onChange={handlePdfUpload} accept="application/pdf,application/vnd.ms-excel" type="file" />
					</Button>

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
					</>
					}

					{pdfModal && <CommonModal sx={{ height: '100vh', maxWidth: '100vw', margin: 0, padding: 0 }}>
						<Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
							<Viewer defaultLayoutPlugin={[defaultLayoutPluginInstance]} fileUrl={currentPdf} />
						</Worker>
						<div className={styles.goBackBtn} onClick={() => { setCurrentPdf(null); showPdfModal(false); }}>Go Back</div>
					</CommonModal>}
				</>
			)}

			{isViewerOpen && (
				<ImageViewer
					src={viewerSource}
					currentIndex={currentImage}
					disableScroll={false}
					closeOnClickOutside
					onClose={closeImageViewer}
					backgroundStyle={{
						background: '#fff',
						zIndex: 10
					}}
					closeComponent={
						<div>
							<IconButton aria-label="delete" style={{ background: 'black' }}>
								<CloseIcon style={{ color: 'white' }} />
							</IconButton>
						</div>
					}
				/>
			)}
			{!submittedModal && formEditable && (
				<div className={styles.btnContainer}>
					<Button
						variant="contained"
						style={{ position: 'relative' }}
						color="success"
						size="large"
						onClick={() => setActiveStep(1)}
						className={styles.submitBtn}
					>
						Back
					</Button>
					<Button
						variant="contained"
						style={{ position: 'relative' }}
						color="success"
						size="large"
						type="submit"
						className={styles.submitBtn}
					>
						{isFeedbackPage ? 'Update' : 'Save'}
					</Button>
				</div>
			)}
			{!submittedModal && !formEditable && (
				<Button
					variant="contained"
					style={{ position: 'relative' }}
					color="success"
					size="large"
					onClick={() => setActiveStep(1)}
					className={styles.submitBtn}
				>
					Back
				</Button>
			)}
		</form>
	);
};

export default Step3;
