import 'react-native-get-random-values'
import React, { useState, useRef, useEffect } from 'react'
import {
	View,
	TextInput,
	StyleSheet,
	ScrollView,
	Platform,
	TouchableOpacity,
	Text,
	Alert,
	KeyboardAvoidingView,
	Modal
} from 'react-native'
import { useLocalSearchParams, router } from 'expo-router'
import { Button } from 'react-native-paper'
import DateTimePicker from '@react-native-community/datetimepicker'
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps'
import * as Location from 'expo-location'
import { storage, Event } from '../utils/storage'
import { format } from 'date-fns'
import {
	GooglePlaceDetail,
	GooglePlacesAutocomplete
} from 'react-native-google-places-autocomplete'
import { BlurView } from 'expo-blur'
import { Ionicons } from '@expo/vector-icons'
import { AttendeesList } from '@/components/AttendeesList'

export default function EditEventScreen() {
	const { id } = useLocalSearchParams()
	const [title, setTitle] = useState('')
	const [date, setDate] = useState(new Date())
	const [time, setTime] = useState(new Date())
	const [showDatePicker, setShowDatePicker] = useState(false)
	const [showTimePicker, setShowTimePicker] = useState(false)
	const [location, setLocation] = useState({
		name: '',
		address: '',
		latitude: 33.8547,
		longitude: 35.8623
	})
	const [attendees, setAttendees] = useState([])
	const [mapVisible, setMapVisible] = useState(false)
	const [selectedLocation, setSelectedLocation] = useState(null)
	const [mapRegion, setMapRegion] = useState({
		latitude: 33.8547,
		longitude: 35.8623,
		latitudeDelta: 0.0922,
		longitudeDelta: 0.0421
	})

	const mapRef = useRef(null)

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
			setAttendees(event.attendees || [])
			setMapRegion({
				latitude: event.location.latitude,
				longitude: event.location.longitude,
				latitudeDelta: 0.0922,
				longitudeDelta: 0.0421
			})
			setSelectedLocation({
				latitude: event.location.latitude,
				longitude: event.location.longitude
			})
		}
	}

	const getUserLocation = async () => {
		try {
			const { status } = await Location.requestForegroundPermissionsAsync()
			if (status !== 'granted') {
				Alert.alert(
					'Permission Denied',
					'Location permission is required for this feature.'
				)
				return
			}

			const currentLocation = await Location.getCurrentPositionAsync({})
			const newRegion = {
				latitude: currentLocation.coords.latitude,
				longitude: currentLocation.coords.longitude,
				latitudeDelta: 0.0922,
				longitudeDelta: 0.0421
			}

			setMapRegion(newRegion)
			setSelectedLocation({
				latitude: currentLocation.coords.latitude,
				longitude: currentLocation.coords.longitude
			})
			setLocation(prev => ({
				...prev,
				latitude: currentLocation.coords.latitude,
				longitude: currentLocation.coords.longitude
			}))
		} catch (error) {
			console.error('Error getting location:', error)
			Alert.alert('Error', 'Failed to get current location')
		}
	}

	const handleDateChange = (event, selectedDate) => {
		setShowDatePicker(Platform.OS === 'ios')
		if (selectedDate) {
			setDate(selectedDate)
		}
	}

	const handleTimeChange = (event, selectedTime) => {
		setShowTimePicker(Platform.OS === 'ios')
		if (selectedTime) {
			setTime(selectedTime)
		}
	}

	const handleMapPress = e => {
		const { latitude, longitude } = e.nativeEvent.coordinate
		setSelectedLocation({ latitude, longitude })
		setMapRegion({
			...mapRegion,
			latitude,
			longitude
		})
	}

	const selectLocation = (details: GooglePlaceDetail) => {
		if (details?.geometry?.location) {
			const { lat, lng } = details.geometry.location
			const newRegion = {
				latitude: lat,
				longitude: lng,
				latitudeDelta: 0.0922,
				longitudeDelta: 0.0421
			}

			setSelectedLocation({ latitude: lat, longitude: lng })
			setMapRegion(newRegion)
			setLocation({
				name: details.name || '',
				address: details.formatted_address || '',
				latitude: lat,
				longitude: lng
			})

			mapRef.current?.animateToRegion(newRegion, 1000)
		}
	}

	const confirmLocation = () => {
		if (selectedLocation) {
			setLocation(prev => ({
				...prev,
				latitude: selectedLocation.latitude,
				longitude: selectedLocation.longitude
			}))
		}
		setMapVisible(false)
	}

	const handleUpdate = async () => {
		if (!title || !location.name) {
			Alert.alert('Error', 'Please fill in all required fields')
			return
		}

		const updatedEvent = {
			id: id as string,
			title,
			date: date.toISOString().split('T')[0],
			time: format(time, 'HH:mm'),
			location: {
				name: location.name,
				address: location.address,
				latitude: location.latitude,
				longitude: location.longitude
			},
			attendees
		}

		try {
			await storage.updateEvent(updatedEvent)
			Alert.alert('Success', 'Event updated successfully', [
				{ text: 'OK', onPress: () => router.back() }
			])
		} catch (error) {
			Alert.alert('Error', 'Failed to update event')
		}
	}

	const handleAddAttendee = newAttendee => {
		setAttendees([...attendees, newAttendee])
	}

	const handleRemoveAttendee = attendeeId => {
		setAttendees(attendees.filter(a => a.id !== attendeeId))
	}

	const handleUpdateStatus = (attendeeId, status) => {
		setAttendees(
			attendees.map(a =>
				a.id === attendeeId ? { ...a, rsvpStatus: status } : a
			)
		)
	}

	return (
		<KeyboardAvoidingView
			behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
			style={styles.container}>
			<ScrollView>
				<Text style={styles.header}>Edit Event</Text>

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
						onChange={handleDateChange}
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
						onChange={handleTimeChange}
					/>
				)}

				<TextInput
					style={styles.input}
					placeholder='Location Name'
					value={location.name}
					onChangeText={text => setLocation(prev => ({ ...prev, name: text }))}
				/>

				<View style={styles.mapButtonsContainer}>
					<TouchableOpacity
						style={[styles.mapButton, { backgroundColor: '#4285F4' }]}
						onPress={getUserLocation}>
						<Ionicons name='location' size={24} color='white' />
						<Text style={styles.buttonText}>Current Location</Text>
					</TouchableOpacity>

					<TouchableOpacity
						style={[styles.mapButton, { backgroundColor: '#34A853' }]}
						onPress={() => setMapVisible(true)}>
						<Ionicons name='map' size={24} color='white' />
						<Text style={styles.buttonText}>Pick on Map</Text>
					</TouchableOpacity>
				</View>

				<AttendeesList
					attendees={attendees}
					onAddAttendee={handleAddAttendee}
					onRemoveAttendee={handleRemoveAttendee}
					onUpdateStatus={handleUpdateStatus}
				/>

				<Button
					mode='contained'
					onPress={handleUpdate}
					style={styles.updateButton}>
					Update Event
				</Button>

				<Button
					mode='outlined'
					onPress={() => router.back()}
					style={styles.button}>
					Cancel
				</Button>
			</ScrollView>

			<Modal visible={mapVisible} animationType='slide'>
				<View style={styles.modalContainer}>
					<GooglePlacesAutocomplete
						placeholder='Search for a location'
						onPress={(data, details = null) => {
							if (details) selectLocation(details)
						}}
						query={{
							key: 'AIzaSyCe8nbmSQBR9KmZG5AP3yYZeKogvjQbwX4',
							language: 'en',
							components: 'country:lb',
							region: 'lb'
						}}
						fetchDetails={true}
						styles={{
							container: styles.searchContainer,
							textInput: styles.searchInput
						}}
						filterReverseGeocodingByTypes={[
							'locality',
							'administrative_area_level_3'
						]}
					/>

					<MapView
						ref={mapRef}
						provider={PROVIDER_GOOGLE}
						style={styles.map}
						region={mapRegion}
						onPress={handleMapPress}>
						{selectedLocation && (
							<Marker
								coordinate={{
									latitude: selectedLocation.latitude,
									longitude: selectedLocation.longitude
								}}
							/>
						)}
					</MapView>

					<BlurView
						intensity={80}
						tint='light'
						style={styles.coordinatesContainer}>
						{selectedLocation && (
							<Text>
								Selected: {selectedLocation.latitude.toFixed(6)},{' '}
								{selectedLocation.longitude.toFixed(6)}
							</Text>
						)}
					</BlurView>

					<View style={styles.modalButtons}>
						<TouchableOpacity
							style={[styles.modalButton, { backgroundColor: '#DC3545' }]}
							onPress={() => setMapVisible(false)}>
							<Ionicons name='close' size={24} color='white' />
							<Text style={styles.buttonText}>Cancel</Text>
						</TouchableOpacity>

						<TouchableOpacity
							style={[styles.modalButton, { backgroundColor: '#28A745' }]}
							onPress={confirmLocation}>
							<Ionicons name='checkmark' size={24} color='white' />
							<Text style={styles.buttonText}>Confirm</Text>
						</TouchableOpacity>
					</View>
				</View>
			</Modal>
		</KeyboardAvoidingView>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#fff'
	},
	header: {
		fontSize: 24,
		fontWeight: 'bold',
		margin: 16
	},
	input: {
		backgroundColor: 'white',
		padding: 12,
		borderRadius: 8,
		marginHorizontal: 16,
		marginBottom: 16,
		borderWidth: 1,
		borderColor: '#ddd'
	},
	dateTimeButton: {
		backgroundColor: 'white',
		padding: 12,
		borderRadius: 8,
		marginHorizontal: 16,
		marginBottom: 16,
		borderWidth: 1,
		borderColor: '#ddd'
	},
	mapButtonsContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginHorizontal: 16,
		marginBottom: 16
	},
	mapButton: {
		flexDirection: 'row',
		alignItems: 'center',
		padding: 12,
		borderRadius: 8,
		flex: 1,
		marginHorizontal: 4,
		justifyContent: 'center'
	},
	buttonText: {
		color: 'white',
		marginLeft: 8,
		fontWeight: 'bold'
	},
	updateButton: {
		margin: 16,
		paddingVertical: 8
	},
	button: {
		marginHorizontal: 16,
		marginBottom: 16
	},
	modalContainer: {
		flex: 1
	},
	searchContainer: {
		position: 'absolute',
		top: 44,
		left: 10,
		right: 10,
		zIndex: 1
	},
	searchInput: {
		height: 44,
		borderRadius: 8,
		paddingHorizontal: 16,
		backgroundColor: 'white',
		borderWidth: 1,
		borderColor: '#ddd'
	},
	map: {
		flex: 1
	},
	coordinatesContainer: {
		position: 'absolute',
		bottom: 80,
		left: 10,
		right: 10,
		padding: 10,
		borderRadius: 8
	},
	modalButtons: {
		flexDirection: 'row',
		justifyContent: 'space-around',
		padding: 16,
		backgroundColor: 'white'
	},
	modalButton: {
		flexDirection: 'row',
		alignItems: 'center',
		padding: 12,
		borderRadius: 8,
		minWidth: 120,
		justifyContent: 'center'
	}
})
