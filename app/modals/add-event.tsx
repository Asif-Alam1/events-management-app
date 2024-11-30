import { useState } from 'react'
import {
	View,
	TextInput,
	StyleSheet,
	ScrollView,
	Platform,
	TouchableOpacity,
	Text
} from 'react-native'
import { router } from 'expo-router'
import { Button } from 'react-native-paper'
import DateTimePicker from '@react-native-community/datetimepicker'
import * as Location from 'expo-location'
import MapView, { Marker } from 'react-native-maps'
import { storage, Event } from '../utils/storage'
import { format } from 'date-fns'
import { AttendeesList } from '@/components/AttendeesList'

export default function AddEventModal() {
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
	const [attendees, setAttendees] = useState<any>([])

	const handleCreate = async () => {
		const newEvent: Event = {
			id: Date.now().toString(),
			title,
			date: date.toISOString().split('T')[0],
			time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
			location,
			attendees: attendees
		}

		await storage.saveEvent(newEvent)
		router.back()
	}

	const handleAddAttendee = (newAttendee: any) => {
		setAttendees([...attendees, newAttendee])
	}

	const handleRemoveAttendee = (attendeeId: any) => {
		setAttendees(attendees.filter((a: { id: any }) => a.id !== attendeeId))
	}

	const handleUpdateStatus = (attendeeId: any, status: any) => {
		setAttendees(
			attendees.map((a: { id: any }) =>
				a.id === attendeeId ? { ...a, rsvpStatus: status } : a
			)
		)
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

	const pickLocation = async () => {
		const { status } = await Location.requestForegroundPermissionsAsync()
		if (status !== 'granted') {
			alert('Permission to access location was denied')
			return
		}

		const currentLocation = await Location.getCurrentPositionAsync({})
		setLocation({
			...location,
			latitude: currentLocation.coords.latitude,
			longitude: currentLocation.coords.longitude
		})
	}

	return (
		<ScrollView style={styles.container}>
			<TextInput
				style={styles.input}
				placeholder='Event Title'
				value={title}
				onChangeText={setTitle}
			/>


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
				}}>
				{location.latitude !== 0 && (
					<Marker
						coordinate={{
							latitude: location.latitude,
							longitude: location.longitude
						}}
					/>
				)}
			</MapView>

			<Button mode='contained' onPress={pickLocation} style={styles.button}>
				Pick Current Location
			</Button>

			<AttendeesList
				attendees={attendees}
				onAddAttendee={handleAddAttendee}
				onRemoveAttendee={handleRemoveAttendee}
				onUpdateStatus={handleUpdateStatus}
			/>

			<Button mode='contained' onPress={handleCreate} style={styles.button}>
				Create Event
			</Button>
		</ScrollView>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 16
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
	createButton: {
		marginTop: 8,
		marginBottom: 32
	}
})
