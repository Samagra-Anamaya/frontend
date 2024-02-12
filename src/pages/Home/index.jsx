"use client"
import React, { useEffect, useState } from "react";
import ROUTE_MAP from "../../services/routing/routeMap";
import styles from './index.module.scss';
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { sendLogs, userLogin } from "../../services/api";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { CircularProgress } from "@mui/material";
import { toast } from "react-toastify";
import { logEvent } from "firebase/analytics";
import { analytics } from "../../services/firebase/firebase";
import Banner from "../../components/Banner";
import { loginUser } from "../../redux/actions/login";
import Footer from "../../components/Footer";
import isOnline from "is-online";
import * as Sentry from "@sentry/nextjs";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { IconButton, InputAdornment } from "@mui/material";
import { useFlags, useFlagsmith } from 'flagsmith/react';

const Home = () => {
  const dispatch = useDispatch();
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [usernameError, setUsernameError] = useState(false)
  const [passwordError, setPasswordError] = useState(false)
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [apiCall, setApiCall] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { disableuserlogs } = useFlags(['disableuserlogs']);

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  // Utility function to check if user is admin
  function userIsAdminForPortal(registrations) {
    const currentRegistration = registrations[0];
    return (
      currentRegistration !== null &&
      currentRegistration.roles.includes("Admin")
    );
  }

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 2000)
    logEvent(analytics, "page_view")
  }, [])

  const handleSubmit = async (event) => {
    if (apiCall) return;
    event.preventDefault()
    setUsernameError(false)
    setPasswordError(false)

    if (username == '' || !/^[a-zA-Z]{2}_\d+$/.test(username)) {
      setUsernameError(true)
      return;
    }
    if (password == '') {
      setPasswordError(true)
      return;
    }
    setApiCall(true);
    const online = await isOnline();
    if (!online) {
      toast.error('Unable to login while being offline, please try again later once back in network')
      return;
    }
    try {
      const loginRes = await userLogin(username, password);

      if (loginRes?.params?.errMsg && loginRes.responseCode == "FAILURE") {
        if (!loginRes?.params?.errMsg == 'Invalid Username/Password') {
          Sentry.captureException({ loginRes, username, password });
          sendLogs({ meta: 'at login submit inside try', gpId: username, error: loginRes?.params?.errMsg }, disableuserlogs?.enabled ? disableuserlogs?.value?.split(',')?.includes(username) : true)
        }
        logEvent(analytics, "login_failure", {
          user_id: username
        })
        setApiCall(false);
        toast.error(loginRes?.params?.errMsg)
        return;
      }

      if (loginRes.responseCode == "OK" && loginRes.result) {
        let loggedInUser = loginRes.result.data.user;
        logEvent(analytics, "login_success", {
          user_id: username
        })
        dispatch(loginUser(loggedInUser)).then(res => {
          if (userIsAdminForPortal(loggedInUser.user.registrations)) {
            router.push(ROUTE_MAP.admin);
          } else {
            setTimeout(() => window.location.reload(), 200)
          }
        });
      } else {
        setError("An internal server error occured");
        setTimeout(() => {
          setError("");
        }, 3000);

      }
      setApiCall(false);
    } catch (err) {
      Sentry.captureException({ err: err?.message || err.toString(), username, password });
      toast.error(err?.message || err?.toString())
      sendLogs({ meta: 'at login submit inside catch', gpId: username, error: err?.message || err?.toString() }, disableuserlogs?.enabled ? disableuserlogs?.value?.split(',')?.includes(username) : true)
    }

  }



  return (
    <div className={styles.root}>
      {loading ?
        <div className={styles.loginContainer + " animate__animated animate__fadeIn"} style={{ alignItems: 'center', justifyContent: 'center' }}>
          <Banner />
        </div>
        :
        <>
          <div className={`${styles.loginContainer} card`}>
            <Banner />

            <div className={`${styles.loginFormContainer} my-auto text-left`}>
              <h3 className="">Data Collection App</h3>
              <p className={styles.loginText}><strong>Login to your account</strong></p>
              <form autoComplete="off" onSubmit={handleSubmit} className={styles.loginForm + " animate__animated animate__fadeIn"}>
                <TextField
                  label="Username"
                  id="username"
                  onChange={e => { setUsernameError(false); setUsername(e.target.value.toLowerCase()) }}
                  required
                  variant="filled"
                  sx={{ mb: 3 }}
                  fullWidth
                  value={username}
                  error={usernameError}
                  helperText={usernameError ? 'Please enter a valid username' : ''}
                />
                <TextField
                  label="Password"
                  onChange={e => { setPasswordError(false); setPassword(e.target.value) }}
                  required
                  variant="filled"
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  error={passwordError}
                  helperText={passwordError ? 'Please enter a valid password' : ''}
                  fullWidth
                  sx={{ mb: 3 }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end" sx={{ marginRight: '0.5rem' }}>
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() => {
                            logEvent(analytics, "show_password_icon_clicked", {
                              user_id: username
                            });
                            handleClickShowPassword()
                          }}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <span onClick={() => {
                  logEvent(analytics, "show_password_text_clicked", {
                    user_id: username
                  });
                  handleClickShowPassword()
                }} className={styles.showPasswordText}>{!showPassword ? 'Show Password' : 'Hide Password'}</span>
                <Button id="loginBtn" variant="contained" color="success" type="submit" sx={{ padding: 1, width: '80%', height: '3rem', fontSize: 16, marginTop: 5 }}>{apiCall ? <CircularProgress color="inherit" /> : 'Login'} </Button>
                {error?.length > 0 && <p style={{ color: 'red' }}>{error}</p>}
              </form>
            </div>
            <Footer />
          </div>
        </>}
    </div>
  );
};

export default Home;
