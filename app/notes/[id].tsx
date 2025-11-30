import React from 'react';
import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useApp } from '@/context/AppContext';
import * as WebBrowser from 'expo-web-browser';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/useAppTheme';
import * as Sharing from 'expo-sharing';

export default function NoteDetails() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const { notes, disciplines } = useApp();
	const router = useRouter();
	const { colors } = useAppTheme();

	const note = notes.find(n => n.id === id);

	if (!note) {
		return (
			<View style={{ flex:1, justifyContent:'center', alignItems:'center', backgroundColor: colors?.background ?? undefined }}>
				<Text style={{ color: colors?.text }}>Nota não encontrada</Text>
			</View>
		);
	}

	const discipline = disciplines.find(d => d.id === note.disciplineId);

	const handleOpenAttachment = async (uri: string) => {
		try {
			// 1) Links da web → abre no navegador
			if (/^https?:\/\//.test(uri)) {
				await WebBrowser.openBrowserAsync(uri);
				return;
			}

			// 2) Arquivos locais (file://, content://, etc.) → usa o share sheet
			const canShare = await Sharing.isAvailableAsync();
			if (!canShare) {
				Alert.alert('Exportação', 'Compartilhamento não disponível neste dispositivo.');
				return;
			}

			await Sharing.shareAsync(uri, {
				mimeType: 'application/pdf',
				dialogTitle: 'Abrir arquivo'
			});
		} catch (err) {
			console.error(err);
			Alert.alert('Erro', 'Ocorreu um erro ao tentar abrir o arquivo.');
		}
	};

	return (
		<ScrollView contentContainerStyle={{ flexGrow:1, padding:16, gap:12, backgroundColor: colors.background }}>
			<Pressable onPress={() => router.replace('/(tabs)/notas')} style={{ flexDirection:'row', alignItems:'center', marginBottom:8 }}>
				<Ionicons name="arrow-back" size={20} color={colors.textMuted} />
				<Text style={{ marginLeft:6, color: colors.text }}>Voltar</Text>
			</Pressable>

			<View style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 12 }}>
				<Text style={{ fontSize:22, fontWeight:'700', color: colors.text }}>{note.title}</Text>
				<Text style={{ color: colors.textMuted, marginTop: 4 }}>{discipline?.name}</Text>

				{!!note.content && (
					<Text style={{ marginTop:12, fontSize:16, lineHeight:22, color: colors.text }}>
						{note.content}
					</Text>
				)}

				{note.attachments && note.attachments.length > 0 && (
				<View style={{ marginTop:16 }}>
					<Text style={{ fontWeight:'600', marginBottom:6, color: colors.text }}>Anexos</Text>
					{note.attachments.map((a, idx) => (
						<Pressable
							key={idx}
							onPress={() => {
								if (typeof a.uri === 'string') {
									handleOpenAttachment(a.uri);
								} else {
									Alert.alert('Anexo inválido', 'Este anexo não possui uma URL válida.');
								}
							}}
							style={{
								flexDirection:'row',
								alignItems:'center',
								padding:10,
								borderWidth:1,
								borderColor: colors.border,
								borderRadius:8,
								marginBottom:6,
								backgroundColor: colors.cardBg
							}}
						>
							<Ionicons name="document-attach-outline" size={20} color={colors.primary} />
							<Text style={{ marginLeft:8, color: colors.primary }}>
								{a.name || 'arquivo'}
							</Text>
						</Pressable>
					))}
				</View>
			)}

			</View>
		</ScrollView>
 	);
 }
