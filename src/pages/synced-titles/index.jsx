'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';

import Pagination from '@mui/material/Pagination';
import { TextField, InputAdornment, CircularProgress } from '@mui/material';
import { debounce } from 'debounce';

import SearchIcon from '@mui/icons-material/Search';
import { MDBListGroup } from 'mdbreact';
import moment from 'moment';
import Lottie from 'react-lottie';
import * as emptyState from '../../utils/lottie/emptyState.json';
import ListItem from '../../components/ListItem';
import Banner from '../../components/Banner';
import Breadcrumb from '../../components/Breadcrumb';
import { getVillageSubmissions, searchCitizen } from '../../services/api';
import { setCurrentCitizen, tokenSelector, updateSearchQuery } from '../../redux/store';

import styles from './index.module.scss';

// Lottie Options
const defaultOptions = {
	loop: true,
	autoplay: true,
	animationData: emptyState,
	rendererSettings: {
		preserveAspectRatio: 'xMidYMid slice'
	}
};

const CompletedEntries = ({ params }) => {
	const userData = useSelector((state) => state?.userData);
	const _currLocation = useSelector((state) => state?.userData?.currentLocation);
	const [hydrated, setHydrated] = React.useState(false);

	const [currPage, setCurrPage] = React.useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [prevSubmissions, setPrevSubmissions] = useState([]);
	const [prevTempSubmissions, setPrevTempSubmissions] = useState([]);
	const [searchQuery, setSearchQuery] = useState('');
	const [fetching, setFetching] = useState(false);
	const router = useRouter();
	const dispatch = useDispatch();

	/* Use Effects */
	useEffect(() => {
		window.scrollTo({ top: 0, behavior: 'smooth' });
		setHydrated(true);

		setSearchQuery(userData?.searchQuery?.[_currLocation.villageCode] || '');
		//	getVillageData();
	}, [_currLocation, userData?.searchQuery]);

	const debouncedSearch = debounce(async (query) => {
		if (query?.length) {
			setFetching(true);
			const res = await searchCitizen(_currLocation.villageCode, query, userData.user);
			setPrevSubmissions(res?.result?.submissions || []);
			setFetching(false);
		} else setPrevSubmissions(prevTempSubmissions);
	}, 500);

	const token = useSelector(tokenSelector);

	const getVillageSubmissionData = useCallback(async () => {
		try {
			if (_currLocation?.villageCode) {
				setFetching(true);
				const data = await getVillageSubmissions(_currLocation.villageCode, currPage, token);

				setFetching(false);
				if (Object.keys(data)?.length) {
					setPrevSubmissions(data?.result?.submissions);
					setPrevTempSubmissions(data?.result?.submissions);
					setTotalPages(data?.result?.totalPages);
				}
			}
		} catch (err) {
			setFetching(false);
		}
	}, [_currLocation.villageCode, currPage, token]);

	useEffect(() => {
		getVillageSubmissionData();
	}, [currPage, getVillageSubmissionData]);

	const searchCitizenSubmission = useCallback(
		async (e) => {
			setSearchQuery(e.target.value);
			dispatch(
				updateSearchQuery({
					villageId: _currLocation.villageCode,
					query: e.target.value
				})
			);

			debouncedSearch(e.target.value);
		},
		[_currLocation.villageCode, debouncedSearch, dispatch]
	);

	const breadcrumbItems = useMemo(
		() => [
			{ label: 'Home', to: '/' },
			{ label: _currLocation?.villageName, to: '/survey' },
			{ label: 'Submitted Titles' }
		],
		[_currLocation?.villageName]
	);
	return !hydrated ? null : (
		<div className={`${styles.container} `}>
			<Banner />
			<Breadcrumb items={breadcrumbItems} />

			<div className={`${styles.citizenContainer} animate__animated animate__fadeIn px-2`}>
				<div className={styles.submissionContainer}>
					{!(!fetching && !prevSubmissions?.length && !searchQuery) && (
						<TextField
							id="search"
							color="success"
							type="search"
							label={searchQuery ? '' : 'Search submissions here ...'}
							value={searchQuery}
							onChange={searchCitizenSubmission}
							sx={{
								marginBottom: '2rem',
								border: 'none',
								borderRadius: '1rem'
							}}
							fullWidth
							InputProps={{
								endAdornment: (
									<InputAdornment position="end">
										<SearchIcon />
									</InputAdornment>
								)
							}}
						/>
					)}
					{fetching && <CircularProgress color="success" />}
					<MDBListGroup style={{ minWidth: '22rem' }} light>
						{!fetching &&
							prevSubmissions?.length > 0 &&
							prevSubmissions?.map((el) => (
								<ListItem
									clName="titles"
									key={el.id}
									onSubBtnClick={() => null}
									leftImage={'/assets/citizen.svg'}
									rightImage={'/assets/verified.png'}
									mainText={el?.submissionData?.claimantName}
									mainSubtext={moment(el?.updatedAt).format('DD MMM YYYY, hh:mm a')}
									sx={{ background: '#fff', marginTop: '5x', cursor: 'pointer' }}
									mode={1}
									imgWidth={'70%'}
									onClick={() => {
										dispatch(setCurrentCitizen(el));
										router.push(`/citizen-survey`);
									}}
								/>
							))}
					</MDBListGroup>
					{!fetching && !prevSubmissions?.length && !searchQuery && (
						<div>
							<p className={styles.noRecordsFound}>No Records Found</p>
							<p className={styles.noRecordsSubText}>
								Please submit land titles before you access them
							</p>
							<Lottie
								options={defaultOptions}
								style={{ marginTop: -40 }}
								height={300}
								width={300}
							/>
						</div>
					)}
				</div>
				{!searchQuery && (
					<div className="my-2">
						<Pagination
							count={totalPages}
							color="success"
							onChange={(event, page) => setCurrPage(page)}
							className={styles.paginationContainer}
						/>
					</div>
				)}
			</div>
		</div>
	);
};

export default CompletedEntries;
