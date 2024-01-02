"use client";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import styles from "./index.module.scss";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import CommonHeader from "../../components/Commonheader";
import { v4 as uuidv4 } from "uuid";
import {
  addCitizen,
  setCurrentCitizen,
  tokenSelector,
  updateSearchQuery,
} from "../../redux/store";
import {
  getVillageDetails,
  getVillageSubmissions,
  searchCitizen,
} from "../../services/api";
import Pagination from "@mui/material/Pagination";
import { TextField, InputAdornment, CircularProgress } from "@mui/material";
import { debounce } from "debounce";

import SearchIcon from "@mui/icons-material/Search";
import { MDBListGroup } from "mdbreact";
import ListItem from "../../components/ListItem";
import Banner from "../../components/Banner";
import Breadcrumb from "../../components/Breadcrumb";
import moment from "moment";
import Lottie from "react-lottie";
import * as emptyState from "public/lottie/emptyState.json";


// Lottie Options
const defaultOptions = {
  loop: true,
  autoplay: true,
  animationData: emptyState,
  rendererSettings: {
    preserveAspectRatio: "xMidYMid slice",
  },
};

const CompletedEntries = ({ params }) => {
  /* Component States and Refs*/
  const userData = useSelector((state) => state?.userData);
  const _currLocation = useSelector(
    (state) => state?.userData?.currentLocation
  );
  const [hydrated, setHydrated] = React.useState(false);
  const [citizens, setCitizens] = useState(_currLocation?.citizens || []);
  const [villageData, setVillageData] = useState({});
  const [currTab, setCurrTab] = React.useState(0);
  const [currPage, setCurrPage] = React.useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [prevSubmissions, setPrevSubmissions] = useState([]);
  const [prevTempSubmissions, setPrevTempSubmissions] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [fetching, setFetching] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();

  /* Use Effects */
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setHydrated(true);
    console.log(_currLocation);
    setSearchQuery(userData?.searchQuery?.[_currLocation.villageCode] || "");
    getVillageData();
  }, []);

  useEffect(() => {
    setCitizens(_currLocation?.citizens || []);
  }, [_currLocation]);

  useEffect(() => {
    getVillageSubmissionData();
  }, [currPage]);

  const debouncedSearch = debounce(async (query) => {
    console.log({ query, prevTempSubmissions })
    if (query?.length) {
      setFetching(true);
      let res = await searchCitizen(_currLocation.villageCode, query, userData.user);
      setPrevSubmissions(res?.result?.submissions || []);
      setFetching(false);
    } else setPrevSubmissions(prevTempSubmissions);
  }, 500);

  // useEffect(() => {
  //     async function searchCitizens() {
  //         console.log("search query->", searchQuery)
  //         if (searchQuery?.length) {
  //             setFetching(true)
  //             let res = await searchCitizen(_currLocation.villageCode, searchQuery)
  //             setPrevSubmissions(res?.result?.submissions || []);
  //             setFetching(false);
  //         } else setPrevSubmissions(prevTempSubmissions)
  //     }
  //     searchCitizens();
  // }, [searchQuery])

  const getVillageData = async () => {
    try {
      if (_currLocation?.villageCode) {
        let data = await getVillageDetails(_currLocation.villageCode);
        if (Object.keys(data?.result)?.length) setVillageData(data?.result);
      }
    } catch (err) {
      console.log(err);
    }
  };
  const token = useSelector(tokenSelector);
  console.log({ token, userData })
  const getVillageSubmissionData = async () => {
    try {
      if (_currLocation?.villageCode) {

        setFetching(true);
        let data = await getVillageSubmissions(
          _currLocation.villageCode,
          currPage,
          token
        );
        console.log("PREV SUBMISSIONS -->", data);
        setFetching(false);
        if (Object.keys(data)?.length) {
          setPrevSubmissions(data?.result?.submissions);
          setPrevTempSubmissions(data?.result?.submissions);
          setTotalPages(data?.result?.totalPages);
        }
      }
    } catch (err) {
      console.log(err);
      setFetching(false);
    }
  };

  const searchCitizenSubmission = useCallback(async (e) => {
    setSearchQuery(e.target.value);
    dispatch(
      updateSearchQuery({
        villageId: _currLocation.villageCode,
        query: e.target.value,
      })
    );

    debouncedSearch(e.target.value);
  }, []);

  function padTwoDigits(num) {
    return num.toString().padStart(2, "0");
  }

  const breadcrumbItems = useMemo(() => ([{ label: "Home", to: "/" }, { label: _currLocation?.villageName, to: "/survey" }, { label: "Synced Titles" }]), [_currLocation?.villageName])
  return !hydrated ? null : (
    <div className={styles.container}>
      <Banner />
      <Breadcrumb items={breadcrumbItems} />
      {/* <CommonHeader
        onBack={() => router.back()}
        text={`${_currLocation.villageName}`}
        subText={`Completed Entries`}
        showLogout={false}
        sx={{
          justifyContent: "space-between !important",
          padding: "2rem 1rem",
        }}
      /> */}

      <div
        className={
          styles.citizenContainer + ` animate__animated animate__fadeIn p-2`
        }
      >
        <div className={styles.submissionContainer}>
          {!(!fetching && !prevSubmissions?.length && !searchQuery) && <TextField
            id="search"
            color="success"
            type="search"
            label={searchQuery ? "" : "Search submissions here ..."}
            value={searchQuery}
            onChange={searchCitizenSubmission}
            sx={{
              marginBottom: ".75rem",
              border: "none",
              // border: "2px solid #007922",
              borderRadius: "1rem",
            }}
            fullWidth
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />}
          {fetching && <CircularProgress color="success" />}
          <MDBListGroup style={{ minWidth: '22rem' }} light>
            {!fetching &&
              prevSubmissions?.length > 0 &&
              prevSubmissions?.map((el) => (
                <ListItem
                  clName="titles"
                  key={el.id}
                  onSubBtnClick={() => {
                    console.log("sub btn clicked")
                  }}
                  leftImage={"/assets/citizen.svg"}
                  rightImage={"/assets/verified.png"}
                  mainText={el?.submissionData?.claimantName}
                  mainSubtext={moment(el?.updatedAt).format(
                    "DD MMM YYYY, hh:mm a"
                  )}
                  sx={{ background: "#fff", marginTop: '1rem', cursor: 'pointer' }}
                  mode={1}
                  imgWidth={'70%'}
                  onClick={() => {
                    dispatch(setCurrentCitizen(el));
                    router.push(`/citizen-survey`);
                  }}
                />
              ))}
          </MDBListGroup>
          {!fetching && !prevSubmissions?.length && !searchQuery && <div>
            <p className={styles.noRecordsFound}>No Records Found</p>
            <p className={styles.noRecordsSubText}>Please sync land titles before you access them</p>
            <Lottie
              options={defaultOptions}
              style={{ marginTop: -40 }}
              height={300}
              width={300}
            /></div>}
        </div>
        {!searchQuery && (
          <Pagination
            count={totalPages}
            color="success"
            onChange={(event, page) => setCurrPage(page)}
            className={styles.paginationContainer}
          />
        )}
      </div>
    </div>
  );
};

export default CompletedEntries;

{
  /* <div key={el.citizenId} className={styles.submittedCitizen}
onClick={() => { dispatch(setCurrentCitizen(el)); router.push(`/pages/citizen-survey`) }}>
{el?.submissionData?.beneficiaryName}
</div> */
}
