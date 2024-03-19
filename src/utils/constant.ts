import * as done from './lottie/done.json';

export const modalStyles = {
	container: {
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		justifyContent: 'space-evenly',
		height: '100%',
		width: '100%'
	},
	mainText: {
		fontSize: '1.4rem',
		color: '#007922',
		textAlign: 'center',
		margin: '2rem 0rem',
		fontWeight: '400'
	},
	warningText: {
		color: 'red',
		textAlign: 'center',
		fontWeight: 'bold',
		marginTop: '2rem'
	}
};

export const lotteDefaultOptions = {
	loop: true,
	autoplay: true,
	animationData: done,
	rendererSettings: {
		preserveAspectRatio: 'xMidYMid slice'
	}
};
