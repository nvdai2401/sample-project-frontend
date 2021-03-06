import React, { useEffect } from 'react'
import { useQuery } from '@apollo/react-hooks'

import { Box } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'

import { Header, ViewMessage, EditorChat } from './components'

import {
	GET_USER_INFO,
	GET_ZALO_MESSAGE_LIST,
	GET_MAP_ZALO_MESSAGE_ATTACHMENT,
} from '@views/Chat/gql/query'
import { ON_ZALO_MESSAGE_CREATED } from '@views/Chat/gql/subscription'

import {
	NETWORK_STATUS_FETCH_MORE,
	ZALO_MESSAGE_LIMIT,
} from '@src/configs.local'

const useStyles = makeStyles(() => ({
	root: {
		display: 'flex',
		flexDirection: 'column',
		width: '100%',
		borderRight: '1px solid #e5e5e9',
		height: '100vh',
	},
	nodata: {
		display: 'flex',
		flex: 1,
		width: '100%',
		backgroundColor: '#e5e5e9',
		alignItems: 'center',
		justifyContent: 'center',
	},
}))

const ChatView = props => {
	const { selectedUserOfChat } = props
	const classes = useStyles()
	const { data: zaloAttachmentMessageData } = useQuery(
		GET_MAP_ZALO_MESSAGE_ATTACHMENT
	)
	const { data, loading, subscribeToMore, fetchMore, networkStatus } = useQuery(
		GET_ZALO_MESSAGE_LIST,
		{
			notifyOnNetworkStatusChange: true,
			variables: {
				query: {
					limit: ZALO_MESSAGE_LIMIT,
					interestedUserId: selectedUserOfChat.id,
				},
			},
		}
	)
	const {
		data: { me },
		loading: loadingMe,
	} = useQuery(GET_USER_INFO)

	useEffect(() => {
		subscribeToMore({
			document: ON_ZALO_MESSAGE_CREATED,
			variables: { filter: { interestedUserId: selectedUserOfChat.id } },
			shouldResubscribe: true,
			updateQuery: (prev, { subscriptionData }) => {
				let newMessage = subscriptionData.data.onZaloMessageCreated
				const zaloAttachmentMessages =
					zaloAttachmentMessageData.zaloMessageAttachmentList.items
				const messageIndex = zaloAttachmentMessages.findIndex(
					item => item.id === newMessage.id
				)

				if (!subscriptionData.data) return prev

				if (messageIndex !== -1 && newMessage.type === 'Text') return

				if (
					newMessage.attachments &&
					newMessage.attachments.length &&
					messageIndex !== -1
				) {
					if (newMessage.type === 'Image') {
						newMessage.attachments[0].payload.url =
							zaloAttachmentMessages[messageIndex].url
					}
				}

				return Object.assign({}, prev, {
					zaloMessageList: {
						...prev.zaloMessageList,
						items:
							prev.zaloMessageList.items.filter(
								item => item.id === newMessage.id
							).length === 0
								? [newMessage, ...prev.zaloMessageList.items]
								: prev.zaloMessageList.items,
					},
				})
			},
		})
	}, [subscribeToMore, selectedUserOfChat, zaloAttachmentMessageData])

	const handleFetchMore = () => {
		fetchMore({
			variables: {
				query: {
					limit: ZALO_MESSAGE_LIMIT,
					interestedUserId: selectedUserOfChat.id,
					skip: data.zaloMessageList.items.length,
				},
			},
			updateQuery: (prev, { fetchMoreResult }) => {
				if (!fetchMoreResult) return prev
				const fetchedMessageList = fetchMoreResult.zaloMessageList
				let cacheMessageList = prev.zaloMessageList
				const items = [...cacheMessageList.items, ...fetchedMessageList.items]
				const hasNext = fetchedMessageList.hasNext
				return {
					zaloMessageList: {
						...cacheMessageList,
						items,
						hasNext,
					},
				}
			},
		})
	}

	if (loadingMe) return 'loading'
	else
		return (
			<Box className={classes.root}>
				<Header selectedUserOfChat={selectedUserOfChat} />
				{loading && networkStatus !== NETWORK_STATUS_FETCH_MORE ? (
					<Box className={classes.nodata}>Loading</Box>
				) : data && data.zaloMessageList.items.length > 0 ? (
					<ViewMessage
						me={me}
						selectedUserOfChatId={selectedUserOfChat.id}
						items={data.zaloMessageList.items}
						hasNext={data.zaloMessageList.hasNext}
						handleFetchMore={handleFetchMore}
						loadMore={networkStatus === NETWORK_STATUS_FETCH_MORE}
					/>
				) : (
					<Box className={classes.nodata}>Chưa có cuộc hội thoại nào</Box>
				)}

				<EditorChat idUser={selectedUserOfChat.id} />
			</Box>
		)
}

export default ChatView
