export const surveyPageModalStyles = {
	container: {
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		height: '100%',
		width: '100%'
	},
	mainContainer: {
		// background: 'green'
	},
	mainText: {
		fontSize: '1.4rem',
		color: '#007922',
		textAlign: 'center',
		lineHeight: '1.6rem',
		// margin: '2rem 0rem',
		fontWeight: 400
	},
	warningText: { color: 'red', textAlign: 'center', margin: '1rem 0 0 0', fontSize: '15px' },
	warningOfflineText: {
		color: '#f0952a',
		margin: '4rem 0rem',
		textAlign: 'center'
	},
	btnContainer: {
		width: '100%',
		display: 'flex',
		flexDirection: 'row',
		gap: '2rem',
		justifyContent: 'space-evenly',
		marginTop: '1rem'
	},
	confirmBtn: {
		width: '80%',
		// height: '3rem',
		background: '#017922',
		color: '#fff',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		borderRadius: '0.5rem',
		cursor: 'pointer',
		fontSize: '12px'
	},
	exitBtn: {
		width: '80%',
		//	height: '3rem',
		border: '1px solid #017922',
		color: '#017922',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		borderRadius: '0.5rem',
		cursor: 'pointer'
	}
};

export const surveyPageWarningModalStyles = {
	container: {
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		height: '100%',
		width: '100%'
	},
	mainText: {
		fontSize: '1.4rem',
		color: '#007922',
		textAlign: 'center',
		margin: '2rem 0rem'
	},
	warningText: { fontSize: '1.4rem', color: 'red', textAlign: 'center' },
	btnContainer: {
		width: '100%',
		display: 'flex',
		flexDirection: 'row',
		gap: '2rem',
		justifyContent: 'space-evenly',
		marginTop: '1rem'
	},
	confirmBtn: {
		width: '50%',
		height: '3rem',
		background: '#017922',
		color: '#fff',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		borderRadius: '0.5rem',
		cursor: 'pointer'
	},
	exitBtn: {
		width: '50%',
		height: '3rem',
		border: '1px solid #017922',
		color: '#017922',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		borderRadius: '0.5rem',
		cursor: 'pointer'
	}
};

export const bannerModalStyles = {
	container: { display: 'flex', flexDirection: 'column', alignItems: 'center', overflow: 'scroll' },
	warningText: {
		fontSize: '1rem',
		color: 'red',
		textAlign: 'center',
		marginTop: 10,
		fontWeight: 'bolder'
	},
	confirmationText: { fontSize: '1rem', textAlign: 'center', marginTop: 10, fontWeight: '500' },
	image: { height: '100%', width: '30%' },
	btnContainer: {
		width: '100%',
		display: 'flex',
		flexDirection: 'row',
		gap: '1rem',
		justifyContent: 'space-evenly',
		marginTop: 30
	},
	confirmBtn: {
		width: '50%',
		height: '3rem',
		background: '#017922',
		color: '#fff',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		borderRadius: '0.5rem',
		cursor: 'pointer'
	},
	exitBtn: {
		width: '50%',
		height: '3rem',
		border: '1px solid #017922',
		color: '#017922',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		borderRadius: '0.5rem',
		cursor: 'pointer'
	}
};
