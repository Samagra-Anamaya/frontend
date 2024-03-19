import React from 'react';
import { useMachine } from '@xstate/react';
import { useSelector } from 'react-redux';
import { CircularProgress } from '@mui/material';
import AssignedLocations from './assigned-locations';
import authMachine from '../xstate/stateMachine';
import Home from './Home';

const Login = () => {
	const userData = useSelector((state) => state?.userData);
	const [current, send] = useMachine(authMachine);

	const isAuthenticated = userData?.isAuthenticated;
	if (isAuthenticated) {
		send('AUTHENTICATED');
	} else {
		send('UNAUTHENTICATED');
	}

	if (current) {
		return current.matches('authenticated') ? <AssignedLocations /> : <Home />;
	}
	return <CircularProgress />;
};

export default Login;
