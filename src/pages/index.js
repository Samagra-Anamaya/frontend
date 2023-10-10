import React, { useEffect } from "react";
import AssignedLocations from "./assigned-locations";
import { useUserData } from "../hooks/useAuth";
import { useMachine } from '@xstate/react';
import authMachine from "../xstate/stateMachine";
import Home from "./Home";
import { useSelector } from "react-redux";
const Login = () => {
  const userData = useSelector(state => state?.userData)
  const [current, send] = useMachine(authMachine);

  const isAuthenticated = userData?.isAuthenticated;
  if (isAuthenticated) {
    send("AUTHENTICATED");
  } else {
    send("UNAUTHENTICATED");
  }

  console.log("hello", userData, current, isAuthenticated)

  if (current) {
    console.log(current.value)
    return current.matches("authenticated") ? (
      <AssignedLocations />
    ) : (
      <Home />
    );
  }
  else
    return <div>hello</div>
};

export default Login;
