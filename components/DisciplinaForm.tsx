import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, ScrollView } from 'react-native';
import { Discipline } from '@/types';

type Props = {
	initial?: Partial<Discipline>;
	onSubmit: (data: { name: string; professor?: string; code?: string; }) => void;
	onCancel?: () => void;
};

export default function DisciplineForm({ initial, onSubmit, onCancel }: Props) {
	const [name, setName] = useState(initial?.name ?? '');
	const [professor, setProfessor] = useState(initial?.professor ?? '');
	const [code, setCode] = useState(initial?.code ?? '');

	useEffect(() => {
		if (initial) {
			setName(initial.name ?? '');
			setProfessor(initial.professor ?? '');
			setCode(initial.code ?? '');
		}
	}, [initial]);

	return (
		<KeyboardAvoidingView
		behavior={Platform.OS === 'ios' ? 'padding' : undefined}
		style={{}}
		>
			<TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
				<ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ gap:10 }}>
					<Text>Nome da disciplina*</Text>
					<TextInput value={name} onChangeText={setName} placeholder="Ex.: Cálculo I" style={input} />

					<Text>Professor(a)</Text>
					<TextInput value={professor} onChangeText={setProfessor} placeholder="Ex.: Profa. Maria" style={input} />

					<Text>Código da turma</Text>
					<TextInput value={code} onChangeText={setCode} placeholder="Ex.: T01-2025" style={input} />

					<View style={{ flexDirection:'row', gap:10 }}>
						<Pressable
							onPress={() => onSubmit({ name: name.trim(), professor: professor.trim() || undefined, code: code.trim() || undefined })}
							style={btnPrimary}
						>
							<Text style={{ color:'#fff', fontWeight:'600' }}>Salvar</Text>
						</Pressable>
						{onCancel && (
							<Pressable onPress={onCancel} style={btnSecondary}>
								<Text>Cancelar</Text>
							</Pressable>
						)}
					</View>
				</ScrollView>
			</TouchableWithoutFeedback>
		</KeyboardAvoidingView>
	);
}

const input = { borderWidth:1, borderColor:'#ccc', padding:12, borderRadius:8 } as const;
const btnPrimary = { backgroundColor:'#1e40af', paddingVertical:12, paddingHorizontal:16, borderRadius:10 } as const;
const btnSecondary = { backgroundColor:'#e5e7eb', paddingVertical:12, paddingHorizontal:16, borderRadius:10 } as const;
