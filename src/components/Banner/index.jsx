import { MDBCard, MDBCol, MDBRow, MDBCardBody } from 'mdbreact';
import React, { useState } from 'react';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useDispatch, useSelector } from 'react-redux';

import localforage from 'localforage';
import {
	Box,
	Button,
	Drawer,
	List,
	ListItem,
	ListItemButton,
	ListItemIcon,
	ListItemText,
	Avatar,
	Divider
} from '@mui/material';

import { logoutUser } from '../../redux/store';
import CommonModal from '../Modal';
import { bannerModalStyles } from '../../utils/modal-styles';
import Sidebar from '../Sidebar';

const Banner = (props) => {
	const [logoutModal, showLogoutModal] = useState(false);
	const dispatch = useDispatch();
	const userData = useSelector((state) => state?.userData);
	const [isOpen, setIsOpen] = useState(false);
	const logout = () => {
		dispatch(logoutUser());
		localforage.setItem('imageRecords', []);
		showLogoutModal(false);
		setTimeout(() => {
			window.location.href = '/';
		}, 200);
	};

	return (
		<div>
			{/* <TemporaryDrawer /> */}
			<MDBCard>
				<MDBRow className="g-0 mt-1 m-0">
					{userData?.isAuthenticated && (
						<MDBCol size="1" className="text-right p-0 ">
							<MenuIcon
								style={{
									color: '#007922',
									fontSize: '35px',
									marginTop: '50%'
								}}
								className="mx-auto"
								onClick={() => setIsOpen((prev) => !prev)}
							/>
							<Drawer open={isOpen} onClose={() => setIsOpen(false)}>
								<>
									<Sidebar
										name={userData?.user?.user?.username}
										onLogout={() => showLogoutModal((prev) => !prev)}
									/>
								</>
							</Drawer>
						</MDBCol>
					)}
					<MDBCol size="3" className="text-right p-0">
						<img src="/assets/govtLogo.png" style={{ width: '70px' }} alt="logo" />
					</MDBCol>
					<MDBCol className="p-0">
						<MDBCardBody className="p-2 p-1" style={{}}>
							<p
								style={{
									lineHeight: '15px',
									borderLeft: '1px solid black',
									fontWeight: '900'
								}}
								className="p-1 bold"
							>
								<small>ST & SC Development, Minorities & Backward Classes Welfare Department</small>
								<br />
								<span style={{ color: 'green' }}> Government of Odisha </span>
							</p>
						</MDBCardBody>
					</MDBCol>
				</MDBRow>
			</MDBCard>
			<>
				{logoutModal && (
					<CommonModal sx={{ height: '50vh', width: '100vw' }}>
						<div style={bannerModalStyles.container}>
							<img src="/assets/errorIcon.png" style={bannerModalStyles.image} alt="error icon" />
							<div style={bannerModalStyles.warningText}>
								Logging out will delete any unsaved data or any forms which are still pending to be
								submitted
							</div>
							<div style={bannerModalStyles.confirmationText}>Are you sure you want to logout?</div>
							<div style={bannerModalStyles.btnContainer}>
								<Button
									style={bannerModalStyles.confirmBtn}
									onClick={() => {
										logout();
									}}
								>
									Yes
								</Button>
								<Button style={bannerModalStyles.exitBtn} onClick={() => showLogoutModal(false)}>
									No
								</Button>
							</div>
						</div>
					</CommonModal>
				)}
			</>
		</div>
	);
};

export default Banner;
