import AsyncStorage from '@react-native-async-storage/async-storage'

const EVENTS_KEY = '@events'

export interface Location {
	name: string
	latitude: number
	longitude: number
}

export interface Event {
	id: string
	title: string
	date: string
	time: string
	location: Location
	attendees: string[]
}

export const storage = {
	clearAllData: async (): Promise<void> => {
		try {
			await AsyncStorage.removeItem(EVENTS_KEY)
		} catch (error) {
			console.error('Error clearing data:', error)
		}
	},

	async getEvents(): Promise<Event[]> {
		try {
			const events = await AsyncStorage.getItem(EVENTS_KEY)
			return events ? JSON.parse(events) : []
		} catch (error) {
			console.error('Error loading events:', error)
			return []
		}
	},

	async saveEvent(event: Event): Promise<void> {
		try {
			const events = await this.getEvents()
			events.push(event)
			await AsyncStorage.setItem(EVENTS_KEY, JSON.stringify(events))
		} catch (error) {
			console.error('Error saving event:', error)
		}
	},

	async updateEvent(updatedEvent: Event): Promise<void> {
		try {
			const events = await this.getEvents()
			const index = events.findIndex(e => e.id === updatedEvent.id)
			if (index !== -1) {
				events[index] = updatedEvent
				await AsyncStorage.setItem(EVENTS_KEY, JSON.stringify(events))
			}
		} catch (error) {
			console.error('Error updating event:', error)
		}
	},

	async deleteEvent(eventId: string): Promise<void> {
		try {
			const events = await this.getEvents()
			const filtered = events.filter(e => e.id !== eventId)
			await AsyncStorage.setItem(EVENTS_KEY, JSON.stringify(filtered))
		} catch (error) {
			console.error('Error deleting event:', error)
		}
	}
}
