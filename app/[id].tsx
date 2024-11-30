import { useState, useEffect } from 'react'
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native'
import { useLocalSearchParams, router } from 'expo-router'
import { Button } from 'react-native-paper'
import MapView, { Marker } from 'react-native-maps'
import { storage, Event } from './utils/storage'
import * as Calendar from 'expo-calendar'
import { format } from 'date-fns'

export default function EventDetailsScreen() {
	const { id } = useLocalSearchParams()
	const [event, setEvent] = useState<Event | null>(null)
	const [isRSVPed, setIsRSVPed] = useState(false)

	useEffect(() => {
		loadEvent()
	}, [id])

	const loadEvent = async () => {
		const events = await storage.getEvents()
		const foundEvent = events.find(e => e.id === id)
		if (foundEvent) {
			setEvent(foundEvent)
			setIsRSVPed(foundEvent.attendees.includes('current-user')) // In a real app, use actual user ID
		}
	}

	const handleRSVP = async () => {
		if (!event) return

		const updatedEvent = { ...event }
		if (isRSVPed) {
			updatedEvent.attendees = updatedEvent.attendees.filter(
				a => a !== 'current-user'
			)
		} else {
			updatedEvent.attendees.push('current-user')
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
				endDate: new Date(eventDate.getTime() + 2 * 60 * 60 * 1000), // 2 hours duration
				location: event.location.name
			})

			Alert.alert('Success', 'Event added to calendar')
		} catch (error) {
			Alert.alert('Error', 'Failed to add event to calendar')
		}
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

	return (
		<ScrollView style={styles.container}>
			<Text style={styles.title}>{event.title}</Text>

			<View style={styles.infoContainer}>
				<Text style={styles.infoText}>
					Date: {format(new Date(event.date), 'PPP')}
				</Text>
				<Text style={styles.infoText}>Time: {event.time}</Text>
				<Text style={styles.infoText}>Location: {event.location.name}</Text>
				<Text style={styles.infoText}>Attendees: {event.attendees.length}</Text>
			</View>

			<MapView
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
				/>
			</MapView>

			<Button mode='contained' onPress={handleRSVP} style={styles.button}>
				{isRSVPed ? 'Cancel RSVP' : 'RSVP'}
			</Button>

			<Button mode='contained' onPress={addToCalendar} style={styles.button}>
				Add to Calendar
			</Button>

			<Button
				mode='contained'
				onPress={() => router.push(`/edit/${event.id}`)}
				style={styles.button}>
				Edit Event
			</Button>

			<Button
				mode='contained'
				onPress={handleDelete}
				style={[styles.button, styles.deleteButton]}>
				Delete Event
			</Button>
		</ScrollView>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 16
	},
	title: {
		fontSize: 24,
		fontWeight: 'bold',
		marginBottom: 16
	},
	infoContainer: {
		backgroundColor: 'white',
		padding: 16,
		borderRadius: 8,
		marginBottom: 16
	},
	infoText: {
		fontSize: 16,
		marginBottom: 8
	},
	map: {
		width: '100%',
		height: 200,
		marginBottom: 16,
		borderRadius: 8
	},
	button: {
		marginBottom: 12
	},
	deleteButton: {
		backgroundColor: '#dc3545'
	}
})
