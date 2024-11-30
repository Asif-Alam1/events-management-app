import { View, FlatList, StyleSheet } from 'react-native'
import { useEffect, useState } from 'react'
import { router, useFocusEffect } from 'expo-router'
import EventCard from '../../components/EventCard'
import { FAB } from 'react-native-paper'
import { Searchbar } from 'react-native-paper'
import { storage, Event } from '../utils/storage'

export default function EventsScreen() {
	const [events, setEvents] = useState<Event[]>([])
	const [searchQuery, setSearchQuery] = useState('')

	useFocusEffect(() => {
		loadEvents()
	})

	const filteredEvents = events.filter(
		event =>
			event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
			event.location.name.toLowerCase().includes(searchQuery.toLowerCase())
	)

	const loadEvents = async () => {
		const loadedEvents = await storage.getEvents()
		setEvents(loadedEvents)
	}

	return (
		<View style={styles.container}>
			<Searchbar
				placeholder='Search events'
				onChangeText={setSearchQuery}
				value={searchQuery}
				style={styles.searchBar}
			/>

			<FlatList
				data={filteredEvents}
				renderItem={({ item }) => <EventCard event={item} />}
				keyExtractor={item => item.id}
			/>
			<FAB
				icon='plus'
				style={styles.fab}
				onPress={() => router.push('/modals/add-event')}
			/>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1
	},
	fab: {
		position: 'absolute',
		margin: 16,
		right: 0,
		bottom: 0
	},
	searchBar: {
		margin: 8,
		elevation: 2,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.25,
		shadowRadius: 3.84
	}
})
