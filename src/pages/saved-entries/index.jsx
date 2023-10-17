"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import styles from "./index.module.scss";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import CommonHeader from "../../components/Commonheader";
import { v4 as uuidv4 } from "uuid";
import {
  addCitizen,
  setCurrentCitizen,
  updateCitizenFormData,
  updateSearchQuery,
  updateSearchSavedQuery,
} from "../../redux/store";
import {
  getVillageDetails,
  getVillageSubmissions,
  searchCitizen,
  uploadMedia,
} from "../../services/api";
import Pagination from "@mui/material/Pagination";
import { TextField, InputAdornment, CircularProgress } from "@mui/material";
import { debounce } from "debounce";
import GovtBanner from "../../components/GovtBanner";
import SelectionItem from "../../components/SelectionItem";
import SearchIcon from "@mui/icons-material/Search";
import { toast } from "react-toastify";

const SavedEntries = ({ params }) => {
  /* Component States and Refs*/
  const userData = useSelector((state) => state?.userData);
  const submissions = useSelector((state) => state?.userData?.submissions);
  const _currLocation = useSelector(
    (state) => state?.userData?.currentLocation
  );
  const [limit, setLimit] = useState(5);
  const [hydrated, setHydrated] = React.useState(false);
  const [citizens, setCitizens] = useState(_currLocation?.citizens || []);
  const [villageData, setVillageData] = useState({});
  const [currTab, setCurrTab] = React.useState(0);
  const [currPage, setCurrPage] = React.useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [prevSubmissions, setPrevSubmissions] = useState([]);
  let prevTempSubmissions = useRef([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [fetching, setFetching] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();
  const containerRef = useRef();

  /* Use Effects */
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setHydrated(true);
    console.log(_currLocation);
    setSearchQuery(
      userData?.searchSavedQuery?.[_currLocation.villageCode] || ""
    );
    let totalPages = Math.ceil(
      submissions?.[_currLocation.villageCode]?.length / limit
    );
    setTotalPages(totalPages || 0);
  }, []);

  useEffect(() => {
    setCitizens(_currLocation?.citizens || []);
  }, [_currLocation]);

  useEffect(() => {
    let newSubmissions = submissions?.[_currLocation.villageCode];
    if (newSubmissions?.length) {
      let newIndex = (currPage - 1) * limit;
      const paginatedSubmissions = newSubmissions.slice(
        newIndex,
        newIndex + limit
      );
      setPrevSubmissions(paginatedSubmissions);
      prevTempSubmissions.current = paginatedSubmissions;
    }
  }, [currPage]);

  useEffect(() => {
    if (searchQuery?.length) {
      let newSubmissions = submissions?.[_currLocation.villageCode];
      if (newSubmissions?.length) {
        let res = newSubmissions?.filter(
          (el) =>
            el?.submissionData?.beneficiaryName
              ?.toLowerCase()
              ?.startsWith(searchQuery.toLowerCase()) ||
            el?.submissionData?.aadharNumber?.startsWith(
              searchQuery.toLowerCase()
            )
        );
        console.log(res);
        setPrevSubmissions(res);
      }
    } else {
      setPrevSubmissions(prevTempSubmissions.current);
    }
  }, [searchQuery]);

  const searchCitizenSubmission = async (e) => {
    setSearchQuery(e.target.value);
    dispatch(
      updateSearchSavedQuery({
        villageId: _currLocation.villageCode,
        query: e.target.value,
      })
    );
  };

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollIntoView();
    }
  });

  const onMediaUpload = useCallback(async (el) => {
    let newSubmission = Object.assign({}, el);
    let landRecords, rorRecords;

    if (el.submissionData.landRecords) {
      landRecords = await uploadMedia(el.submissionData.landRecords);
      if (landRecords.err) {
        toast.error(landRecords?.err?.response?.data?.message);
      }
    }
    if (el.submissionData.rorRecords) {
      rorRecords = await uploadMedia(el.submissionData.rorRecords);
      if (rorRecords.err) {
        toast.error(rorRecords?.err?.response?.data?.message);
      }
    }
    newSubmission = {
      ...newSubmission,
      submissionData: {
        ...newSubmission?.submissionData,
        landRecords,
        rorRecords,
        imageUploaded: true,
      },
    };
    dispatch(updateCitizenFormData(newSubmission));
  }, []);
  console.log("pevSubmissions : ", prevSubmissions);
  return !hydrated ? null : (
    <div className={styles.container} ref={containerRef}>
      <GovtBanner sx={{ paddingTop: "1rem" }} />
      <CommonHeader
        onBack={() => router.back()}
        text={`${_currLocation.villageName}`}
        subText={`Saved Entries`}
        showLogout={false}
        sx={{
          justifyContent: "space-between !important",
          padding: "2rem 1rem",
        }}
      />

      <div
        className={
          styles.citizenContainer + ` animate__animated animate__fadeInUp`
        }
      >
        <div className={styles.submissionContainer}>
          <TextField
            id="search"
            color="success"
            type="search"
            label={searchQuery ? "" : "Search entries here ..."}
            value={searchQuery}
            onChange={searchCitizenSubmission}
            sx={{
              marginBottom: "2rem",
              border: "none",
              border: "2px solid #007922",
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
          />
          {fetching && <CircularProgress color="success" />}
          {!fetching &&
            prevSubmissions?.length > 0 &&
            prevSubmissions?.map((el) => (
              <SelectionItem
                key={el.citizenId}
                leftImage={"/assets/citizen.png"}
                //rightImage={"/assets/upload-icon.png"}
                rightActionLogo={"/assets/upload-icon.png"}
                mainText={el?.submissionData?.parentName}
                onSubBtnClick={
                  el?.submissionData?.imageUploaded
                    ? null
                    : () => onMediaUpload(el)
                }
                sx={{ background: "#fff", marginBottom: "1rem" }}
                mode={1}
                imgWidth="70%"
                onClick={() => {
                  dispatch(setCurrentCitizen(el));
                  router.push(`/citizen-survey`);
                }}
              />
            ))}
        </div>
        {!searchQuery && !fetching && (
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

export default SavedEntries;

{
  /* <div key={el.citizenId} className={styles.submittedCitizen}
onClick={() => { dispatch(setCurrentCitizen(el)); router.push(`/pages/citizen-survey`) }}>
{el?.submissionData?.beneficiaryName}
</div> */
}
