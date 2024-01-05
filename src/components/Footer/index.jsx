import React from "react";
import packageJson from "../../../package.json";
import { MDBCard,MDBCol,MDBRow } from "mdbreact";


const Footer = () => {
  const version = packageJson.version;
  return (

    <MDBCard className="p-0 w-100">
      <MDBRow className="g-0 mt-1 m-0">
        <MDBCol className="text-center">
          <p><span className="text-bold"> App Version</span>: {version}</p>
        </MDBCol>
      </MDBRow>
    </MDBCard>
  );
};

export default Footer;
