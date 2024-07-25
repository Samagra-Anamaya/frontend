import { Avatar, Divider, ListItem, ListItemAvatar, ListItemText, Typography } from '@mui/material';
import React from 'react';

const ListItemNew = (props) => {
	const {
		leftImage,
		rightImage,
		mainText,
		mainSubtext,
		onClick,

		onSecondaryAction,
		secondaryImage = null,
		secondaryLoading = false,
		clName
	} = props;
	return (
		<>
			<ListItem alignItems="flex-start" onClick={onClick ?? null}>
				<ListItem>
					<ListItemAvatar>
						<Avatar src={leftImage}></Avatar>
					</ListItemAvatar>
					<ListItemText primary={mainText || 'N/A'} secondary={mainSubtext || 'N/A'} />
				</ListItem>
			</ListItem>
			<Divider variant="inset" component="li" />
		</>
	);
};

export default ListItemNew;
