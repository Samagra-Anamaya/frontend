"use client";
import React from "react";
import styles from "./index.module.scss";
import {
  TextField,
  Button,
  InputLabel,
  Select,
  MenuItem,
  FormControl,
} from "@mui/material";

import CircularProgress from "@mui/material/CircularProgress";
import DatePicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";
import moment from "moment";
const CitizenForm = (props) => {
  const {
    handleSubmit,
    setFormState,
    formState,
    currCitizen,
    submittedModal,
    loading,
    formEditable,
    mode,
  } = props;
  console.log("FORM EDITABLE -->", formEditable);
  console.log({formState})
  return (
    <form onSubmit={handleSubmit} className={styles.userForm}>
      <TextField
        variant="standard"
        label={!formEditable ? "" : "Beneficiary Name"}
        onChange={(e) =>
          setFormState((prevState) => ({
            ...prevState,
            beneficiaryName: e.target.value,
          }))
        }
        value={formState?.beneficiaryName}
        required
        sx={{ mb: 4, width: "80%" }}
        disabled={!formEditable ? true : false}
      />
      <TextField
        type={"text"}
        variant="standard"
        label={!formEditable ? "" : "Aadhar Number"}
        onChange={(e) => {
          if (/^[0-9]*$/.test(e.target.value))
            setFormState((prevState) => ({
              ...prevState,
              aadharNumber: e.target.value,
            }));
        }}
        value={formState?.aadharNumber}
        required
        inputProps={{ maxLength: 12, minLength: 12 }}
        disabled={!formEditable ? true : false}
        sx={{ mb: 4, width: "80%" }}
      />

      <DatePicker
      showIcon
      
        selected={formState?.dateOfBirth ? new Date(formState?.dateOfBirth): new Date()}
       className={styles.picker}
       placeholderText="Click to select a date"
        onChange={(date) =>
          setFormState((prevState) => ({
            ...prevState,
            dateOfBirth: moment(date).format('YYYY-MM-DD'),
          }))
        }
        peekNextMonth
        showMonthDropdown
        showYearDropdown
        dropdownMode="select"
    
       
        maxDate={new Date()}
      />
      {/* <TextField
        type="date"
        variant="standard"
        disableFuture
        label={
          !formEditable ? "" : formState?.dateOfBirth ? "Date Of Birth" : ""
        }
        onChange={(e) => {
          console.log(e.target.value);
          setFormState((prevState) => ({
            ...prevState,
            dateOfBirth: e.target.value,
          }));
        }}
        value={formState?.dateOfBirth}
        required
        disabled={!formEditable ? true : false}
        sx={{ mb: 4, width: "80%" }}
      /> */}

      {!formEditable ? (
        <TextField
          type="text"
          variant="standard"
          value={formState?.gender}
          required
          disabled={true}
          sx={{ mb: 4, width: "80%" }}
        />
      ) : (
        <FormControl sx={{ mb: 4, width: "80%" }}>
          <InputLabel id="demo-simple-select-label">Gender</InputLabel>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={formState?.gender}
            variant="standard"
            label="Gender"
            required
            onChange={(e) =>
              setFormState((prevState) => ({
                ...prevState,
                gender: e.target.value,
              }))
            }
          >
            <MenuItem value={"female"}>female</MenuItem>
            <MenuItem value={"male"}>male</MenuItem>
            <MenuItem value={"other"}>other</MenuItem>
          </Select>
        </FormControl>
      )}
      {mode == "qr"
        ? !submittedModal && (
            <Button
              variant="contained"
              color="success"
              size="large"
              type="submit"
              className={styles.submitBtn}
            >
              {loading ? <CircularProgress color="inherit" /> : "Submit Form"}{" "}
            </Button>
          )
        : formEditable &&
          !submittedModal && (
            <Button
              variant="contained"
              color="success"
              size="large"
              type="submit"
              className={styles.submitBtn}
            >
              {loading ? <CircularProgress color="inherit" /> : "Submit Form"}{" "}
            </Button>
          )}
    </form>
  );
};

export default CitizenForm;
