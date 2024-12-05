import AsyncStorage from '@react-native-async-storage/async-storage'

const USERS_KEY = '@users'
const CURRENT_USER_KEY = '@current_user'

interface User {
	username: string
	password: string
	email: string
}

export const authStorage = {
	async registerUser(user: User): Promise<boolean> {
		try {
			const existingUsers = await this.getUsers()
			if (existingUsers.some(u => u.username === user.username)) {
				return false
			}
			existingUsers.push(user)
			await AsyncStorage.setItem(USERS_KEY, JSON.stringify(existingUsers))
			return true
		} catch (error) {
			console.error('Error registering user:', error)
			return false
		}
	},

	async loginUser(username: string, password: string): Promise<boolean> {
		try {
			const users = await this.getUsers()
			const user = users.find(
				u => u.username === username && u.password === password
			)
			if (user) {
				await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user))
				return true
			}
			return false
		} catch (error) {
			console.error('Error logging in:', error)
			return false
		}
	},

	async getCurrentUser(): Promise<User | null> {
		try {
			const userJson = await AsyncStorage.getItem(CURRENT_USER_KEY)
			return userJson ? JSON.parse(userJson) : null
		} catch (error) {
			console.error('Error getting current user:', error)
			return null
		}
	},

	async logout(): Promise<void> {
		try {
			await AsyncStorage.removeItem(CURRENT_USER_KEY)
		} catch (error) {
			console.error('Error logging out:', error)
		}
	},

	async getUsers(): Promise<User[]> {
		try {
			const usersJson = await AsyncStorage.getItem(USERS_KEY)
			return usersJson ? JSON.parse(usersJson) : []
		} catch (error) {
			console.error('Error getting users:', error)
			return []
		}
	}
}
