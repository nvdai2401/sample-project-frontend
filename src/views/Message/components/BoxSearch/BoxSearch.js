import React, { useState } from 'react'

import SearchIcon from '@material-ui/icons/Search'
import { Button, TextField, Grid, makeStyles } from '@material-ui/core'

const useStyles = makeStyles(theme => ({
	icon: {
		fontSize: '40px',
	},
	search: {
		padding: '16px',
		borderTop: `1px solid #979797`,
	},

	buttonSearch: {
		color: theme.palette.common.white,
		marginLeft: '8px',
		width: '56px',
		boxShadow: 'none',
		background: theme.palette.grey['300'],
		'&:hover': {
			background: theme.palette.grey['300'],
		},
	},
	textField: {
		width: '328px',
	},
}))

export default function BoxSearch({ handleSearch }) {
	const classes = useStyles()
	const [searchVal, setSearchVal] = useState('')
	return (
		<Grid container alignItems='stretch' className={classes.search}>
			<TextField
				variant='outlined'
				label='Search'
				placeholder='search...'
				type='search'
				onChange={e => setSearchVal(e.target.value)}
				className={classes.textField}
			/>
			<Button
				variant='contained'
				className={classes.buttonSearch}
				onClick={() => handleSearch(searchVal)}
			>
				<SearchIcon className={classes.icon} />
			</Button>
		</Grid>
	)
}
