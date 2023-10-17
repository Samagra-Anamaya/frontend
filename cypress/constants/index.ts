
  export const routes = {
    login: "/",
    otp: "/otp",
    home: "/home",
    family: "/family",
    benefits: "/benefits",
    discover: "/discover",
    discovery: "/discovery",
    notifications: "/notifications",
    about: "/about",
    help: "/help",
    feedback: "/feedback",
    terms: "/terms",
    category: "/discovery/category",
    eligible: "/discovery/eligible",
    schemes: "/discovery/schemes",
    allSchemes: "/schemes/all",
  };
  
  export const loginPageTexts = {
    heading: ["आधार संख्या दर्ज करें", "Enter Aadhar Number"],
    validAadharNumber: "219930090365",
    invalidAadharNumber: "2199300903653",
    registrationPortal: ["पंजीकृत नहीं हैं?", "Not Registered on Family ID"],
    button: ["लॉग इन करें", "Login"],
    otpvalue: ["1", "2", "3", "4", "5", "6"],
    chooseLanguage: "Choose your Language",
    clickHerePortalLink: ["Click Here", "यहाँ क्लिक करें"],
    mobileNumber: "8928295005",
    findSchemeButtonText: ["अपने लिए योजनाएं ढूंढें", "Find Schemes for you"],
    loginScenarios: [
      {
        type: "aadhaar",
  
        credentials: "219930090365",
      },
      {
        type: "mobile",
        credentials: "8928295005",
      },
    ],
  };
  
  export const apiRoutes = {
    login: {
      method: "POST",
      route: "/auth/login/",
    },
  };
  

 
