import React, { useState, useMemo } from 'react';
import { View, Text, FlatList, Pressable, Alert } from 'react-native';
import { useApp } from '@/context/AppContext';
import NoteForm from '@/components/NotaForm';
import { Note } from '@/types';
import { Link } from 'expo-router';

export default function NotesScreen() {
	const { notes, disciplines, addNote, updateNote, removeNote } = useApp();
	const [creating, setCreating] = useState(false);
	const [editing, setEditing] = useState<Note | null>(null);

	const notesSorted = useMemo(() => [...notes].sort((a,b) => (b.updatedAt ?? b.createdAt) - (a.updatedAt ?? a.createdAt)), [notes]);
	const discMap = useMemo(() => Object.fromEntries(disciplines.map(d => [d.id, d.name])), [disciplines]);

	return (
		<View style={{ flex:1, padding:16, gap:16 }}>
			<View style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'center' }}>
				<Text style={{ fontSize:22, fontWeight:'700' }}>Anotações</Text>
				<Pressable onPress={() => setCreating(true)} style={btn}>
					<Text style={{ color:'#fff', fontWeight:'600' }}>Nova</Text>
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
				contentContainerStyle={{ gap:10, paddingBottom:20 }}
				   renderItem={({ item }) => (
					   <View style={row}>
						   <Link href={`/notes/${item.id}`} asChild>
							   <Pressable style={{ flex:1 }}>
								   <Text style={{ fontSize:16, fontWeight:'600' }}>{item.title}</Text>
								   <Text style={{ color:'#555' }}>{discMap[item.disciplineId] ?? '—'}</Text>
								   {!!item.attachments?.length && (
									   <Text style={{ color:'#777', marginTop:4 }}>{item.attachments.length} anexo(s)</Text>
								   )}
							   </Pressable>
						   </Link>
						   <View style={{ flexDirection:'row', gap:8, marginLeft:8 }}>
							   <Pressable onPress={() => setEditing(item)} style={chip}><Text>Editar</Text></Pressable>
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

const btn = { backgroundColor:'#1e40af', paddingVertical:10, paddingHorizontal:14, borderRadius:10 } as const;
const card = { backgroundColor:'#f3f4f6', padding:16, borderRadius:12, gap:12 } as const;
const title = { fontSize:16, fontWeight:'600' } as const;
const row = { backgroundColor:'#fff', borderWidth:1, borderColor:'#e5e7eb', padding:14, borderRadius:10, flexDirection:'row', alignItems:'center', gap:12 } as const;
const chip = { backgroundColor:'#e5e7eb', paddingVertical:8, paddingHorizontal:10, borderRadius:10 } as const;
const chipDanger = { backgroundColor:'#b91c1c', paddingVertical:8, paddingHorizontal:10, borderRadius:10 } as const;
