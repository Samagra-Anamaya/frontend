export  function formDataToObject(formData) {
  let object = {};
  formData.forEach((value, key) => {
    if (object.hasOwnProperty(key)) {
      if (!Array.isArray(object[key])) {
        object[key] = [object[key]];
      }
      object[key].push(value);
    } else {
      object[key] = value;
    }
  });
  return object;
}

export function objectToFormData(obj) {
  const formData = new FormData();

  for (const key in obj) {
    if (Object.hasOwnProperty.call(obj, key)) {
      const value = obj[key];

      if (Array.isArray(value)) {
        value.forEach((item) => formData.append(key, item));
      } else {
        formData.append(key, value);
      }
    }
  }

  return formData;
}
