import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, ScrollView } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { NoteAttachment, Discipline } from '@/types';
import { useAppTheme } from '@/hooks/useAppTheme';

type Props = {
	disciplines: Discipline[];
	initial?: {
		disciplineId?: string;
		title?: string;
		content?: string;
		attachments?: NoteAttachment[];
	};
	onSubmit: (data: { disciplineId: string; title: string; content?: string; attachments?: NoteAttachment[] }) => void;
	onCancel?: () => void;
};

export default function NoteForm({ disciplines, initial, onSubmit, onCancel }: Props) {
	const [disciplineId, setDisciplineId] = useState(initial?.disciplineId ?? (disciplines[0]?.id ?? ''));
	const [title, setTitle] = useState(initial?.title ?? '');
	const [content, setContent] = useState(initial?.content ?? '');
	const [attachments, setAttachments] = useState<NoteAttachment[]>(initial?.attachments ?? []);
	const { colors } = useAppTheme();

	const pickFile = async () => {
		const res = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true, multiple: false });
		if (!res.canceled && res.assets && res.assets.length > 0) {
			const file = res.assets[0];
			setAttachments(prev => [
				...prev,
				{ uri: file.uri, name: file.name, mimeType: file.mimeType }
			]);
		}
	};

	const removeAttachment = (uri: string) => {
		setAttachments(prev => prev.filter(a => a.uri !== uri));
	};

	// estilos dependentes do tema
	const input = { borderWidth:1, borderColor: colors.border, padding:12, borderRadius:8, color: colors.text } as const;
	const selectWrap = { borderWidth:1, borderColor: colors.border, padding:12, borderRadius:8, backgroundColor: colors.cardBg } as const;
	const pill = { backgroundColor: colors.border, paddingVertical:8, paddingHorizontal:12, borderRadius:999 } as const;
	const pillActive = { backgroundColor: colors.primary } as const;
	const fileChip = { borderWidth:1, borderColor: colors.border, paddingVertical:6, paddingHorizontal:10, borderRadius:999, backgroundColor: colors.surface } as const;
	const fileAdd = { borderWidth:1, borderColor: colors.primary, paddingVertical:6, paddingHorizontal:10, borderRadius:999, backgroundColor: colors.mutedBg } as const;
	const btnPrimary = { backgroundColor: colors.primary, paddingVertical:12, paddingHorizontal:16, borderRadius:10 } as const;
	const btnSecondary = { backgroundColor: colors.border, paddingVertical:12, paddingHorizontal:16, borderRadius:10 } as const;

	return (
		<KeyboardAvoidingView
		behavior={Platform.OS === 'ios' ? 'padding' : undefined}
		style={{}}
		>
			<TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
				<ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ gap:10, paddingBottom: 8 }}>
					<Text style={{ color: colors.text }}>Disciplina*</Text>
					<View style={selectWrap}>
						{disciplines.length === 0 ? (
							<Text style={{ color: colors.textMuted }}>Cadastre uma disciplina primeiro</Text>
						) : (
							<View style={{ gap:6 }}>
								{disciplines.map(d => (
									<Pressable key={d.id} onPress={() => setDisciplineId(d.id)} style={[pill, d.id === disciplineId && pillActive]}>
										<Text style={{ color: d.id === disciplineId ? colors.onPrimary : colors.text }}>{d.name}</Text>
									</Pressable>
								))}
							</View>
						)}
					</View>

					<Text style={{ color: colors.text }}>Título*</Text>
					<TextInput value={title} onChangeText={setTitle} placeholder="Ex.: Resumo da aula 1" style={input} placeholderTextColor={colors.textMuted} />

					<Text style={{ color: colors.text }}>Conteúdo</Text>
					<TextInput value={content} onChangeText={setContent} placeholder="Anotações..." multiline style={[input, { minHeight: 100, textAlignVertical:'top' }]} placeholderTextColor={colors.textMuted} />

					<View style={{ gap:6 }}>
						<Text style={{ color: colors.text }}>Anexos</Text>
						<View style={{ flexDirection:'row', gap:8, flexWrap:'wrap' }}>
							{attachments.map(a => (
								<Pressable key={a.uri} onLongPress={() => removeAttachment(a.uri)} style={fileChip}>
									<Text numberOfLines={1} style={{ maxWidth:160, color: colors.text }}>{a.name ?? 'arquivo'}</Text>
								</Pressable>
							))}
							<Pressable onPress={pickFile} style={fileAdd}>
								<Text style={{ color: colors.primary, fontWeight:'600' }}>+ Anexar</Text>
							</Pressable>
						</View>
					</View>

					<View style={{ flexDirection:'row', gap:10 }}>
						<Pressable onPress={() => onSubmit({ disciplineId, title: title.trim(), content: content.trim() || undefined, attachments })} style={btnPrimary}>
							<Text style={{ color: colors.onPrimary, fontWeight:'600' }}>Salvar</Text>
						</Pressable>
						{onCancel && <Pressable onPress={onCancel} style={btnSecondary}><Text style={{ color: colors.text }}>Cancelar</Text></Pressable>}
					</View>
				</ScrollView>
			</TouchableWithoutFeedback>
		</KeyboardAvoidingView>
	);
}
