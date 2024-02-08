'use client';

import React, { useEffect } from 'react';
import { useMachine } from '@xstate/react';
import { useSelector } from 'react-redux';
import AssignedLocations from '../assigned-locations';
import authMachine from '../../xstate/stateMachine';
import Home from '../Home';

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
		return current.value === 'authenticated' ? <AssignedLocations /> : <Home />;
	}
	return <div>hello</div>;
};

export default Login;
