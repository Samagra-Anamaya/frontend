'use client';

import React, { useContext, useEffect, useState } from 'react';
// import Button from "@mui/material/Button";
import TextField from '@mui/material/TextField';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { CircularProgress } from '@mui/material';
import { toast } from 'react-toastify';
import { logEvent } from 'firebase/analytics';
import isOnline from 'is-online';
import * as Sentry from '@sentry/nextjs';
import { PasswordInput, Input, Button, Padding, Container, Text } from 'samagra-ui-test';
import Footer from '../../components/Footer';
import { loginUser } from '../../redux/actions/login';
import Banner from '../../components/Banner';
import { analytics } from '../../services/firebase/firebase';
import { userLogin } from '../../services/api';
import styles from './index.module.scss';
import ROUTE_MAP from '../../services/routing/routeMap';

const Home = () => {
	const dispatch = useDispatch();
	const router = useRouter();
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [usernameError, setUsernameError] = useState(false);
	const [passwordError, setPasswordError] = useState(false);
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(true);
	const [apiCall, setApiCall] = useState(false);

	// Utility function to check if user is admin
	function userIsAdminForPortal(registrations) {
		const currentRegistration = registrations[0];
		return currentRegistration !== null && currentRegistration.roles.includes('Admin');
	}

	useEffect(() => {
		setTimeout(() => {
			setLoading(false);
		}, 2000);
		logEvent(analytics, 'page_view');
	}, []);

	const handleSubmit = async (event) => {
		if (apiCall) return;
		event.preventDefault();
		setApiCall(true);

		setUsernameError(false);
		setPasswordError(false);

		if (username === '') {
			setUsernameError(true);
			return;
		}
		if (password === '') {
			setPasswordError(true);
			return;
		}

		const online = await isOnline();
		if (!online) {
			toast.error(
				'Unable to login while being offline, please try again later once back in network'
			);
			return;
		}
		try {
			const loginRes = await userLogin(username, password);

			if (loginRes?.params?.errMsg && loginRes.responseCode === 'FAILURE') {
				Sentry.captureException({ loginRes, username, password });
				logEvent(analytics, 'login_failure', {
					user_id: username
				});
				setApiCall(false);
				toast.error(loginRes?.params?.errMsg);
				return;
			}

			if (loginRes.responseCode === 'OK' && loginRes.result) {
				const loggedInUser = loginRes.result.data.user;
				logEvent(analytics, 'login_success', {
					user_id: username
				});
				dispatch(loginUser(loggedInUser)).then((res) => {
					if (userIsAdminForPortal(loggedInUser.user.registrations)) {
						router.push(ROUTE_MAP.admin);
					} else {
						setTimeout(() => window.location.reload(), 200);
					}
				});
			} else {
				setError('An internal server error occured');
				setTimeout(() => {
					setError('');
				}, 3000);
			}
			setApiCall(false);
		} catch (err) {
			Sentry.captureException({ err, username, password });
			toast.error(err?.message || err?.toString());
		}
	};

	return (
		<div className={styles.root}>
			{loading ? (
				<div
					className={`${styles.loginContainer} animate__animated animate__fadeIn`}
					style={{ alignItems: 'center', justifyContent: 'center' }}
				>
					<Banner />
				</div>
			) : (
				<>
					<div className={`${styles.loginContainer} card`}>
						<Banner />

						<div className={`${styles.loginFormContainer} my-auto text-left`}>
							<Text size="extralarge">Data Collection App</Text>
							<Text size="medium" color="success" weight={'bold'} className={styles.loginText}>
								Login to your account
							</Text>
							<form
								autoComplete="off"
								onSubmit={handleSubmit}
								className={`${styles.loginForm} animate__animated animate__fadeIn`}
							>
								<Container>
									<Padding bottom="small" width="100%">
										<Input
											label="Username"
											id="username"
											onChange={(e) => setUsername(e.target.value)}
											required
											variant="filled"
											fullWidth
											value={username}
											error={usernameError}
										/>
									</Padding>

									<PasswordInput
										label="Password"
										onChange={(e) => setPassword(e.target.value)}
										required
										variant="filled"
										id="password"
										type="password"
										value={password}
										error={passwordError}
										fullWidth
									/>

									<Padding width="100%" top="large">
										<Button
											id="loginBtn"
											type="default"
											loading={apiCall}
											color="success"
											width="fill"
											label={'Login'}
										/>
									</Padding>
								</Container>

								{error?.length > 0 && <p style={{ color: 'red' }}>{error}</p>}
							</form>
						</div>
						<Footer />
					</div>
				</>
			)}
		</div>
	);
};

export default Home;
