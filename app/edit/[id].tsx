import { useState, useEffect } from 'react'
import {
	View,
	TextInput,
	StyleSheet,
	ScrollView,
	Platform,
	TouchableOpacity,
	Text,
	Alert
} from 'react-native'
import { useLocalSearchParams, router } from 'expo-router'
import { Button } from 'react-native-paper'
import DateTimePicker from '@react-native-community/datetimepicker'
import MapView, { Marker } from 'react-native-maps'
import { storage, Event } from '../utils/storage'
import { format } from 'date-fns'

export default function EditEventScreen() {
	const { id } = useLocalSearchParams()
	const [title, setTitle] = useState('')
	const [date, setDate] = useState(new Date())
	const [time, setTime] = useState(new Date())
	const [showDatePicker, setShowDatePicker] = useState(false)
	const [showTimePicker, setShowTimePicker] = useState(false)
	const [location, setLocation] = useState({
		name: '',
		latitude: 0,
		longitude: 0
	})

	useEffect(() => {
		loadEvent()
	}, [id])

	const loadEvent = async () => {
		const events = await storage.getEvents()
		const event = events.find(e => e.id === id)
		if (event) {
			setTitle(event.title)
			setDate(new Date(event.date))
			const [hours, minutes] = event.time.split(':')
			const timeDate = new Date()
			timeDate.setHours(parseInt(hours), parseInt(minutes))
			setTime(timeDate)
			setLocation(event.location)
		}
	}

	const handleUpdate = async () => {
		const updatedEvent: Event = {
			id: id as string,
			title,
			date: date.toISOString().split('T')[0],
			time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
			location,
			attendees: [] // We'll keep the existing attendees in the next step
		}

		try {
			const events = await storage.getEvents()
			const existingEvent = events.find(e => e.id === id)
			if (existingEvent) {
				updatedEvent.attendees = existingEvent.attendees
			}

			await storage.updateEvent(updatedEvent)
			Alert.alert('Success', 'Event updated successfully', [
				{ text: 'OK', onPress: () => router.back() }
			])
		} catch (error) {
			Alert.alert('Error', 'Failed to update event')
		}
	}

	const onDateChange = (event: any, selectedDate?: Date) => {
		const currentDate = selectedDate || date
		setShowDatePicker(Platform.OS === 'ios')
		setDate(currentDate)
	}

	const onTimeChange = (event: any, selectedTime?: Date) => {
		const currentTime = selectedTime || time
		setShowTimePicker(Platform.OS === 'ios')
		setTime(currentTime)
	}

	const onMapPress = (e: any) => {
		setLocation({
			...location,
			latitude: e.nativeEvent.coordinate.latitude,
			longitude: e.nativeEvent.coordinate.longitude
		})
	}

	return (
		<ScrollView style={styles.container}>
			<Text style={styles.header}>Edit Event</Text>

			<TextInput
				style={styles.input}
				placeholder='Event Title'
				value={title}
				onChangeText={setTitle}
			/>

			{/* Date Selection */}
			<TouchableOpacity
				style={styles.dateTimeButton}
				onPress={() => setShowDatePicker(true)}>
				<Text>Date: {format(date, 'PPP')}</Text>
			</TouchableOpacity>

			{showDatePicker && (
				<DateTimePicker
					value={date}
					mode='date'
					display={Platform.OS === 'ios' ? 'spinner' : 'default'}
					onChange={onDateChange}
				/>
			)}

			{/* Time Selection */}
			<TouchableOpacity
				style={styles.dateTimeButton}
				onPress={() => setShowTimePicker(true)}>
				<Text>Time: {format(time, 'p')}</Text>
			</TouchableOpacity>

			{showTimePicker && (
				<DateTimePicker
					value={time}
					mode='time'
					display={Platform.OS === 'ios' ? 'spinner' : 'default'}
					onChange={onTimeChange}
				/>
			)}

			<TextInput
				style={styles.input}
				placeholder='Location Name'
				value={location.name}
				onChangeText={text => setLocation({ ...location, name: text })}
			/>

			<MapView
				style={styles.map}
				initialRegion={{
					latitude: location.latitude || 0,
					longitude: location.longitude || 0,
					latitudeDelta: 0.0922,
					longitudeDelta: 0.0421
				}}
				onPress={onMapPress}>
				<Marker
					coordinate={{
						latitude: location.latitude,
						longitude: location.longitude
					}}
					draggable
					onDragEnd={e => {
						setLocation({
							...location,
							latitude: e.nativeEvent.coordinate.latitude,
							longitude: e.nativeEvent.coordinate.longitude
						})
					}}
				/>
			</MapView>

			<Button
				mode='contained'
				onPress={handleUpdate}
				style={[styles.button, styles.updateButton]}>
				Update Event
			</Button>

			<Button
				mode='outlined'
				onPress={() => router.back()}
				style={styles.button}>
				Cancel
			</Button>
		</ScrollView>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 16
	},
	header: {
		fontSize: 24,
		fontWeight: 'bold',
		marginBottom: 20
	},
	input: {
		backgroundColor: 'white',
		padding: 12,
		borderRadius: 8,
		marginBottom: 16,
		borderWidth: 1,
		borderColor: '#ddd'
	},
	dateTimeButton: {
		backgroundColor: 'white',
		padding: 12,
		borderRadius: 8,
		marginBottom: 16,
		borderWidth: 1,
		borderColor: '#ddd'
	},
	map: {
		width: '100%',
		height: 200,
		marginBottom: 16,
		borderRadius: 8
	},
	button: {
		marginBottom: 16
	},
	updateButton: {
		marginTop: 8
	}
})
