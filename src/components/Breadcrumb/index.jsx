import React from 'react';
import { MDBBreadcrumb, MDBBreadcrumbItem, MDBContainer } from 'mdbreact';
import { map } from 'lodash';
import Link from 'next/link';
import HomeIcon from '@mui/icons-material/Home';

const Breadcrumb = ({ heading, items }) => (
	<header className="w-100">
		{/* Heading */}
		<div className="w-100">
			{/* Breadcrumb */}
			<MDBContainer fluid className=" w-100 p-1">
				{heading && <h1>{heading}</h1>}
				<MDBBreadcrumb bold>
					{map(items, (item, index) => (
						<MDBBreadcrumbItem>
							<Link
								href={item?.to ? item.to : ''}
								className="text-reset"
								style={{ fontSize: '17px' }}
							>
								{index === 0 && <HomeIcon sx={{ color: '#017922', fontSize: '18px' }} />}
								<span
									style={{
										color: index === items.length - 1 ? '' : '#017922'
									}}
								>
									{item?.label ? item.label : item}
								</span>
							</Link>
						</MDBBreadcrumbItem>
					))}
				</MDBBreadcrumb>
			</MDBContainer>
		</div>
	</header>
);

export default Breadcrumb;
