import { View, Text, StyleSheet, Pressable } from 'react-native'
import { router } from 'expo-router'
import { format } from 'date-fns'

export default function EventCard({ event }: any) {
	return (
		<Pressable style={styles.card} onPress={() => router.push(`/${event.id}`)}>
			<Text style={styles.title}>{event.title}</Text>
			<Text style={styles.date}>
				{format(new Date(event.date), 'PPP')} at {event.time}
			</Text>
			<Text style={styles.location}>{event.location.name}</Text>
			<Text style={styles.attendees}>{event.attendees.length} attendee(s)</Text>
		</Pressable>
	)
}

const styles = StyleSheet.create({
	card: {
		backgroundColor: 'white',
		padding: 16,
		margin: 8,
		borderRadius: 8,
		elevation: 2,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.25,
		shadowRadius: 3.84
	},
	title: {
		fontSize: 18,
		fontWeight: 'bold',
		marginBottom: 8
	},
	date: {
		fontSize: 14,
		color: '#666',
		marginBottom: 4
	},
	location: {
		fontSize: 14,
		color: '#666',
		marginBottom: 4
	},
	attendees: {
		fontSize: 14,
		color: '#666'
	}
})
