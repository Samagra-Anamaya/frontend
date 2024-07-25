/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useCallback, useMemo, useState } from 'react';
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
import Autocomplete from '@mui/material/Autocomplete';
import CloseIcon from '@mui/icons-material/Close';
import { getTbName } from '../CitizenForm/tribe-names';
import styles from './step.module.scss';

const Step2 = ({
	setActiveStep,
	formEditable,
	setFormState,
	formState,
	landImages,
	handleLandImages,
	feedbacks,
	isFeedbackPage
}) => {
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

	const tribeOptions = useMemo(() => getTbName(), []);

	const activeImageViewer = useMemo(() => {
		if (isFeedbackPage) return 'feedbackViewer';
		if (landImages.length > 0 && !formEditable) return 'savedViewer';
		return 'editableViewer';
	}, [formEditable, isFeedbackPage, landImages.length]);

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				setActiveStep(1);
				if (formEditable && !landImages?.length) {
					toast('Please upload land records!', {
						type: 'error'
					});
					return;
				}
				setActiveStep(2);
			}}
			className={styles.userForm}
		>
			<TextField
				variant="standard"
				label={'Land Title Serial Number'}
				onChange={(e) =>
					setFormState((prevState) => ({ ...prevState, landTitleSerialNumber: e.target.value }))
				}
				value={formState?.landTitleSerialNumber}
				required
				sx={{ mb: 4, width: '80%' }}
				disabled={!formEditable}
				error={isFeedbackPage ? !!feedbacks?.landTitleSerialNumber : false}
				helperText={isFeedbackPage ? feedbacks?.landTitleSerialNumber || null : null}
			/>

			{activeImageViewer === 'feedbackViewer' && (
				<ImageUploading
					multiple
					value={landImages}
					onChange={handleLandImages}
					maxNumber={69}
					dataURLKey="land_records"
				>
					{({ imageList, onImageUpload, onImageRemove, isDragging, dragProps }) => (
						<div className={styles.uploadImageWrapper}>
							<Button onClick={onImageUpload} {...dragProps} variant="outlined">
								Upload New Land Records
							</Button>
							<div className={styles.imagePreviewContainer}>
								{imageList.map((image, index) => {
									const imageSrc = imageList.map((el) => el?.land_records || el);
									return (
										<div key={index} className={styles.imageItem}>
											<img
												src={image.land_records || image}
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
			{activeImageViewer === 'editableViewer' && (
				<ImageUploading
					multiple
					value={landImages}
					onChange={handleLandImages}
					maxNumber={69}
					dataURLKey="land_records"
				>
					{({ imageList, onImageUpload, onImageRemove, dragProps }) => (
						<div className={styles.uploadImageWrapper}>
							<Button onClick={onImageUpload} {...dragProps} variant="outlined">
								Upload Land Records
							</Button>
							<div className={styles.imagePreviewContainer}>
								{imageList.map((image, index) => {
									const imageSrc = landImages?.map((_el) => {
										if (typeof _el === 'string') return _el;
										if (_el?.file) return URL.createObjectURL(_el?.file);
										return URL.createObjectURL(_el);
									});
									return (
										<div key={index} className={styles.imageItem}>
											<img
												src={image.land_records}
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
			{activeImageViewer === 'savedViewer' && (
				<div>
					<p style={{ textAlign: 'center' }}>Land Record Images</p>
					<div className={styles.imageRecordContainer}>
						{landImages?.map((el, index) => {
							console.log(el, index)
							const imageSrc = landImages?.map((_el) => {
								if (typeof _el === 'string') return _el;
								if (_el?.file) return URL.createObjectURL(_el?.file);
								return URL.createObjectURL(_el);
							});
							if (typeof el === 'string') {
								return (
									<img
										key={el}
										src={el}
										alt="logo"
										style={{
											height: '100px',
											width: '140px',
											borderRadius: '10px',
											margin: '0.5rem',
											cursor: 'pointer'
										}}
										onClick={() => openImageViewer(index, imageSrc)}
									/>
								);
							}

							const objectURL = URL.createObjectURL(el?.file || el);
							return (
								<img
									key={el}
									alt="logo"
									src={objectURL}
									onClick={() => openImageViewer(index, imageSrc)}
									style={{
										height: '100px',
										width: '140px',
										borderRadius: '10px',
										margin: '0.5rem',
										cursor: 'pointer'
									}}
								/>
							);
						})}
					</div>
				</div>
			)}

			{isViewerOpen && (
				<ImageViewer
					src={viewerSource}
					currentIndex={currentImage}
					disableScroll={false}
					closeOnClickOutside
					onClose={closeImageViewer}
					backgroundStyle={{ background: '#fff', zIndex: 10, border: '5px solid #017922' }}
					closeComponent={
						<div>
							<IconButton aria-label="delete" style={{ background: 'black' }}>
								<CloseIcon style={{ color: 'white' }} />
							</IconButton>
						</div>
					}
				/>
			)}
			<TextField
				variant="standard"
				label={'Claimant Name'}
				onChange={(e) => {
					if (/^[a-zA-Z ]*$/.test(e.target.value))
						setFormState((prevState) => ({
							...prevState,
							claimantName: e.target.value
						}));
				}}
				value={formState?.claimantName || ''}
				required
				sx={{ mb: 4, width: '80%' }}
				disabled={!formEditable}
				error={isFeedbackPage ? !!feedbacks?.claimantName : false}
				helperText={isFeedbackPage ? feedbacks?.claimantName || null : null}
			/>

			<TextField
				variant="standard"
				label={'No. of Co Claimants'}
				onChange={(e) => {
					console.log("test:", e.target.value)
					const newValue = e.target.value;
					if (
						newValue === '' ||
						(parseInt(newValue, 10) >= 0 && parseInt(newValue, 10) <= 20 && /^\d+$/.test(newValue))
					) {
						setFormState((prevState) => ({ ...prevState, noOfCoClaimants: newValue }));
					}
				}}
				value={formState?.noOfCoClaimants || ''}
				required
				sx={{ mb: 4, width: '80%' }}
				disabled={!formEditable}
				error={isFeedbackPage ? !!feedbacks?.noOfCoClaimants : false}
				helperText={isFeedbackPage ? feedbacks?.noOfCoClaimants || null : null}
			/>
			{formState.noOfCoClaimants > 0 &&
				Array.from(Array(Number(formState.noOfCoClaimants)).keys()).map((el) => (
					<TextField
						key={el}
						variant="standard"
						label={`Co Claiamant ${el + 1} Name`}
						onChange={(e) => {
							if (/^[a-zA-Z ]*$/.test(e.target.value))
								setFormState((prevState) => ({
									...prevState,
									[`coClaimant${el + 1}`]: e.target.value
								}));
						}}
						value={formState?.[`coClaimant${el + 1}`] || ''}
						required
						sx={{ mb: 4, width: '80%' }}
						disabled={!formEditable}
					/>
				))}

			<TextField
				variant="standard"
				label={'No. of Dependents'}
				onChange={(e) => {
					const newValue = e.target.value;
					if (
						newValue === '' ||
						(parseInt(newValue, 10) >= 0 && parseInt(newValue, 10) <= 20 && /^\d+$/.test(newValue))
					) {
						setFormState((prevState) => ({ ...prevState, noOfDependents: newValue }));
					}
				}}
				value={formState?.noOfDependents || ''}
				required
				sx={{ mb: 4, width: '80%' }}
				disabled={!formEditable}
				error={isFeedbackPage ? !!feedbacks?.noOfDependents : false}
				helperText={isFeedbackPage ? feedbacks?.noOfDependents || null : null}
			/>
			{formState.noOfDependents > 0 &&
				Array.from(Array(Number(formState.noOfDependents)).keys()).map((el) => (
					<TextField
						key={el}
						variant="standard"
						label={`Dependent ${el + 1} Name`}
						onChange={(e) => {
							if (/^[a-zA-Z ]*$/.test(e.target.value))
								setFormState((prevState) => ({
									...prevState,
									[`dependent${el + 1}`]: e.target.value
								}));
						}}
						value={formState?.[`dependent${el + 1}`] || ''}
						required
						sx={{ mb: 4, width: '80%' }}
						disabled={!formEditable}
					/>
				))}

			<TextField
				variant="standard"
				label={"Mother/Father's Name"}
				onChange={(e) => {
					if (/^[a-zA-Z ]*$/.test(e.target.value))
						setFormState((prevState) => ({ ...prevState, parentName: e.target.value }));
				}}
				value={formState?.parentName || ''}
				required
				sx={{ mb: 4, width: '80%' }}
				disabled={!formEditable}
				error={isFeedbackPage ? !!feedbacks?.parentName : false}
				helperText={isFeedbackPage ? feedbacks?.parentName || null : null}
			/>
			<TextField
				variant="standard"
				label={'Full Address'}
				onChange={(e) => setFormState((prevState) => ({ ...prevState, address: e.target.value }))}
				value={formState?.address}
				required
				sx={{ mb: 4, width: '80%' }}
				disabled={!formEditable}
				error={isFeedbackPage ? !!feedbacks?.address : null}
				helperText={isFeedbackPage ? feedbacks?.address || null : null}
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
			{formEditable && (
				<Autocomplete
					disablePortal
					id="tribe-input"
					options={tribeOptions}
					sx={{ mb: 4, width: '80%' }}
					value={formState?.tribeName}
					disableClearable
					onChange={(e, value) => {
						setFormState((prevState) => ({ ...prevState, tribeName: value?.label }));
					}}
					renderInput={(params) => (
						<TextField
							{...params}
							variant="standard"
							required
							label={'Tribe Name'}
							InputProps={{
								...params.InputProps,
								type: 'search'
							}}
						/>
					)}
				/>
			)}
			{!formEditable && (
				<TextField
					variant="standard"
					label={'Tribe Name'}
					value={formState?.tribeName}
					required
					sx={{ mb: 4, width: '80%' }}
					disabled={!formEditable}
				/>
			)}
			{formEditable && (
				<FormControl sx={{ mb: 4, width: '80%' }}>
					<InputLabel id="area-units-label">Area Units</InputLabel>
					<Select
						labelId="area-units-label"
						id="area-units"
						value={formState?.areaUnits}
						variant="standard"
						label="Area Units"
						required
						onChange={(e) =>
							setFormState((prevState) => ({ ...prevState, areaUnits: e.target.value }))
						}
					>
						<MenuItem value={'Acres'}>Acres</MenuItem>
						<MenuItem value={'Hectares'}>Hectares</MenuItem>
					</Select>
				</FormControl>
			)}
			{!formEditable && (
				<TextField
					variant="standard"
					label={'Area Units'}
					value={formState?.areaUnits}
					required
					sx={{ mb: 4, width: '80%' }}
					disabled={!formEditable}
				/>
			)}
			<TextField
				variant="standard"
				label={'Area'}
				onChange={(e) => {
					const newValue = e.target.value;
					if (newValue === '' || parseFloat(newValue, 10) >= 0) {
						setFormState((prevState) => ({ ...prevState, area: newValue }));
					}
				}}
				inputProps={{ type: 'number', step: 'any' }}
				value={formState?.area || ''}
				required
				sx={{ mb: 4, width: '80%' }}
				disabled={!formEditable}
				error={isFeedbackPage ? !!feedbacks?.area : false}
				helperText={isFeedbackPage ? feedbacks?.area || null : null}
			/>
			<TextField
				variant="standard"
				label={'Description of boundaries by prominent landmarks including khasra/compartment No'}
				onChange={(e) =>
					setFormState((prevState) => ({ ...prevState, boundariesDesc: e.target.value }))
				}
				value={formState?.boundariesDesc}
				required
				sx={{ mb: 4, width: '80%' }}
				disabled={!formEditable}
				error={isFeedbackPage ? !!feedbacks?.boundariesDesc : false}
				helperText={isFeedbackPage ? feedbacks?.boundariesDesc || null : null}
			/>
			<div className={styles.btnContainer}>
				<Button
					variant="contained"
					style={{ position: 'relative' }}
					color="success"
					size="large"
					onClick={() => setActiveStep(0)}
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
					Next
				</Button>
			</div>
		</form>
	);
};

export default Step2;
