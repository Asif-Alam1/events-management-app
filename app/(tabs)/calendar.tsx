import { useState, useEffect } from 'react'
import { View, StyleSheet } from 'react-native'
import { Calendar as RNCalendar } from 'react-native-calendars'
import { storage, Event } from '../utils/storage'
import { router } from 'expo-router'

export default function CalendarScreen() {
	const [markedDates, setMarkedDates] = useState({})
	const [events, setEvents] = useState<Event[]>([])

	useEffect(() => {
		loadEvents()
	}, [])

	const loadEvents = async () => {
		const loadedEvents = await storage.getEvents()
		setEvents(loadedEvents)

		const marked = loadedEvents.reduce((acc: any, event) => {
			acc[event.date] = {
				marked: true,
				dotColor: '#2196F3'
			}
			return acc
		}, {})

		setMarkedDates(marked)
	}

	const onDayPress = (day: any) => {
		const eventsOnDay = events.filter(event => event.date === day.dateString)
		if (eventsOnDay.length > 0) {
			router.push(`/${eventsOnDay[0].id}`)
		}
	}

	return (
		<View style={styles.container}>
			<RNCalendar
				markedDates={markedDates}
				onDayPress={onDayPress}
				theme={{
					selectedDayBackgroundColor: '#2196F3',
					todayTextColor: '#2196F3',
					dotColor: '#2196F3'
				}}
			/>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: 'white'
	}
})
