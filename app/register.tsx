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

export default function RegisterScreen() {
	const [username, setUsername] = useState('')
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [confirmPassword, setConfirmPassword] = useState('')

	const handleRegister = async () => {
		if (!username || !email || !password || !confirmPassword) {
			Alert.alert('Error', 'Please fill in all fields')
			return
		}

		if (password !== confirmPassword) {
			Alert.alert('Error', 'Passwords do not match')
			return
		}

		const success = await authStorage.registerUser({
			username,
			email,
			password
		})

		if (success) {
			Alert.alert('Success', 'Registration successful', [
				{ text: 'OK', onPress: () => router.back() }
			])
		} else {
			Alert.alert('Error', 'Username already exists')
		}
	}

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Create Account</Text>
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
					placeholder='Email'
					value={email}
					onChangeText={setEmail}
					autoCapitalize='none'
					keyboardType='email-address'
				/>
				<TextInput
					style={styles.input}
					placeholder='Password'
					value={password}
					onChangeText={setPassword}
					secureTextEntry
				/>
				<TextInput
					style={styles.input}
					placeholder='Confirm Password'
					value={confirmPassword}
					onChangeText={setConfirmPassword}
					secureTextEntry
				/>
				<TouchableOpacity style={styles.button} onPress={handleRegister}>
					<Text style={styles.buttonText}>Register</Text>
				</TouchableOpacity>
				<TouchableOpacity onPress={() => router.back()}>
					<Text style={styles.loginText}>Already have an account? Login</Text>
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
	loginText: {
		color: '#2196F3',
		textAlign: 'center',
		marginTop: 20
	}
})
