import {
  MDBCard,
  MDBCol,
  MDBRow,
  MDBCardBody,
} from "mdbreact";
import React, { useMemo } from "react";
import GovtBanner from "../GovtBanner";

const Banner = (props) => {
  return (
    <div>
      <MDBCard className="p-0">
        <MDBRow className="g-0 mt-1 m-0">
          <MDBCol size="3" className="text-right p-0">
            <img src="/assets/govtLogo.png" style={{ width: "70px" }} />
          </MDBCol>
          <MDBCol className="p-0">
            <MDBCardBody className="p-2 p-1" style={{}}>
              <p
                style={{
                  lineHeight: "15px",
                  borderLeft: "1px solid black",
                  fontWeight: "900",
                }}
                className="p-1 bold"
              >
                <small>
                  ST & SC Development, Minorities & Backward Classes Welfare
                  Department
                </small>
                <br />
                <span style={{ color: "green" }}> Government of Odisha </span>
              </p>
            </MDBCardBody>
          </MDBCol>
        </MDBRow>
      </MDBCard>
    </div>
  );
};

export default Banner;
