import {
  MDBCard,
  MDBCol,
  MDBRow,
  MDBCardBody,
} from "mdbreact";
import React, { useMemo, useState } from "react";
import { slide as Menu } from 'react-burger-menu'
import LogoutIcon from '@mui/icons-material/Logout';
import CommonModal from "../Modal";
import { useDispatch } from "react-redux";
import { logoutUser } from "../../redux/store";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";

const Banner = (props) => {
  const [logoutModal, showLogoutModal] = useState(false);
  const dispatch = useDispatch();
  const userData = useSelector(state => state?.userData);

  const logout = () => {
    dispatch(logoutUser());
    showLogoutModal(false);
    setTimeout(() => {
      window.location.href = "/";
    }, 200)
  }



  return (
    <div>
      <MDBCard className="p-0">
        <MDBRow className="g-0 mt-1 m-0">

          {userData?.isAuthenticated && <MDBCol size="1" className="text-right p-0">
            <Menu >
              <div>Hi there 👋,</div>
              <div style={{ marginBottom: 20 }}>Enumerator {userData?.user?.user?.username}</div>
              <div onClick={() => { showLogoutModal(true) }} style={{ cursor: 'pointer' }}>
                <span><LogoutIcon style={{ color: '#007922', fontSize: 40 }} /></span>&nbsp;&nbsp;&nbsp;
                <span>Logout</span>
              </div>
            </Menu>
          </MDBCol>
          }
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
      {
        logoutModal && <CommonModal sx={{ height: '50vh', width: '100vw' }}>
          <div style={modalStyles.container}>
            <img src="/assets/errorIcon.png" style={modalStyles.image} />
            <div style={modalStyles.warningText}>Logging out will delete any unsaved data or any forms which are still pending to be submitted</div>
            <div style={modalStyles.confirmationText}>Are you sure you want to logout?</div>
            <div style={modalStyles.btnContainer}>
              <div style={modalStyles.confirmBtn} onClick={() => {
                logout();
              }}>Yes</div>
              <div style={modalStyles.exitBtn} onClick={() => showLogoutModal(false)}>No</div>
            </div>
          </div>
        </CommonModal>
      }
    </div >
  );
};

const modalStyles = {
  container: { display: 'flex', flexDirection: 'column', alignItems: 'center', overflow: 'scroll' },
  warningText: { fontSize: '1rem', color: 'red', textAlign: 'center', marginTop: 10, fontWeight: 'bolder' },
  confirmationText: { fontSize: '1rem', textAlign: 'center', marginTop: 10, fontWeight: '500' },
  image: { height: '100%', width: '30%' },
  btnContainer: { width: '100%', display: 'flex', flexDirection: 'row', gap: '1rem', justifyContent: 'space-evenly', marginTop: 30 },
  confirmBtn: { width: '50%', height: '3rem', background: '#017922', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '0.5rem', cursor: 'pointer' },
  exitBtn: { width: '50%', height: '3rem', border: '1px solid #017922', color: '#017922', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '0.5rem', cursor: 'pointer' },

}

export default Banner;
