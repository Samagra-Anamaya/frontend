/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useCallback, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { Button, FormControl, InputLabel, MenuItem, Select, TextField } from '@mui/material';
import ImageViewer from 'react-simple-image-viewer';
import ImageUploading from 'react-images-uploading';
import Autocomplete from '@mui/material/Autocomplete';
import { getTbName } from '../CitizenForm/tribe-names';
import styles from './step.module.scss';

const Step2 = ({
	setActiveStep,
	formEditable,
	setFormState,
	formState,
	landImages,
	handleLandImages
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

	const tribeOptions = useMemo(() => getTbName(), []);

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
			/>
			{landImages.length > 0 && !formEditable && (
				<div>
					<p style={{ textAlign: 'center' }}>Land Record Images</p>
					<div className={styles.imageRecordContainer}>
						{landImages?.map((el, index) => {
							if (typeof el === 'string') {
								return (
									<img
										key={el}
										src={el}
										alt="icon"
										onClick={() => openImageViewer(index)}
										style={{ width: '7rem', margin: '0rem 1rem 1rem 1rem' }}
									/>
								);
							}
							const objectURL = URL.createObjectURL(el);

							return (
								<img
									key={el}
									alt="icon"
									src={objectURL}
									onClick={() => openImageViewer(index)}
									style={{ width: '7rem', margin: '0rem 1rem 1rem 1rem' }}
								/>
							);
						})}
					</div>
					{isViewerOpen && (
						<ImageViewer
							src={landImages}
							currentIndex={currentImage}
							disableScroll={false}
							closeOnClickOutside
							onClose={closeImageViewer}
							backgroundStyle={{ background: '#fff', zIndex: 10, border: '5px solid #017922' }}
							closeComponent={
								<p style={{ fontSize: '3rem', color: '#000', opacity: 1, paddingRight: '1rem' }}>
									X
								</p>
							}
						/>
					)}
				</div>
			)}
			{formState?.landTitleSerialNumber && formEditable && (
				<>
					<ImageUploading
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
							dragProps
						}) => (
							<div className={styles.uploadImageWrapper}>
								<Button onClick={onImageUpload} {...dragProps} variant="outlined">
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
											<img
												src={image.land_records}
												alt=""
												width="100"
												onClick={() => openImageViewer(index)}
											/>
											<div className="image-item__btn-wrapper">
												<Button
													color="error"
													variant="outlined"
													onClick={() => onImageRemove(index)}
												>
													Remove
												</Button>
											</div>
										</div>
									))}
									{isViewerOpen && (
										<ImageViewer
											src={imageList.map((el) => el.land_records)}
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
							</div>
						)}
					</ImageUploading>
				</>
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
			/>

			<TextField
				variant="standard"
				label={'No. of Co Claimants'}
				onChange={(e) => {
					const newValue = e.target.value;
					if (
						newValue === '' ||
						(parseInt(newValue, 10) >= 0 && parseInt(newValue, 10) <= 20 && /^\d+$/.test(newValue))
					) {
						console.log('inside newvalue', newValue);
						setFormState((prevState) => ({ ...prevState, noOfCoClaimants: newValue }));
					}
				}}
				value={formState?.noOfCoClaimants || ''}
				required
				sx={{ mb: 4, width: '80%' }}
				disabled={!formEditable}
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
			/>
			<TextField
				variant="standard"
				label={'Full Address'}
				onChange={(e) => setFormState((prevState) => ({ ...prevState, address: e.target.value }))}
				value={formState?.address}
				required
				sx={{ mb: 4, width: '80%' }}
				disabled={!formEditable}
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
