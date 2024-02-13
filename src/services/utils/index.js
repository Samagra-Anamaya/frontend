"use client"
import Cookies from "js-cookie";
// import XMLParser from "react-xml-parser";
import localforage from "localforage";
import { getMedicalAssessments, getNewToken, getPrefillXML, getSubmissionXML, sendLogs, uploadMedia } from "../api";
import axios from "axios";
// import { userData } from "@/app/pages/Default/page";
// import { useUserData } from "@/app/hooks/useAuth";
import imageCompression from 'browser-image-compression';
import localForage from "localforage";
import { store, updateUserToken } from "../../redux/store";

export const makeHasuraCalls = async (query, userData) => {
  return fetch(process.env.NEXT_PUBLIC_HASURA_URL, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${userData?.user.token}`,
    },
    body: JSON.stringify(query),
  })
    .then(async (response) => await validateResponse(response))
    .catch((error) => {
      return error;
    });
};

const validateResponse = async (response) => {
  const apiRes = await response.json();
  const jsonResponse = {
    ...apiRes,
    responseStatus: false,
  };
  return jsonResponse;
};

export const makeDataForPrefill = (prev, xmlDoc, key, finalObj, formName) => {
  if (Array.isArray(xmlDoc) && xmlDoc.length == 0 && prev.value) {
    finalObj[key] = prev.value;
  } else {
    for (const el in xmlDoc) {
      makeDataForPrefill(
        xmlDoc[el],
        xmlDoc[el].children,
        key + "_*_" + xmlDoc[el].name,
        finalObj,
        formName
      );
    }
  }
};

export const updateFormData = async (startingForm) => {
  try {
    let data = await getFromLocalForage(startingForm + `${new Date().toISOString().split("T")[0]}`)
    let prefilledForm = await getSubmissionXML(startingForm, data.formData, data.imageUrls);
    return prefilledForm;
  } catch (err) {

  }
};

export const setCookie = (cname, cvalue) => {
  try {
    Cookies.set(cname, JSON.stringify(cvalue));
  } catch (error) {
    return false;
  }
};

export const getCookie = (cname) => {
  try {
    let cookie = Cookies.get(cname);
    if (cookie) return JSON.parse(cookie);
  } catch (error) {
    return false;
  }
};

export const logout = () => {

  localStorage.clear();
  sessionStorage.clear();
  window.location = "/";
  localforage.removeItem('appEnvs')
  removeCookie("userData");

};

export const removeCookie = (cname) => {
  try {
    Cookies.remove(cname);
    return true;
  } catch (error) {
    return false;
  }
};

export const isImage = (key, filename) => {
  if (filename.includes(".png") || filename.includes(".tif") || filename.includes(".tiff") || filename.includes(".jpg") || filename.includes(".jpeg") || filename.includes(".bmp") || filename.includes(".gif") || filename.includes(".eps"))
    return true;
  if (key.includes("img") || key.includes("image"))
    return true;
  return false;
}


export const getFromLocalForage = async (key, isLoggedIn = true, userData) => {
  const user = userData;
  console.log(user);
  try {
    if (isLoggedIn)
      return await localforage.getItem(user?.user.id + "_" + key);
    else
      return await localforage.getItem(key);
  } catch (err) {
    console.log(err);
    return null;
  }
}

export const setToLocalForage = async (key, value, isLoggedIn = true, user) => {
  // const user = getCookie("userData");
  console.log(user);
  if (isLoggedIn)
    await localforage.setItem(user?.user.id + "_" + key, value);
  else
    await localforage.setItem(key, value);
}

export const handleFormEvents = async (startingForm, afterFormSubmit, e, user) => {
  // const user = getCookie("userData");
  const appEnvs = await getFromLocalForage('appEnvs', false);
  const ENKETO_URL = process.env.NEXT_PUBLIC_ENKETO_URL;

  if (
    e.origin == ENKETO_URL &&
    JSON.parse(e?.data)?.state !== "ON_FORM_SUCCESS_COMPLETED"
  ) {
    console.log("Form Change Event------->", e)
    // var formData = new XMLParser().parseFromString(JSON.parse(e.data).formData);
    var formData = JSON.parse(e.data).formData;
    if (formData) {
      let images = JSON.parse(e.data).fileURLs;
      let prevData = await getFromLocalForage(startingForm + `${new Date().toISOString().split("T")[0]}`);
      console.log("Local Forage Data ---->", prevData)
      await setToLocalForage(startingForm + `${new Date().toISOString().split("T")[0]}`, {
        formData: JSON.parse(e.data).formData,
        imageUrls: { ...prevData?.imageUrls, ...images }
      }, true, user)
    }
  }
  afterFormSubmit(e);
};

export const getFormData = async ({ loading, scheduleId, formSpec, startingForm, formId, setData, setEncodedFormSpec, setEncodedFormURI }) => {
  const res = await getMedicalAssessments();
  if (res?.data?.assessment_schedule?.[0]) {
    loading.current = true;
    let ass = res?.data?.assessment_schedule?.[0];
    scheduleId.current = ass.id;
    setData({
      schedule_id: ass.id,
      id: ass.institute.id,
      district: ass.institute.district,
      instituteName: ass.institute.name,
      specialization:
        ass.institute?.institute_specializations?.[0]?.specializations,
      courses: ass.institute?.institute_types?.[0]?.types,
      type: ass.institute.sector,
      latitude: ass.institute.latitude,
      longitude: ass.institute.longitude,
    });
    let formData = await getFromLocalForage(startingForm + `${new Date().toISOString().split("T")[0]}`);
    console.log("Form Data Local Forage --->", formData)
    if (formData) {
      setEncodedFormSpec(encodeURI(JSON.stringify(formSpec.forms[formId])));
      let prefilledForm = await getPrefillXML(startingForm, formSpec.forms[formId].onSuccess, formData.formData, formData.imageUrls);
      console.log("Prefilled Form:", prefilledForm)
      setEncodedFormURI(prefilledForm)
      // setEncodedFormURI(
      //   getFormURI(
      //     formId,
      //     formSpec.forms[formId].onSuccess,
      //     formData
      //   )
      // );
    } else {
      let prefilledForm = await getPrefillXML(startingForm, formSpec.forms[formId].onSuccess);
      console.log("Prefilled Form Empty:", prefilledForm)
      setEncodedFormURI(prefilledForm)
    }
  } else setData(null);
  loading.current = false;
};

// export const cacheForms = async (formName) => {
//   const user = getCookie("userData");
//   console.log("userData:", user)
//   console.log("Caching Forms ... ");
//   let prefilledFormUrl = await getPrefillXML(formName, {});
//   console.log(prefilledFormUrl)
//   let transformedForm = await axios.get('http://localhost:8085/transform?xform=' + prefilledFormUrl);
//   console.log("Trans form:", transformedForm.data)
//   setToLocalForage(formName, transformedForm.data);
// }

export const compressImage = async (imageFile, flag, disableuserlogs) => {
  const user = store?.getState()?.userData?.user;
  const options = {
    maxSizeMB: 0.1,
    maxWidthOrHeight: 1920,
    useWebWorker: flag?.enabled ? flag?.value?.split(',')?.includes(user?.user?.username) : true,
    fileType: 'image/webp'
  }
  try {
    const imageFileCopy = new File([imageFile], imageFile?.name, { type: imageFile?.type });
    try {
      const compressedFile = flag?.enabled ? flag?.value?.split(',')?.includes(user?.user?.username) ? await compressImageToTargetSize(imageFile) : await imageCompression(imageFile, options) : await imageCompression(imageFile, options);
     if(flag?.enabled && flag?.value?.split(',')?.includes(user?.user?.username)){
      sendLogs({ meta: `CANVAS COMPRESSION USED`, gpId: store?.getState().userData?.user?.user?.username  })
     }
      return compressedFile;
    } catch (err) {
      let b64Image = await toBase64(imageFile)
      let b64ImageCopy = await toBase64(imageFileCopy)
      // Returning uncompressed image on error in compression

      if (imageFileCopy instanceof Blob) {
        let uploadedFile = await uploadMedia([imageFileCopy], user)
        sendLogs({ meta: `at compressImage inside if, fileName: ${imageFileCopy?.name}, minioName: ${JSON.stringify(uploadedFile)}, b64Image: ${b64Image}, b64ImageCopy: ${b64ImageCopy}`, gpId: store?.getState().userData?.user?.user?.username, error: err?.message || err?.toString(), useWebWorker: flag?.enabled ? flag?.value?.split(',')?.includes(user?.user?.username) : true }, disableuserlogs?.enabled ? disableuserlogs?.value?.split(',')?.includes(user?.user?.username) : true)
        return imageFileCopy;
      }
      else {
        let uploadedFile = await uploadMedia([imageFileCopy], user)
        sendLogs({ meta: `at compressImage inside else, fileName: ${imageFileCopy?.name}, minioName: ${JSON.stringify(uploadedFile)}, b64Image: ${b64Image}, b64ImageCopy: ${b64ImageCopy}`, gpId: store?.getState().userData?.user?.user?.username, error: err?.message || err?.toString(), useWebWorker: flag?.enabled ? flag?.value?.split(',')?.includes(user?.user?.username) : true }, disableuserlogs?.enabled ? disableuserlogs?.value?.split(',')?.includes(user?.user?.username) : true)
        throw new Error("Invalid File Type")
      }
    }
  } catch (error) {
    sendLogs({ meta: `at compressImage outside inner try catch, failed to make imageFileCopy, Original Image:${imageFile?.name}`, gpId: store?.getState().userData?.user?.user?.username, error: err?.message || err?.toString(), useWebWorker: flag?.enabled ? flag?.value?.split(',')?.includes(user?.user?.username) : true }, disableuserlogs?.enabled ? disableuserlogs?.value?.split(',')?.includes(user?.user?.username) : true)
    throw new Error("Invalid File Type")
  }
}

const compressImageToTargetSize = (file, targetSizeKB = 1000, maxWidth = 1920, maxHeight = 1080, step = 0.05, quality = 0.7) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxWidth) {
          height *= maxWidth / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width *= maxHeight / height;
          height = maxHeight;
        }
      }

      const attemptCompression = (quality) => {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(blob => {
          if (blob.size / 1024 > targetSizeKB && quality > step) { // Check if the size is larger than target
            attemptCompression(quality - step); // Reduce quality
          } else {
            resolve(blob);
          }
        }, 'image/jpeg', quality);
      };

      attemptCompression(quality);
    };
    img.onerror = reject;
  });
}

export const storeImages = async (data, disableuserlogs) => {
  try {
    let imageRecords = await localForage.getItem("imageRecords") || [];
    imageRecords.push(data);
    return await localForage.setItem("imageRecords", imageRecords);
  } catch (err) {
    const user = store?.getState()?.userData?.user;
    let uploadedFiles = await uploadMedia([data.images], user)
    sendLogs({ meta: `at storeImages, minioNames: ${JSON.stringify(uploadedFiles)}`, gpId: store?.getState().userData?.user?.user?.username, error: err?.message || err?.toString() }, disableuserlogs?.enabled ? disableuserlogs?.value?.split(',')?.includes(user?.user?.username) : true)
    throw err;
  }
}

export const getImages = async () => {
  return await localForage.getItem("imageRecords");
}

export const getImagesForVillage = async (villageId) => {
  let imageRecords = await getImages();
  if (imageRecords?.length > 0) {
    return imageRecords.filter(el => el.villageId == villageId)
  }
  return []
}

export const getCitizenImageRecords = async (citizenId) => {
  let imageRecords = await getImages();
  if (imageRecords?.length > 0) {
    let landRecords = imageRecords.filter(el => (el.citizenId == citizenId && el.isLandRecord))?.[0]
    let rorRecords = imageRecords.filter(el => (el.citizenId == citizenId && !el.isLandRecord))?.[0]
    return { landRecords, rorRecords };
  }
  return {}

}


export const removeCitizenImageRecord = async (citizenId) => {
  let images = await getImages();
  if (images?.length > 0) {
    let imageRecords = images.filter(el => el.citizenId != citizenId);
    await localForage.setItem("imageRecords", imageRecords);
  }
}


const d = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
  [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
  [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
  [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
  [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
  [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
  [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
  [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
  [9, 8, 7, 6, 5, 4, 3, 2, 1, 0]
]

// permutation table
const p = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
  [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
  [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
  [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
  [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
  [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
  [7, 0, 4, 6, 9, 1, 3, 2, 5, 8]
]

// validates Aadhar number received as string
export function validateAadhaar(aadharNumber) {
  let c = 0
  let invertedArray = aadharNumber.split('').map(Number).reverse()

  invertedArray.forEach((val, i) => {
    c = d[c][p[(i % 8)][val]]
  })

  return (c === 0)
}

// Function to split the array into chunks of a specified size
export const chunkArray = (arr, size) => {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
};

// Sleep function to introduce a delay
export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Sanitize Form before saving in redux store
export const sanitizeForm = (form) => {
  if (form.forestLandType == 'revenueForest' && form.typeOfBlock != 'jungleBlock') {
    delete form.compartmentNo;
  }
  if (form.forestLandType == 'reservedForest') {
    delete form.typeOfBlock;
    if (form.fraPlotsClaimed) {
      for (let i = 1; i <= form.fraPlotsClaimed; i++) {
        delete form[`plotNumber${i}`]
      }
    }
    delete form.fraPlotsClaimed;
  }
  return form;
}

export const checkTokenValidity = () => {
  const userData = store.getState()?.userData?.user;
  if (userData) {
    var timeleft = userData.tokenExpirationInstant - (new Date()).getTime();
    var days = Math.ceil((((timeleft / 1000) / 60) / 60) / 24)
  }
  return days || 999;
}

export const refreshToken = async () => {
  const userData = store.getState()?.userData?.user;
  if (userData) {
    let res = await getNewToken(userData.refreshToken, userData.token)
    if (res?.result?.user) {
      store.dispatch(updateUserToken({ token: res.result.user.token, refreshToken: res.result.user.refreshToken, tokenExpirationInstant: res.result.user.tokenExpirationInstant }))
    }
  }
}

const toBase64 = file => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => resolve(reader.result);
  reader.onerror = reject;
});
