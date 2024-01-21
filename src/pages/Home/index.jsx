"use client";
import React, { useContext, useEffect, useState } from "react";
import ROUTE_MAP from "../../services/routing/routeMap";
import styles from "./index.module.scss";
// import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { userLogin } from "../../services/api";
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
import { ThemeContext } from "samagra-ui-test";
import {
  PasswordInput,
  Input,
  Button,
  Padding,
  Container,
} from "samagra-ui-test";
import { Text } from "samagra-ui-test";

const Home = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [usernameError, setUsernameError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [apiCall, setApiCall] = useState(false);

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
    }, 2000);
    logEvent(analytics, "page_view");
  }, []);

  const handleSubmit = async (event) => {
    if (apiCall) return;
    event.preventDefault();
    setApiCall(true);

    setUsernameError(false);
    setPasswordError(false);

    if (username == "") {
      setUsernameError(true);
      return;
    }
    if (password == "") {
      setPasswordError(true);
      return;
    }

    const online = await isOnline();
    if (!online) {
      toast.error(
        "Unable to login while being offline, please try again later once back in network"
      );
      return;
    }
    try {
      const loginRes = await userLogin(username, password);

      if (loginRes?.params?.errMsg && loginRes.responseCode == "FAILURE") {
        Sentry.captureException({ loginRes, username, password });
        logEvent(analytics, "login_failure", {
          user_id: username,
        });
        setApiCall(false);
        toast.error(loginRes?.params?.errMsg);
        return;
      }

      if (loginRes.responseCode == "OK" && loginRes.result) {
        let loggedInUser = loginRes.result.data.user;
        logEvent(analytics, "login_success", {
          user_id: username,
        });
        dispatch(loginUser(loggedInUser)).then((res) => {
          if (userIsAdminForPortal(loggedInUser.user.registrations)) {
            router.push(ROUTE_MAP.admin);
          } else {
            setTimeout(() => window.location.reload(), 200);
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
      Sentry.captureException({ err, username, password });
      toast.error(err?.message || err?.toString());
    }
  };

  const theme = useContext(ThemeContext);
  console.log({ theme });
  const lorem =
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras et augue risus. In fringilla sodales augue eu porttitor. Integer faucibus aliquam venenatis. Fusce eleifend sodales tellus vel malesuada. Mauris posuere diam ac tellus sollicitudin porta. Vestibulum pretium nulla nulla, vel blandit elit fringilla quis. Quisque neque nisl, condimentum malesuada turpis ac, viverra fermentum est. Nullam dui arcu, imperdiet quis placerat viverra, euismod eget odio. Ut id accumsan neque, vitae varius urna. Vestibulum scelerisque, velit eget mollis faucibus, libero nunc accumsan arcu, a dignissim ligula nunc nec nibh. Cras efficitur lobortis purus sit amet suscipit. Quisque pretium metus ut erat sagittis sollicitudin. Maecenas varius nisi eget rhoncus euismod.";
  return (
    <div className={styles.root}>
      {loading ? (
        <div
          className={
            styles.loginContainer + " animate__animated animate__fadeIn"
          }
          style={{ alignItems: "center", justifyContent: "center" }}
        >
          <Banner />
        </div>
      ) : (
        <>
          <div className={`${styles.loginContainer} card`}>
            <Banner />

            <div className={`${styles.loginFormContainer} my-auto text-left`}>
              <Text size="extralarge">Data Collection App</Text>
              <Text
                size="medium"
                color="success"
                weight={"bold"}
                className={styles.loginText}
              >
                Login to your account
              </Text>
              <form
                autoComplete="off"
                onSubmit={handleSubmit}
                className={
                  styles.loginForm + " animate__animated animate__fadeIn"
                }
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
                      label={"Login"}
                    />
                  </Padding>
                </Container>

                {error?.length > 0 && <p style={{ color: "red" }}>{error}</p>}
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
