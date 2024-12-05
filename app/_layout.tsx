import { useEffect, useState } from 'react'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { authStorage } from './utils/authStorage'

export default function RootLayout() {
	const [isAuthenticated, setIsAuthenticated] = useState(false)
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		checkAuth()
	}, [])

	const checkAuth = async () => {
		const user = await authStorage.getCurrentUser()
		setIsAuthenticated(!!user)
		setIsLoading(false)
	}

	if (isLoading) {
		return null
	}

	return (
		<>
			<StatusBar style='auto' />
			<Stack screenOptions={{ headerShown: false }}>
				{!isAuthenticated ? (
					<>
						<Stack.Screen name='login' options={{ headerShown: false }} />
						<Stack.Screen name='register' options={{ headerShown: false }} />
					</>
				) : (
					<Stack.Screen name='(tabs)' options={{ headerShown: false }} />
				)}
			</Stack>
		</>
	)
}
