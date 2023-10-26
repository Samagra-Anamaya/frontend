"use client";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import styles from "./index.module.scss";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
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
import SearchIcon from "@mui/icons-material/Search";
import { toast } from "react-toastify";
import { getCitizenImageRecords, getImages } from "../../services/utils";
import Breadcrumb from "../../components/Breadcrumb";
import { MDBListGroup } from "mdbreact";
import ListItem from "../../components/ListItem";
import { dateInYyyyMmDdHhMmSs } from "../completed-entries";
import moment from "moment";
import Banner from "../../components/Banner";

const SavedEntries = ({ params }) => {
  /* Component States and Refs*/
  const userData = useSelector((state) => state?.userData);
  const submissions = useSelector((state) => state?.userData?.submissions);
  const _currLocation = useSelector(
    (state) => state?.userData?.currentLocation
  );
  const currCitizen = useSelector((state) => state?.userData?.currentCitizen);
  const [fileUploading, setFileUploading] = useState(false);
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
  }, [currPage, submissions]);

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

    setFileUploading(true);
    let newSubmission = Object.assign({}, el);
    let landSuccess = false, rorSuccess = false;
    let { landRecords, rorRecords } = await getCitizenImageRecords(currCitizen.citizenId);

    let landRecordsBlob = landRecords?.images;
    let rorRecordsBlob = rorRecords?.images;
    console.log(landRecordsBlob, rorRecordsBlob)

    if (landRecordsBlob?.length) {
      try {
        let landUploadRes = await uploadMedia(landRecordsBlob);
        if (landUploadRes.err) {
          toast.error(landRecords?.err?.response?.data?.message);
        } else {
          landRecords = landUploadRes;
          landSuccess = true;
        };
      } catch (error) {
        toast.error(landRecords?.err?.response?.data?.message);
      }
    }

    if (rorRecordsBlob?.length) {
      try {
        let rorUploadRes = await uploadMedia(rorRecordsBlob);
        if (rorUploadRes.err) {
          toast.error(rorRecords?.err?.response?.data?.message);
        } else {
          rorRecords = rorUploadRes;
          rorSuccess = true;
        }
      } catch (err) {
        toast.error(rorRecords?.err?.response?.data?.message);
      }
    }
    newSubmission = {
      ...newSubmission,
      submissionData: {
        ...newSubmission?.submissionData,
        landRecords,
        rorRecords,
        imageUploaded: rorSuccess && landSuccess,
      },
    };
    dispatch(updateCitizenFormData(newSubmission));
    setFileUploading(false);
  }, []);

  const breadcrumbItems = useMemo(
    () => [
      { label: "Home", to: "/" },
      { label: `${_currLocation.villageName}`, to: "/survey" },
      { label: "Saved Entries" },
    ],
    []
  );

  console.log({ prevSubmissions });
  return !hydrated ? null : (
    <div className={styles.container} ref={containerRef}>
      <Banner />
      {/* <CommonHeader
        onBack={() => router.back()}
        text={`${_currLocation.villageName}`}
        subText={`Saved Entries`}
        showLogout={false}
        sx={{
          justifyContent: "space-between !important",
          padding: "2rem 1rem",
        }}
      /> */}

      <Breadcrumb items={breadcrumbItems} />

      <div
        className={
          styles.citizenContainer + ` animate__animated animate__fadeInUp pb-2`
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
          />
          {fileUploading && "loading"}
          {fetching && <CircularProgress color="success" />}
          <MDBListGroup style={{ minWidth: "22rem" }} className="mb-1" light>
            {!fetching &&
              prevSubmissions?.length > 0 &&
              prevSubmissions?.map((el) => (
                <ListItem
                  // <SelectionItem
                  key={el.citizenId}
                  leftImage={"/assets/citizen.svg"}
                  //rightImage={"/assets/upload-icon.png"}
                  secondaryLoading={fileUploading}
                  secondaryImage={el?.submissionData?.imageUploaded ? null : "/assets/upload-icon.png"}

                  mainSubtext={moment(el?.capturedAt).format(
                    "DD MMM YYYY, hh:mm a"
                  )}
                  mainText={el?.submissionData?.parentName}
                  onSecondaryAction={

                    el?.submissionData?.imageUploaded
                      ? null
                      : () => onMediaUpload(el)
                  }
                  sx={{
                    background: "#fff",
                    marginBottom: "0.5rem",
                    padding: "0.5rem",
                    border: "1px solid lightgray",
                  }}
                  mode={1}
                  imgWidth="70%"
                  onClick={() => {
                    dispatch(setCurrentCitizen(el));
                    router.push(`/citizen-survey`);
                  }}
                />
              ))}
          </MDBListGroup>
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
