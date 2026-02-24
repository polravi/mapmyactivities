import { View, Text, Switch, TouchableOpacity, Alert } from 'react-native';
import { useAuthStore } from '@mma/store';
import auth from '@react-native-firebase/auth';
import { router } from 'expo-router';

export default function SettingsScreen() {
  const { user, clearUser } = useAuthStore();

  async function handleSignOut() {
    try {
      await auth().signOut();
      clearUser();
      router.replace('/(auth)/login');
    } catch (error) {
      Alert.alert('Error', 'Failed to sign out');
    }
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Profile section */}
      <View className="bg-white p-4 mb-4">
        <Text className="text-lg font-semibold">{user?.displayName ?? 'User'}</Text>
        <Text className="text-gray-500 mt-1">{user?.email}</Text>
        <View className="mt-2 bg-blue-100 self-start px-3 py-1 rounded-full">
          <Text className="text-blue-700 text-sm font-medium capitalize">
            {user?.subscription?.tier ?? 'free'} plan
          </Text>
        </View>
      </View>

      {/* Preferences */}
      <View className="bg-white p-4 mb-4">
        <Text className="text-base font-semibold mb-4">Preferences</Text>

        <View className="flex-row justify-between items-center py-3 border-b border-gray-100">
          <Text className="text-base">Push Notifications</Text>
          <Switch value={true} />
        </View>

        <View className="flex-row justify-between items-center py-3 border-b border-gray-100">
          <Text className="text-base">Voice Auto-Stop</Text>
          <Switch value={true} />
        </View>

        <View className="flex-row justify-between items-center py-3">
          <Text className="text-base">Theme</Text>
          <Text className="text-gray-500">System</Text>
        </View>
      </View>

      {/* Sign Out */}
      <TouchableOpacity
        className="bg-white p-4 items-center"
        onPress={handleSignOut}
        testID="signout-button"
      >
        <Text className="text-red-600 text-base font-medium">Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}
