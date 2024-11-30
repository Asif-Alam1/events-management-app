import { useState, useEffect } from 'react'
import { View, StyleSheet, Text } from 'react-native'
import { Calendar as RNCalendar } from 'react-native-calendars'
import { List } from 'react-native-paper'
import { storage, Event } from '../utils/storage'
import { router } from 'expo-router'
import { format } from 'date-fns'

export default function CalendarScreen() {
	const [markedDates, setMarkedDates] = useState<any>({})
	const [events, setEvents] = useState<Event[]>([])
	const [selectedDate, setSelectedDate] = useState('')

	useEffect(() => {
		loadEvents()
	}, [])

	const loadEvents = async () => {
		const loadedEvents = await storage.getEvents()
		setEvents(loadedEvents)

		const marked = loadedEvents.reduce((acc: any, event) => {
			acc[event.date] = {
				marked: true,
				dotColor: '#2196F3',
				selectedColor: '#2196F3'
			}
			return acc
		}, {})

		setMarkedDates(marked)
	}

	const getEventsForDate = (date: string) => {
		return events.filter(event => event.date === date)
	}

	const onDayPress = (day: any) => {
		setSelectedDate(day.dateString)
	}

	return (
		<View style={styles.container}>
			<RNCalendar
				markedDates={{
					...markedDates,
					[selectedDate]: {
						...(markedDates[selectedDate] || {}),
						selected: true
					}
				}}
				onDayPress={onDayPress}
				theme={{
					selectedDayBackgroundColor: '#2196F3',
					todayTextColor: '#2196F3',
					dotColor: '#2196F3'
				}}
			/>

			{selectedDate && (
				<View style={styles.eventsList}>
					<Text style={styles.dateHeader}>
						Events for {format(new Date(selectedDate), 'PPP')}
					</Text>
					{getEventsForDate(selectedDate).map(event => (
						<List.Item
							key={event.id}
							title={event.title}
							description={`${event.time} · ${event.location.name} · ${
								event.attendees.filter(a => a.rsvpStatus === 'yes').length
							} attending`}
							onPress={() => router.push(`/${event.id}`)}
							left={props => <List.Icon {...props} icon='calendar' />}
						/>
					))}
				</View>
			)}
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#fff'
	},
	eventsList: {
		padding: 16
	},
	dateHeader: {
		fontSize: 18,
		fontWeight: 'bold',
		marginBottom: 10
	}
})
