import { Tabs } from 'expo-router'
import { FontAwesome } from '@expo/vector-icons'

export default function TabLayout() {
	return (
		<Tabs
			screenOptions={{
				tabBarActiveTintColor: '#2196F3'
			}}>
			<Tabs.Screen
				name='index'
				options={{
					title: 'Events',
					tabBarIcon: ({ color }) => (
						<FontAwesome name='calendar' size={24} color={color} />
					)
				}}
			/>
			<Tabs.Screen
				name='calendar'
				options={{
					title: 'Calendar',
					tabBarIcon: ({ color }) => (
						<FontAwesome name='calendar-check-o' size={24} color={color} />
					)
				}}
			/>
			<Tabs.Screen
				name='profile'
				options={{
					title: 'Profile',
					tabBarIcon: ({ color }) => (
						<FontAwesome name='user' size={24} color={color} />
					)
				}}
			/>
		</Tabs>
	)
}
