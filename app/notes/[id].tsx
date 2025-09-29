import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useApp } from '@/context/AppContext';
import * as WebBrowser from 'expo-web-browser';
import { Ionicons } from '@expo/vector-icons';

export default function NoteDetails() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const { notes, disciplines } = useApp();
	const router = useRouter();

	const note = notes.find(n => n.id === id);

	if (!note) {
		return (
			<View style={{ flex:1, justifyContent:'center', alignItems:'center' }}>
				<Text>Nota não encontrada</Text>
			</View>
		);
	}

	const discipline = disciplines.find(d => d.id === note.disciplineId);

	return (
		<ScrollView contentContainerStyle={{ flexGrow:1, padding:16, gap:12 }}>
			<Pressable onPress={() => router.replace('/(tabs)/notas')} style={{ flexDirection:'row', alignItems:'center', marginBottom:8 }}>
				<Ionicons name="arrow-back" size={20} color="#374151" />
				<Text style={{ marginLeft:6 }}>Voltar</Text>
			</Pressable>

			<Text style={{ fontSize:22, fontWeight:'700' }}>{note.title}</Text>
			<Text style={{ color:'#6b7280' }}>{discipline?.name}</Text>

			{!!note.content && (
				<Text style={{ marginTop:12, fontSize:16, lineHeight:22 }}>
					{note.content}
				</Text>
			)}

			{/* Lista de anexos */}
			{note.attachments && note.attachments.length > 0 && (
				<View style={{ marginTop:16 }}>
					<Text style={{ fontWeight:'600', marginBottom:6 }}>Anexos</Text>
					{note.attachments.map((a, idx) => (
						<Pressable
							key={idx}
							onPress={() => {
								if (typeof a.uri === 'string' && /^https?:\/\//.test(a.uri)) {
									WebBrowser.openBrowserAsync(a.uri);
								} else {
									alert('URL do anexo inválida.');
								}
							}}
							style={{
								flexDirection:'row',
								alignItems:'center',
								padding:10,
								borderWidth:1,
								borderColor:'#ddd',
								borderRadius:8,
								marginBottom:6,
								backgroundColor:'#f9fafb'
							}}
						>
							<Ionicons name="document-attach-outline" size={20} color="#1e40af" />
							<Text style={{ marginLeft:8, color:'#1e40af' }}>
								{a.name || 'arquivo'}
							</Text>
						</Pressable>
					))}
				</View>
			)}
		</ScrollView>
	);
}
