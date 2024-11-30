import { Stack } from 'expo-router'

export default function RootLayout() {
	return (
		<Stack screenOptions={{ headerShown: false }}>
			<Stack.Screen name='(tabs)' options={{ headerShown: false }} />
			<Stack.Screen name='[id]' options={{ headerShown: false }} />
			<Stack.Screen name='edit/[id]' options={{ headerShown: false }} />
			<Stack.Screen name='modals/add-event' options={{ headerShown: false }} />
		</Stack>
	)
}
