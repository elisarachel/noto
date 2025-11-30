import React, { useState, useMemo } from 'react';
import { View, Text, FlatList, Pressable, Alert } from 'react-native';
import { useApp } from '@/context/AppContext';
import NoteForm from '@/components/NotaForm';
import { Note } from '@/types';
import { Link } from 'expo-router';
import { useAppTheme } from '@/hooks/useAppTheme';

export default function NotesScreen() {
	const { notes, disciplines, addNote, updateNote, removeNote } = useApp();
	const [creating, setCreating] = useState(false);
	const [editing, setEditing] = useState<Note | null>(null);
	const { colors } = useAppTheme();

	const notesSorted = useMemo(() => [...notes].sort((a,b) => (b.updatedAt ?? b.createdAt) - (a.updatedAt ?? a.createdAt)), [notes]);
	const discMap = useMemo(() => Object.fromEntries(disciplines.map(d => [d.id, d.name])), [disciplines]);

	// estilos dependentes do tema
	const btn = { backgroundColor: colors.primary, paddingVertical:10, paddingHorizontal:14, borderRadius:10 } as const;
	const card = { backgroundColor: colors.cardBg, padding:16, borderRadius:12, gap:12 } as const;
	const title = { fontSize:16, fontWeight:'600', color: colors.text } as const;
	const row = { backgroundColor: colors.surface, borderWidth:1, borderColor: colors.border, padding:14, borderRadius:10, flexDirection:'row', alignItems:'center', gap:12 } as const;
	const chip = { backgroundColor: colors.border, paddingVertical:8, paddingHorizontal:10, borderRadius:10 } as const;
	const chipDanger = { backgroundColor:'#b91c1c', paddingVertical:8, paddingHorizontal:10, borderRadius:10 } as const;

	return (
		<View style={{ flex:1, padding:16, gap:16, backgroundColor: colors.background }}>
			<View style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'center' }}>
				<Text style={{ fontSize:22, fontWeight:'700', color: colors.text }}>Anotações</Text>
				<Pressable onPress={() => setCreating(true)} style={btn}>
					<Text style={{ color: colors.onPrimary, fontWeight:'600' }}>Nova</Text>
				</Pressable>
			</View>

			{creating && (
				<View style={card}>
					<Text style={title}>Adicionar anotação</Text>
					<NoteForm
						disciplines={disciplines}
						onSubmit={async (data) => {
							if (!data.disciplineId || !data.title) { Alert.alert('Disciplina e título são obrigatórios'); return; }
							await addNote(data);
							setCreating(false);
						}}
						onCancel={() => setCreating(false)}
					/>
				</View>
			)}

			{editing && (
				<View style={card}>
					<Text style={title}>Editar anotação</Text>
					<NoteForm
						disciplines={disciplines}
						initial={editing}
						onSubmit={async (data) => {
							await updateNote(editing.id, data);
							setEditing(null);
						}}
						onCancel={() => setEditing(null)}
					/>
				</View>
			)}

			<FlatList
				data={notesSorted}
				keyExtractor={(item) => item.id}
				style={{ backgroundColor: colors.background }}
				contentContainerStyle={{ gap:10, paddingBottom:20, backgroundColor: colors.background }}
				renderItem={({ item }) => (
					<View style={row}>
						<Link href={`/notes/${item.id}`} asChild>
							<Pressable style={{ flex:1 }}>
								<Text style={{ fontSize:16, fontWeight:'600', color: colors.text }}>{item.title}</Text>
								<Text style={{ color: colors.textMuted }}>{discMap[item.disciplineId] ?? '—'}</Text>
								{!!item.attachments?.length && (
									<Text style={{ color: colors.textMuted, marginTop:4 }}>{item.attachments.length} anexo(s)</Text>
								)}
							</Pressable>
						</Link>
						<View style={{ flexDirection:'row', gap:8, marginLeft:8 }}>
							<Pressable onPress={() => setEditing(item)} style={chip}><Text style={{ color: colors.text }}>Editar</Text></Pressable>
							<Pressable
								onPress={() => {
									Alert.alert('Excluir', `Excluir "${item.title}"?`, [
										{ text:'Cancelar' },
										{ text:'Excluir', style:'destructive', onPress:() => removeNote(item.id) }
									]);
								}}
								style={chipDanger}
							>
								<Text style={{ color:'#fff' }}>Excluir</Text>
							</Pressable>
						</View>
					</View>
				)}
			/>
		</View>
	);
}
