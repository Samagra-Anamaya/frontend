import React from 'react';
import {
	Button,
	FormControl,
	InputLabel,
	MenuItem,
	Select,
	TextField,
	Tooltip
} from '@mui/material';
import styles from './step.module.scss';

const Step1 = ({ onFormSubmit, formEditable, formState, setFormState, savedEntries }) => (
	<form onSubmit={onFormSubmit} className={styles.userForm}>
		{formEditable ? (
			<FormControl sx={{ mb: 4, width: '80%' }}>
				<InputLabel id="aadhar-select-label">Is Aadhaar Available?</InputLabel>
				<Select
					labelId="aadhar-select-label"
					id="aadhar-select"
					value={formState?.isAadhaarAvailable}
					variant="standard"
					label="Is Aadhaar Available"
					required
					className={styles.testClass}
					onChange={(e) => {
						setFormState((prevState) => ({
							...prevState,
							isAadhaarAvailable: e.target.value
						}));
						if (!e.target.value) setFormState((prevState) => ({ ...prevState, aadharNumber: '' }));
					}}
				>
					<MenuItem value>Yes</MenuItem>
					<MenuItem value={false}>No</MenuItem>
				</Select>
			</FormControl>
		) : (
			<TextField
				type={'text'}
				variant="standard"
				label={'Is Aadhaar Available?'}
				value={formState?.isAadhaarAvailable ? 'Yes' : 'No'}
				required
				inputProps={{ maxLength: 12, minLength: 12 }}
				disabled
				sx={{ mb: 4, width: '80%' }}
			/>
		)}

		{formState?.isAadhaarAvailable ? (
			<Tooltip title={!formEditable ? 'Aadhaar will be display in hashed format' : ''}>
				<TextField
					type={'text'}
					variant="standard"
					label={'Aadhaar Number'}
					onChange={(e) => {
						if (/^[0-9]*$/.test(e.target.value))
							setFormState((prevState) => ({
								...prevState,
								aadharNumber: e.target.value
							}));
					}}
					value={
						// eslint-disable-next-line no-nested-ternary
						savedEntries
							? `**** **** ${
									formState?.lastDigits ? formState?.lastDigits : formState?.aadharNumber.slice(8)
							  }`
							: formEditable
							? formState?.aadharNumber
							: `**** **** ${formState.lastDigits}`
					}
					required
					inputProps={{ maxLength: 12, minLength: 12 }}
					disabled={!formEditable}
					sx={{ mb: 4, width: '80%' }}
				/>
			</Tooltip>
		) : (
			<></>
		)}
		<Button
			variant="contained"
			sx={{ position: 'absolute', bottom: '10px' }}
			color="success"
			size="large"
			type="submit"
			className={styles.submitBtn}
		>
			Next
		</Button>
	</form>
);

export default Step1;
