/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */

import React, { useCallback, useState } from 'react';
import { toast } from 'react-toastify';
import { Button, FormControl, InputLabel, MenuItem, Select, TextField } from '@mui/material';
import ImageViewer from 'react-simple-image-viewer';
import ImageUploading from 'react-images-uploading';
import styles from './step.module.scss';

const Step3 = ({
	setActiveStep,
	formEditable,
	setFormState,
	formState,
	rorImages,
	handleRorImages,
	handleSubmit,
	submittedModal
}) => {
	const [isViewerOpen, setIsViewerOpen] = useState(false);
	const [currentImage, setCurrentImage] = useState(0);
	const openImageViewer = useCallback((index) => {
		setCurrentImage(index);
		setIsViewerOpen(true);
	}, []);

	const closeImageViewer = useCallback(() => {
		setCurrentImage(0);
		setIsViewerOpen(false);
	}, []);

	const onFormSubmit = useCallback(
		(e) => {
			e?.preventDefault();
			if (formState?.rorUpdated && !rorImages.length) {
				toast('Please upload ROR records!', {
					type: 'error'
				});
				return;
			}
			if (
				formState?.forestLandType === 'revenueForest' &&
				formState?.typeOfBlock === 'revenueBlock' &&
				formState?.fraPlotsClaimed === 0
			) {
				toast('Plots claimed cannot be zero!', {
					type: 'error'
				});
				return;
			}
			handleSubmit();
		},
		[
			formState?.forestLandType,
			formState?.fraPlotsClaimed,
			formState?.rorUpdated,
			formState?.typeOfBlock,
			handleSubmit,
			rorImages.length
		]
	);

	return (
		<form onSubmit={onFormSubmit} className={styles.userForm}>
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

			{formState?.rorUpdated ? (
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
					/>
					{formEditable && (
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
										{imageList.map((image, index) => (
											<div key={index} className="image-item">
												<img
													src={image.ror_records}
													alt=""
													width="100"
													onClick={() => openImageViewer(index)}
												/>
												<div className="image-item__btn-wrapper">
													<Button
														variant="outlined"
														color="error"
														onClick={() => onImageRemove(index)}
													>
														Remove
													</Button>
												</div>
											</div>
										))}
										{isViewerOpen && (
											<ImageViewer
												src={imageList.map((el) => el.ror_records)}
												currentIndex={currentImage}
												disableScroll={false}
												closeOnClickOutside
												onClose={closeImageViewer}
												backgroundStyle={{
													background: '#fff',
													zIndex: 10,
													border: '5px solid #017922'
												}}
												closeComponent={
													<p
														style={{
															fontSize: '2rem',
															color: '#000',
															opacity: 1,
															paddingRight: '1rem'
														}}
													>
														x
													</p>
												}
											/>
										)}
									</div>
								</div>
							)}
						</ImageUploading>
					)}
					{rorImages.length > 0 && !formEditable && (
						<div>
							<p style={{ textAlign: 'center' }}>ROR Record Images</p>
							<div className={styles.imageRecordContainer}>
								{rorImages?.map((el, index) => {
									if (typeof el === 'string') {
										return (
											<img
												key={el}
												src={el}
												alt="logo"
												onClick={() => openImageViewer(index)}
												style={{ width: '7rem', margin: '0rem 1rem 1rem 1rem' }}
											/>
										);
									}

									const objectURL = URL.createObjectURL(el);
									return (
										<img
											key={el}
											alt="logo"
											src={objectURL}
											onClick={() => openImageViewer(index)}
											style={{ width: '7rem', margin: '0rem 1rem 1rem 1rem' }}
										/>
									);
								})}
							</div>
							{isViewerOpen && (
								<ImageViewer
									src={rorImages.map((el) =>
										typeof el === 'string' ? el : URL.createObjectURL(el)
									)}
									currentIndex={currentImage}
									disableScroll={false}
									closeOnClickOutside
									onClose={closeImageViewer}
									backgroundStyle={{
										background: '#fff',
										zIndex: 10,
										border: '5px solid #017922'
									}}
									closeComponent={
										<p
											style={{
												fontSize: '3rem',
												color: '#000',
												opacity: 1,
												paddingRight: '1rem'
											}}
										>
											X
										</p>
									}
								/>
							)}
						</div>
					)}
				</>
			) : (
				<></>
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
						Save
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
