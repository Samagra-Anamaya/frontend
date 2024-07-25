import React from 'react';
import { MDBCard, MDBCol, MDBRow } from 'mdbreact';
import packageJson from '../../../package.json';

const Footer = () => {
	const { version } = packageJson;
	return (
		<MDBCard className="p-0 w-100 rounded square">
			<MDBRow className="g-0 mt-1 m-0 ">
				<MDBCol className="text-center p-0  m-0 align-items-center">
					<span className="text-bold"> App Version</span>: {version}
				</MDBCol>
			</MDBRow>
		</MDBCard>
	);
};

export default Footer;
