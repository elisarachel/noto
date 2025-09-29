import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, ScrollView } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { NoteAttachment, Discipline } from '@/types';

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

	return (
		<KeyboardAvoidingView
		behavior={Platform.OS === 'ios' ? 'padding' : undefined}
		style={{}}
		>
			<TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
				<ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ gap:10 }}>
					<Text>Disciplina*</Text>
					<View style={selectWrap}>
						{disciplines.length === 0 ? (
							<Text style={{ color:'#777' }}>Cadastre uma disciplina primeiro</Text>
						) : (
							<View style={{ gap:6 }}>
								{disciplines.map(d => (
									<Pressable key={d.id} onPress={() => setDisciplineId(d.id)} style={[pill, d.id === disciplineId && pillActive]}>
										<Text style={{ color: d.id === disciplineId ? '#fff' : '#111' }}>{d.name}</Text>
									</Pressable>
								))}
							</View>
						)}
					</View>

					<Text>Título*</Text>
					<TextInput value={title} onChangeText={setTitle} placeholder="Ex.: Resumo da aula 1" style={input} />

					<Text>Conteúdo</Text>
					<TextInput value={content} onChangeText={setContent} placeholder="Anotações..." multiline style={[input, { minHeight: 100, textAlignVertical:'top' }]} />

					<View style={{ gap:6 }}>
						<Text>Anexos</Text>
						<View style={{ flexDirection:'row', gap:8, flexWrap:'wrap' }}>
							{attachments.map(a => (
								<Pressable key={a.uri} onLongPress={() => removeAttachment(a.uri)} style={fileChip}>
									<Text numberOfLines={1} style={{ maxWidth:160 }}>{a.name ?? 'arquivo'}</Text>
								</Pressable>
							))}
							<Pressable onPress={pickFile} style={fileAdd}>
								<Text style={{ color:'#1e40af', fontWeight:'600' }}>+ Anexar</Text>
							</Pressable>
						</View>
					</View>

					<View style={{ flexDirection:'row', gap:10 }}>
						<Pressable
							onPress={() => onSubmit({ disciplineId, title: title.trim(), content: content.trim() || undefined, attachments })}
							style={btnPrimary}
						>
							<Text style={{ color:'#fff', fontWeight:'600' }}>Salvar</Text>
						</Pressable>
						{onCancel && <Pressable onPress={onCancel} style={btnSecondary}><Text>Cancelar</Text></Pressable>}
					</View>
				</ScrollView>
			</TouchableWithoutFeedback>
		</KeyboardAvoidingView>
	);
}

const input = { borderWidth:1, borderColor:'#ccc', padding:12, borderRadius:8 } as const;
const selectWrap = { borderWidth:1, borderColor:'#ccc', padding:12, borderRadius:8 } as const;
const pill = { backgroundColor:'#e5e7eb', paddingVertical:8, paddingHorizontal:12, borderRadius:999 } as const;
const pillActive = { backgroundColor:'#1e40af' } as const;
const fileChip = { borderWidth:1, borderColor:'#d1d5db', paddingVertical:6, paddingHorizontal:10, borderRadius:999, backgroundColor:'#fff' } as const;
const fileAdd = { borderWidth:1, borderColor:'#1e40af', paddingVertical:6, paddingHorizontal:10, borderRadius:999, backgroundColor:'#eef2ff' } as const;
const btnPrimary = { backgroundColor:'#1e40af', paddingVertical:12, paddingHorizontal:16, borderRadius:10 } as const;
const btnSecondary = { backgroundColor:'#e5e7eb', paddingVertical:12, paddingHorizontal:16, borderRadius:10 } as const;
