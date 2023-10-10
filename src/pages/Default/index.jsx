"use client"
import React, { useEffect } from "react";
import AssignedLocations from "../assigned-locations";
import { useMachine } from '@xstate/react';
import authMachine from "../../xstate/stateMachine";
import Home from "../Home";
import { useSelector } from "react-redux";
const Login = () => {
  const userData = useSelector((state) => state?.userData)
  const [current, send] = useMachine(authMachine);

  const isAuthenticated = userData?.isAuthenticated;
  if (isAuthenticated) {
    send("AUTHENTICATED");
  } else {
    send("UNAUTHENTICATED");
  }

  if (current) {
    return current.value == "authenticated" ? (
      <AssignedLocations />
    ) : (
      <Home />
    );
  }
  else
    return <div>hello</div>
};

export default Login;
