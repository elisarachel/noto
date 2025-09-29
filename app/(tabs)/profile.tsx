import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, Alert, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useApp } from '@/context/AppContext';
import { Profile } from '@/types';

export default function ProfileScreen() {
	const { profile, setProfile } = useApp();
	const router = useRouter();
	const [name, setName] = useState(profile?.name ?? '');
	const [course, setCourse] = useState(profile?.course ?? '');
	const [institution, setInstitution] = useState(profile?.institution ?? '');
	const [semester, setSemester] = useState(profile?.semester ?? '');

	useEffect(() => {
		if (profile) {
			setName(profile.name); setCourse(profile.course);
			setInstitution(profile.institution); setSemester(profile.semester);
		}
	}, [profile]);

	const onSave = async () => {
		if (!name.trim() || !course.trim() || !institution.trim() || !semester.trim()) {
			Alert.alert('Preencha todos os campos');
			return;
		}
		const generateUUID = () => {
			return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
				const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
				return v.toString(16);
			});
		};

		const data: Profile = {
			id: profile?.id ?? generateUUID(),
			name: name.trim(),
			course: course.trim(),
			institution: institution.trim(),
			semester: semester.trim(),
			createdAt: profile?.createdAt ?? Date.now()
		};
		await setProfile(data);
		router.replace('/profile');
	};

	return (
		<KeyboardAvoidingView
			behavior={Platform.OS === 'ios' ? 'padding' : undefined}
			style={{ flex: 1 }}
		>
			<TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
				<ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 16, gap: 12 }}>
					<Text style={{ fontSize: 22, fontWeight: '600' }}>Seu Perfil</Text>

					<Text>Nome</Text>
					<TextInput value={name} onChangeText={setName} placeholder="Ex.: Elisa Beninca" style={styles.input} />

					<Text>Curso</Text>
					<TextInput value={course} onChangeText={setCourse} placeholder="Ex.: DSM - FATEC" style={styles.input} />

					<Text>Instituição</Text>
					<TextInput value={institution} onChangeText={setInstitution} placeholder="Ex.: FATEC SJC" style={styles.input} />

					<Text>Semestre</Text>
					<TextInput value={semester} onChangeText={setSemester} placeholder="Ex.: 5º" style={styles.input} />

					<Pressable onPress={onSave} style={styles.btn}>
						<Text style={{ color: '#fff', fontWeight: '600' }}>Salvar</Text>
					</Pressable>
				</ScrollView>
			</TouchableWithoutFeedback>
		</KeyboardAvoidingView>
	);
}

const styles = {
	input: { borderWidth: 1, borderColor: '#ccc', padding: 12, borderRadius: 8 },
	btn: { backgroundColor: '#1e40af', padding: 14, borderRadius: 10, alignItems: 'center', marginTop: 8 }
} as const;
