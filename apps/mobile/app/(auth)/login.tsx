import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Link, router } from 'expo-router';
import { Button } from '@mma/ui';
import { useAuthStore } from '@mma/store';
import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import * as AppleAuthentication from 'expo-apple-authentication';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { setError } = useAuthStore();

  async function handleEmailLogin() {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    setLoading(true);
    try {
      await auth().signInWithEmailAndPassword(email, password);
      router.replace('/(tabs)');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Invalid email or password';
      setError(message);
      Alert.alert('Error', 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    try {
      await GoogleSignin.hasPlayServices();
      const signInResult = await GoogleSignin.signIn();
      const idToken = signInResult.data?.idToken;
      if (!idToken) throw new Error('No ID token');
      const credential = auth.GoogleAuthProvider.credential(idToken);
      await auth().signInWithCredential(credential);
      router.replace('/(tabs)');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Google sign-in failed';
      Alert.alert('Error', message);
    }
  }

  async function handleAppleLogin() {
    try {
      const appleCredential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      const { identityToken } = appleCredential;
      if (!identityToken) throw new Error('No identity token');
      const credential = auth.AppleAuthProvider.credential(identityToken);
      await auth().signInWithCredential(credential);
      router.replace('/(tabs)');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Apple sign-in failed';
      Alert.alert('Error', message);
    }
  }

  return (
    <View className="flex-1 bg-white px-6 justify-center">
      <Text className="text-3xl font-bold text-center mb-8">MapMyActivities</Text>

      <TextInput
        className="border border-gray-300 rounded-lg px-4 py-3 mb-4 text-base"
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        testID="email-input"
        accessibilityLabel="Email address"
      />

      <TextInput
        className="border border-gray-300 rounded-lg px-4 py-3 mb-6 text-base"
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        testID="password-input"
        accessibilityLabel="Password"
      />

      <Button
        title="Sign In"
        onPress={handleEmailLogin}
        loading={loading}
        testID="signin-button"
      />

      <View className="flex-row items-center my-6">
        <View className="flex-1 h-px bg-gray-300" />
        <Text className="mx-4 text-gray-500">or</Text>
        <View className="flex-1 h-px bg-gray-300" />
      </View>

      <TouchableOpacity
        className="bg-white border border-gray-300 rounded-lg py-3 items-center mb-3"
        onPress={handleGoogleLogin}
        testID="google-signin-button"
        accessibilityRole="button"
        accessibilityLabel="Continue with Google"
      >
        <Text className="text-base font-medium">Continue with Google</Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="bg-black rounded-lg py-3 items-center mb-6"
        onPress={handleAppleLogin}
        testID="apple-signin-button"
        accessibilityRole="button"
        accessibilityLabel="Continue with Apple"
      >
        <Text className="text-white text-base font-medium">Continue with Apple</Text>
      </TouchableOpacity>

      <Link href="/(auth)/register" asChild>
        <TouchableOpacity className="items-center">
          <Text className="text-blue-600 text-base">
            Don't have an account? <Text className="font-semibold">Sign Up</Text>
          </Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}
