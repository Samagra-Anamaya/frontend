/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/img-redundant-alt */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { MDBListGroupItem } from 'mdbreact';
import React from 'react';
import { CircularProgress } from '@mui/material';

const ListItem = (props) => {
	const {
		leftImage,
		rightImage,
		mainText,
		mainSubtext,
		onClick,
		onSubBtnClick,
		onSecondaryAction,
		secondaryImage = null,
		secondaryLoading = false,
		clName
	} = props;

	return (
		<MDBListGroupItem
			className={`d-flex justify-content-between align-items-center ${clName}  p-2`}
			style={{ borderRadius: '10px', marginBottom: '5px', ...props.sx }}
		>
			<div className="d-flex align-items-center" onClick={onClick ?? null}>
				<img
					src={leftImage}
					alt=""
					style={{ width: '45px', height: '45px', marginRight: '10px' }}
					className="rounded-circle"
				/>
				<div className="ms-3">
					<p className="fw-bold mb-1 bold">{mainText || 'N/A'}</p>
					<p className="text-muted mb-0" style={{ fontSize: '12px' }}>
						{mainSubtext || 'N/A'}
					</p>
				</div>
			</div>
			{rightImage && (
				<img
					src={rightImage}
					alt=""
					style={{ width: '40px', height: '40px' }}
					onClick={onSubBtnClick ?? null}
				/>
			)}

			{secondaryImage && (
				<>
					{secondaryLoading ? (
						<CircularProgress color="success" />
					) : (
						<img
							alt="image"
							src={secondaryImage}
							onClick={
								onSecondaryAction
									? (ev) => {
											ev.preventDefault();
											ev.stopPropagation();
											onSecondaryAction();
									  }
									: null
							}
							style={{ width: '40px', height: '40px' }}
						/>
					)}
				</>
			)}
		</MDBListGroupItem>
	);
};

export default ListItem;
