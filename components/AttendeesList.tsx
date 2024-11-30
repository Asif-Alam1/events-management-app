import { View, Text, StyleSheet } from 'react-native'
import { List, TextInput, Button, IconButton } from 'react-native-paper'
import { useState } from 'react'
import type { Attendee } from '@/app/utils/storage'

interface AttendeesListProps {
	attendees: Attendee[]
	onAddAttendee: (attendee: Attendee) => void
	onRemoveAttendee: (id: string) => void
	onUpdateStatus: (id: string, status: 'yes' | 'no' | 'maybe') => void
}

export function AttendeesList({
	attendees,
	onAddAttendee,
	onRemoveAttendee,
	onUpdateStatus
}: AttendeesListProps) {
	const [newAttendeeName, setNewAttendeeName] = useState('')

	const handleAdd = () => {
		if (newAttendeeName.trim()) {
			onAddAttendee({
				id: Date.now().toString(),
				name: newAttendeeName.trim(),
				rsvpStatus: 'no'
			})
			setNewAttendeeName('')
		}
	}

	return (
		<View style={styles.container}>
			<View style={styles.addSection}>
				<TextInput
					style={styles.input}
					value={newAttendeeName}
					onChangeText={setNewAttendeeName}
					placeholder='Add attendee name'
					mode='outlined'
				/>
				<Button onPress={handleAdd} mode='contained'>
					Add
				</Button>
			</View>

			<List.Section>
				<List.Subheader>Attendees ({attendees.length})</List.Subheader>
				{attendees.map(attendee => (
					<List.Item
						key={attendee.id}
						title={attendee.name}
						description={`RSVP: ${attendee.rsvpStatus}`}
						right={() => (
							<View style={styles.itemActions}>
								<IconButton
									icon='check'
									onPress={() => onUpdateStatus(attendee.id, 'yes')}
									iconColor={attendee.rsvpStatus === 'yes' ? 'green' : 'gray'}
								/>
								<IconButton
									icon='help'
									onPress={() => onUpdateStatus(attendee.id, 'maybe')}
									iconColor={
										attendee.rsvpStatus === 'maybe' ? 'orange' : 'gray'
									}
								/>
								<IconButton
									icon='close'
									onPress={() => onUpdateStatus(attendee.id, 'no')}
									iconColor={attendee.rsvpStatus === 'no' ? 'red' : 'gray'}
								/>
								<IconButton
									icon='delete'
									onPress={() => onRemoveAttendee(attendee.id)}
								/>
							</View>
						)}
					/>
				))}
			</List.Section>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		marginVertical: 10,
		backgroundColor: 'white',
		borderRadius: 8,
		padding: 16
	},
	addSection: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 10,
		gap: 8
	},
	input: {
		flex: 1
	},
	itemActions: {
		flexDirection: 'row',
		alignItems: 'center'
	}
})
