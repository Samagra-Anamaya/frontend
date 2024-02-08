'use client';

import '../styles/globals.css';
import { OfflineSyncProvider } from 'offline-sync-handler-test';
import { Provider } from 'react-redux';

import React, { useState, useEffect, useCallback } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { logEvent } from 'firebase/analytics';
import 'animate.css';
// eslint-disable-next-line import/no-unresolved
import 'bootstrap-css-only/css/bootstrap.min.css';
import 'mdbreact/dist/css/mdb.css';

import localforage from 'localforage';
import { CircularProgress, Button } from '@mui/material';
import Lottie from 'react-lottie';

import { ThemeProvider } from 'samagra-ui-test';
import CommonModal from '../components/Modal';
import { _updateSubmissionMedia } from '../redux/actions/updateSubmissionMedia';
import { removeCitizenImageRecord } from '../services/utils';
import { analytics } from '../services/firebase/firebase';
import { store, updateCanSubmit, updateIsOffline, updatePendingSubmissions } from '../redux/store';
import { modalStyles, lotteDefaultOptions as defaultOptions } from '../utils';
import { OfflineTag } from '../components/Offline';

export default function App({ Component, pageProps }) {
	// const [isFirstLoad, setIsFirstLoad] = useState(true);
	const [hydrated, setHydrated] = useState(false);

	const [syncing, setSyncing] = useState(false);
	const [syncComplete, setSyncComplete] = useState(true);
	const [isDesktop, setIsDesktop] = useState(true);

	const onSyncSuccess = async (response) => {
		const apiRequests = await localforage.getItem('apiRequests');

		if (store.getState().userData.isOffline && apiRequests?.length > 0 && !syncing) {
			setSyncing(true);
		}

		if (response?.config?.meta?.citizenId) {
			store?.dispatch(_updateSubmissionMedia(response?.data?.data?.result)).then(async (res) => {
				if (res?.type?.includes('fulfilled')) {
					removeCitizenImageRecord(response?.config?.meta?.citizenId);
				}
			});

			if (store.getState().userData.isOffline) {
				const ps = [...store.getState().userData.pendingSubmissions];
				if (!ps.includes(response?.config?.meta?.villageId))
					ps.push(response?.config?.meta?.villageId);
				store.dispatch(updatePendingSubmissions(ps));
			}

			if (apiRequests?.length === 1) {
				if (store.getState().userData.isOffline) {
					store.dispatch(updateIsOffline(false));
					setTimeout(() => {
						setSyncComplete(true);
						window.location.reload();
					}, 1000);
				}
			}
		}
	};

	useEffect(() => {
		setHydrated(true);
		logEvent(analytics, 'page_view');
		if (window.innerWidth > 500) setIsDesktop(true);
		else setIsDesktop(false);
	}, []);

	const onStatusChange = useCallback(({ isOnline }) => {
		// console.log('sexy:', { isFirstLoad, isOnline });
		// if (isFirstLoad && isOnline) {
		// 	setIsFirstLoad(false);
		// 	return;
		// }
		if (isOnline) {
			toast.success('App is back online', {
				position: 'top-right',
				autoClose: 2500,
				hideProgressBar: false,
				closeOnClick: true,
				pauseOnHover: true,
				draggable: true,
				progress: undefined,
				theme: 'light'
			});
			store?.dispatch(updateCanSubmit(true));
		} else {
			toast.error('Operating now in offline mode!', {
				position: 'top-right',
				autoClose: 2500,
				hideProgressBar: false,
				closeOnClick: true,
				pauseOnHover: true,
				draggable: true,
				progress: undefined,
				theme: 'light'
			});

			store?.dispatch(updateIsOffline(true));
			store?.dispatch(updateCanSubmit(false));
		}
	}, []);

	if (typeof window === 'undefined' || !hydrated) return null;
	return (
		// eslint-disable-next-line react/jsx-filename-extension
		<ThemeProvider>
			<div className={isDesktop ? 'rootDiv' : null}>
				<Provider store={store} data-testid="redux-provider">
					<OfflineSyncProvider
						onCallback={onSyncSuccess}
						render={OfflineTag}
						onStatusChange={onStatusChange}
					>
						<Component {...pageProps} />
					</OfflineSyncProvider>
					<ToastContainer
						position="top-center"
						autoClose={5000}
						hideProgressBar={false}
						newestOnTop={false}
						closeOnClick
						rtl={false}
						pauseOnFocusLoss
						draggable
						pauseOnHover
						theme="light"
					/>
					{syncing && (
						<CommonModal sx={{ maxHeight: '50vh', maxWidth: '80vw', overflow: 'scroll' }}>
							<div style={{ ...modalStyles.container, justifyContent: 'center' }}>
								{!syncComplete ? (
									<>
										<p style={modalStyles.mainText}>Please wait ✋, Media Sync in progress</p>
										<CircularProgress color="success" size={60} />
										<p style={modalStyles.warningText}>Do not refresh this page</p>
									</>
								) : (
									<>
										<Lottie
											options={defaultOptions}
											style={{ marginTop: -40, marginBottom: -20 }}
											height={200}
											width={200}
										/>
										<p style={modalStyles.mainText}>Media Sync Successful</p>
										<Button
											color="success"
											variant="contained"
											fullWidth
											onClick={() => {
												setSyncComplete(false);
												setSyncing(false);
												window.location.reload();
											}}
										>
											Done
										</Button>
									</>
								)}
							</div>
						</CommonModal>
					)}
				</Provider>
			</div>
		</ThemeProvider>
	);
}
