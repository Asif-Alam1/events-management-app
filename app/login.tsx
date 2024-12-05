import { useState } from 'react'
import {
	View,
	Text,
	StyleSheet,
	TextInput,
	TouchableOpacity,
	Alert
} from 'react-native'
import { router } from 'expo-router'
import { authStorage } from './utils/authStorage'

export default function LoginScreen() {
	const [username, setUsername] = useState('')
	const [password, setPassword] = useState('')

	const handleLogin = async () => {
		if (!username || !password) {
			Alert.alert('Error', 'Please fill in all fields')
			return
		}

		const success = await authStorage.loginUser(username, password)
		if (success) {
			router.replace('/(tabs)')
		} else {
			Alert.alert('Error', 'Invalid username or password')
		}
	}

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Event Manager</Text>
			<View style={styles.inputContainer}>
				<TextInput
					style={styles.input}
					placeholder='Username'
					value={username}
					onChangeText={setUsername}
					autoCapitalize='none'
				/>
				<TextInput
					style={styles.input}
					placeholder='Password'
					value={password}
					onChangeText={setPassword}
					secureTextEntry
				/>
				<TouchableOpacity style={styles.button} onPress={handleLogin}>
					<Text style={styles.buttonText}>Login</Text>
				</TouchableOpacity>
				<TouchableOpacity onPress={() => router.push('/register')}>
					<Text style={styles.registerText}>
						Don't have an account? Register
					</Text>
				</TouchableOpacity>
			</View>
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		padding: 20,
		backgroundColor: '#f5f5f5'
	},
	title: {
		fontSize: 32,
		fontWeight: 'bold',
		textAlign: 'center',
		marginBottom: 40,
		color: '#2196F3'
	},
	inputContainer: {
		backgroundColor: 'white',
		padding: 20,
		borderRadius: 10,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
		elevation: 5
	},
	input: {
		backgroundColor: '#f5f5f5',
		padding: 12,
		borderRadius: 8,
		marginBottom: 16
	},
	button: {
		backgroundColor: '#2196F3',
		padding: 15,
		borderRadius: 8,
		alignItems: 'center'
	},
	buttonText: {
		color: 'white',
		fontSize: 16,
		fontWeight: 'bold'
	},
	registerText: {
		color: '#2196F3',
		textAlign: 'center',
		marginTop: 20
	}
})
