import '@/styles/globals.css'
import { OfflineSyncProvider } from 'offline-sync-handler-test';
import { Provider } from 'react-redux';
import { store } from '../redux/store'
import { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { analytics } from '../services/firebase/firebase';
import { logEvent } from "firebase/analytics";
import 'animate.css';

export default function App({ Component, pageProps }) {
  const [hydrated, setHydrated] = useState(false);
  const onSyncSuccess = (response) => {

    if (navigator.onLine)
      console.log("sync response -->", response)
    toast(`☁️  ${response?.data?.data?.submissionData?.beneficiaryName}'s data synced with server `, {
      position: "top-center",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
    });
  };


  useEffect(() => {
    window.addEventListener('offline', () => {
      toast.error('Operating now in offline mode!', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    })
    window.addEventListener('online', () => {
      toast.success('App is back online', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    })
    setHydrated(true);
    logEvent(analytics, 'Test Logger');
  }, [])


  return hydrated ? <Provider store={store} data-testid="redux-provider">
    <OfflineSyncProvider onSyncSuccess={onSyncSuccess}>
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
  </Provider> : null;
}
