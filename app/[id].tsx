import { useState, useEffect } from 'react'
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	Alert,
	Linking,
	Platform
} from 'react-native'
import { useLocalSearchParams, router } from 'expo-router'
import { Button, Card } from 'react-native-paper'
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps'
import { storage, Event, Attendee } from './utils/storage'
import * as Calendar from 'expo-calendar'
import * as Location from 'expo-location'
import { format } from 'date-fns'
import { AttendeesList } from '@/components/AttendeesList'

export default function EventDetailsScreen() {
	const { id } = useLocalSearchParams()
	const [event, setEvent] = useState<any>(null)
	const [isRSVPed, setIsRSVPed] = useState(false)
	const [userLocation, setUserLocation] = useState<{
		latitude: number
		longitude: number
	} | null>(null)

	useEffect(() => {
		loadEvent()
		getUserLocation()
	}, [id])

	const loadEvent = async () => {
		const events = await storage.getEvents()
		const foundEvent = events.find(e => e.id === id)
		if (foundEvent) {
			setEvent(foundEvent)
			setIsRSVPed(foundEvent.attendees.some(a => a.id === 'current-user'))
		}
	}

	const getUserLocation = async () => {
		try {
			const { status } = await Location.requestForegroundPermissionsAsync()
			if (status === 'granted') {
				const location = await Location.getCurrentPositionAsync({})
				setUserLocation({
					latitude: location.coords.latitude,
					longitude: location.coords.longitude
				})
			}
		} catch (error) {
			console.error('Error getting location:', error)
		}
	}

	const handleAddAttendee = async (newAttendee: Attendee) => {
		if (!event) return

		const updatedEvent = {
			...event,
			attendees: [...event.attendees, newAttendee]
		}

		await storage.updateEvent(updatedEvent)
		setEvent(updatedEvent)
	}

	const handleRemoveAttendee = async (attendeeId: string) => {
		if (!event) return

		const updatedEvent = {
			...event,
			attendees: event.attendees.filter(
				(a: { id: string }) => a.id !== attendeeId
			)
		}

		await storage.updateEvent(updatedEvent)
		setEvent(updatedEvent)
	}

	const handleUpdateStatus = async (
		attendeeId: string,
		status: 'yes' | 'no' | 'maybe'
	) => {
		if (!event) return

		const updatedEvent = {
			...event,
			attendees: event.attendees.map((a: { id: string }) =>
				a.id === attendeeId ? { ...a, rsvpStatus: status } : a
			)
		}

		await storage.updateEvent(updatedEvent)
		setEvent(updatedEvent)
	}

	const handleRSVP = async () => {
		if (!event) return

		const updatedEvent = { ...event }
		if (isRSVPed) {
			updatedEvent.attendees = updatedEvent.attendees.filter(
				(a: { id: string }) => a.id !== 'current-user'
			)
		} else {
			updatedEvent.attendees.push({
				id: 'current-user',
				name: 'You',
				rsvpStatus: 'yes'
			})
		}

		await storage.updateEvent(updatedEvent)
		setEvent(updatedEvent)
		setIsRSVPed(!isRSVPed)
	}

	const addToCalendar = async () => {
		if (!event) return

		try {
			const { status } = await Calendar.requestCalendarPermissionsAsync()
			if (status !== 'granted') {
				Alert.alert(
					'Permission needed',
					'Calendar permission is required to add events'
				)
				return
			}

			const calendars = await Calendar.getCalendarsAsync(
				Calendar.EntityTypes.EVENT
			)
			const defaultCalendar =
				calendars.find(cal => cal.isPrimary) || calendars[0]

			if (!defaultCalendar) {
				Alert.alert('Error', 'No calendar found')
				return
			}

			const eventDate = new Date(event.date)
			const [hours, minutes] = event.time.split(':')
			eventDate.setHours(parseInt(hours), parseInt(minutes))

			await Calendar.createEventAsync(defaultCalendar.id, {
				title: event.title,
				startDate: eventDate,
				endDate: new Date(eventDate.getTime() + 2 * 60 * 60 * 1000),
				location: event.location.name,
				notes: `Address: ${event.location.address || event.location.name}`
			})

			Alert.alert('Success', 'Event added to calendar')
		} catch (error) {
			Alert.alert('Error', 'Failed to add event to calendar')
		}
	}

	const openInMaps = () => {
		if (!event) return

		const scheme = Platform.select({
			ios: 'maps:0,0?q=',
			android: 'geo:0,0?q='
		})
		const latLng = `${event.location.latitude},${event.location.longitude}`
		const label = encodeURIComponent(event.location.name)
		const url: any = Platform.select({
			ios: `${scheme}${label}@${latLng}`,
			android: `${scheme}${latLng}(${label})`
		})

		Linking.openURL(url)
	}

	const getDirections = () => {
		if (!event) return

		const url: any = Platform.select({
			ios: `http://maps.apple.com/?daddr=${event.location.latitude},${event.location.longitude}`,
			android: `https://www.google.com/maps/dir/?api=1&destination=${event.location.latitude},${event.location.longitude}`
		})

		Linking.openURL(url)
	}

	const handleDelete = async () => {
		Alert.alert('Delete Event', 'Are you sure you want to delete this event?', [
			{ text: 'Cancel', style: 'cancel' },
			{
				text: 'Delete',
				style: 'destructive',
				onPress: async () => {
					if (event) {
						await storage.deleteEvent(event.id)
						router.back()
					}
				}
			}
		])
	}

	if (!event) {
		return (
			<View style={styles.container}>
				<Text>Loading...</Text>
			</View>
		)
	}

	const attendeeStats = {
		yes: event.attendees.filter(
			(a: { rsvpStatus: string }) => a.rsvpStatus === 'yes'
		).length,
		no: event.attendees.filter(
			(a: { rsvpStatus: string }) => a.rsvpStatus === 'no'
		).length,
		maybe: event.attendees.filter(
			(a: { rsvpStatus: string }) => a.rsvpStatus === 'maybe'
		).length
	}

	return (
		<ScrollView style={styles.container}>
			<Text style={styles.title}>{event.title}</Text>

			<Card style={styles.infoContainer}>
				<Card.Content>
					<Text style={styles.infoText}>
						Date: {format(new Date(event.date), 'PPP')}
					</Text>
					<Text style={styles.infoText}>Time: {event.time}</Text>
					<Text style={styles.infoText}>Location: {event.location.name}</Text>
					{event.location.address && (
						<Text style={styles.infoText}>
							Address: {event.location.address}
						</Text>
					)}
					<Text style={styles.infoText}>
						Attendees: {attendeeStats.yes} going · {attendeeStats.maybe} maybe ·{' '}
						{attendeeStats.no} not going
					</Text>
				</Card.Content>
			</Card>

			<MapView
				provider={PROVIDER_GOOGLE}
				style={styles.map}
				initialRegion={{
					latitude: event.location.latitude,
					longitude: event.location.longitude,
					latitudeDelta: 0.0922,
					longitudeDelta: 0.0421
				}}>
				<Marker
					coordinate={{
						latitude: event.location.latitude,
						longitude: event.location.longitude
					}}
					title={event.location.name}
					description={event.location.address}
				/>
				{userLocation && (
					<Marker
						coordinate={userLocation}
						title='You are here'
						pinColor='blue'
					/>
				)}
			</MapView>

			<View style={styles.mapButtons}>
				<Button
					mode='contained'
					onPress={openInMaps}
					style={styles.mapButton}
					icon='map'>
					Open in Maps
				</Button>
				<Button
					mode='contained'
					onPress={getDirections}
					style={styles.mapButton}
					icon='directions'>
					Get Directions
				</Button>
			</View>

			<AttendeesList
				attendees={event.attendees}
				onAddAttendee={handleAddAttendee}
				onRemoveAttendee={handleRemoveAttendee}
				onUpdateStatus={handleUpdateStatus}
			/>

			<Button
				mode='contained'
				onPress={handleRSVP}
				style={styles.button}
				icon={isRSVPed ? 'close' : 'check'}>
				{isRSVPed ? 'Cancel RSVP' : 'RSVP'}
			</Button>

			<Button
				mode='contained'
				onPress={addToCalendar}
				style={styles.button}
				icon='calendar'>
				Add to Calendar
			</Button>

			<Button
				mode='contained'
				onPress={() => router.push(`/edit/${event.id}`)}
				style={styles.button}
				icon='pencil'>
				Edit Event
			</Button>

			<Button
				mode='contained'
				onPress={handleDelete}
				style={[styles.button, styles.deleteButton]}
				icon='delete'>
				Delete Event
			</Button>
		</ScrollView>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 16,
		backgroundColor: '#f5f5f5'
	},
	title: {
		fontSize: 24,
		fontWeight: 'bold',
		marginBottom: 16
	},
	infoContainer: {
		marginBottom: 16,
		elevation: 2
	},
	infoText: {
		fontSize: 16,
		marginBottom: 8
	},
	map: {
		width: '100%',
		height: 300,
		marginBottom: 16,
		borderRadius: 8
	},
	mapButtons: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginBottom: 16
	},
	mapButton: {
		flex: 1,
		marginHorizontal: 4
	},
	button: {
		marginBottom: 12
	},
	deleteButton: {
		backgroundColor: '#dc3545'
	}
})
