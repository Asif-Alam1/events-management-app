import { View, Text, StyleSheet, ScrollView } from 'react-native'
import { Button } from 'react-native-paper'
import { useEffect, useState } from 'react'
import { storage, Event } from '../utils/storage'

export default function ProfileScreen() {
	const [stats, setStats] = useState({
		totalEvents: 0,
		upcomingEvents: 0,
		eventsRSVPed: 0
	})

	useEffect(() => {
		loadStats()
	}, [])

	const loadStats = async () => {
		const events = await storage.getEvents()
		const today = new Date()

		const upcomingEvents = events.filter(event => {
			const eventDate = new Date(event.date)
			return eventDate >= today
		})

		const eventsRSVPed = events.filter(event =>
			event.attendees.includes('current-user')
		)

		setStats({
			totalEvents: events.length,
			upcomingEvents: upcomingEvents.length,
			eventsRSVPed: eventsRSVPed.length
		})
	}

	return (
		<ScrollView style={styles.container}>
			<View style={styles.header}>
				<Text style={styles.headerText}>My Events Profile</Text>
			</View>

			<View style={styles.statsContainer}>
				<View style={styles.statCard}>
					<Text style={styles.statNumber}>{stats.totalEvents}</Text>
					<Text style={styles.statLabel}>Total Events</Text>
				</View>

				<View style={styles.statCard}>
					<Text style={styles.statNumber}>{stats.upcomingEvents}</Text>
					<Text style={styles.statLabel}>Upcoming</Text>
				</View>

				<View style={styles.statCard}>
					<Text style={styles.statNumber}>{stats.eventsRSVPed}</Text>
					<Text style={styles.statLabel}>RSVPed</Text>
				</View>
			</View>

			<View style={styles.settingsContainer}>
				<Text style={styles.sectionTitle}>Settings</Text>

				<Button
					mode='outlined'
					style={[styles.button, styles.dangerButton]}
					onPress={async () => {
						await storage.clearAllData()
						loadStats()
					}}>
					Clear All Data
				</Button>
			</View>
		</ScrollView>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#f5f5f5'
	},
	header: {
		padding: 20,
		backgroundColor: '#fff',
		borderBottomWidth: 1,
		borderBottomColor: '#ddd'
	},
	headerText: {
		fontSize: 24,
		fontWeight: 'bold'
	},
	statsContainer: {
		flexDirection: 'row',
		justifyContent: 'space-around',
		padding: 20,
		backgroundColor: '#fff',
		marginTop: 20,
		marginHorizontal: 10,
		borderRadius: 10,
		elevation: 2,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4
	},
	statCard: {
		alignItems: 'center'
	},
	statNumber: {
		fontSize: 24,
		fontWeight: 'bold',
		color: '#2196F3'
	},
	statLabel: {
		fontSize: 14,
		color: '#666',
		marginTop: 4
	},
	settingsContainer: {
		padding: 20,
		backgroundColor: '#fff',
		marginTop: 20,
		marginHorizontal: 10,
		borderRadius: 10,
		elevation: 2,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: 'bold',
		marginBottom: 15
	},
	button: {
		marginBottom: 10
	},
	dangerButton: {
		borderColor: '#dc3545',
		marginTop: 20
	}
})
