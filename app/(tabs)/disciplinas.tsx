import React, { useState } from 'react';
import { View, Text, FlatList, Pressable, Alert } from 'react-native';
import { useApp } from '@/context/AppContext';
import DisciplineForm from '@/components/DisciplinaForm';
import { Discipline } from '@/types';

export default function DisciplinesScreen() {
	const { disciplines, addDiscipline, updateDiscipline, removeDiscipline, incrementAbsence, decrementAbsence } = useApp();
	const [editing, setEditing] = useState<Discipline | null>(null);
	const [creating, setCreating] = useState(false);

	function getAbsColor(cur: number, max?: number) {
		if (max == null || max <= 0) return '#6b7280'; // cinza quando não definido
		const ratio = cur / max;
		if (ratio < 0.5) return '#16a34a';              // verde
		if (ratio < 0.8) return '#f59e0b';              // amarelo
		return '#b91c1c';                               // vermelho
	}

	return (
		<FlatList
			data={disciplines}
			keyExtractor={(item) => item.id}
			contentContainerStyle={{ padding:16, gap:16, paddingBottom:20 }}
			ListHeaderComponent={() => (
				<View style={{ gap:16 }}>
					<View style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'center' }}>
						<Text style={{ fontSize:22, fontWeight:'700' }}>Disciplinas</Text>
						<Pressable onPress={() => { setCreating(true); setEditing(null); }} style={btn}>
							<Text style={{ color:'#fff', fontWeight:'600' }}>Nova</Text>
						</Pressable>
					</View>

					{creating && (
						<View style={card}>
							<Text style={title}>Adicionar disciplina</Text>
							<DisciplineForm
								onSubmit={async (data) => {
									if (!data.name) { Alert.alert('Informe o nome'); return; }
									await addDiscipline(data);
									setCreating(false);
								}}
								onCancel={() => setCreating(false)}
							/>
						</View>
					)}

					{editing && (
						<View style={card}>
							<Text style={title}>Editar disciplina</Text>
							<DisciplineForm
								initial={editing}
								onSubmit={async (data) => {
									await updateDiscipline(editing.id, data);
									setEditing(null);
								}}
								onCancel={() => setEditing(null)}
							/>
						</View>
					)}
				</View>
			)}
			renderItem={({ item }) => (
				<View style={row}>
					{/* HEADER: info + ações principais */}
					<View style={{ flexDirection:'row', alignItems:'center', gap:12 }}>
						<View style={{ flex:1 }}>
							<Text style={{ fontSize:16, fontWeight:'600' }}>{item.name}</Text>
							{!!item.professor && <Text style={{ color:'#555' }}>Prof.: {item.professor}</Text>}
							{!!item.code && <Text style={{ color:'#777' }}>Código: {item.code}</Text>}
							{!!item.grading?.components?.length && (
								<Text style={{ color: '#4b5563', marginTop: 4 }}>
									{item.grading.components.map(c => `${c.label} ${c.weight}%`).join('  •  ')}
								</Text>
							)}
						</View>

						<View style={{ flexDirection:'row', gap:8 }}>
							<Pressable onPress={() => setEditing(item)} style={chip}>
								<Text>Editar</Text>
							</Pressable>
							<Pressable
								onPress={() => {
									Alert.alert('Excluir', `Excluir "${item.name}"?`, [
										{ text: 'Cancelar' },
										{ text: 'Excluir', style: 'destructive', onPress: () => removeDiscipline(item.id) }
									]);
								}}
								style={chipDanger}
							>
								<Text style={{ color:'#fff' }}>Excluir</Text>
							</Pressable>
						</View>
					</View>

					{/* FOOTER: faltas (+/−) embaixo pra reduzir poluição visual */}
					{(item.maxAbsences != null || item.absences != null) && (
						<View style={footer}>
							<View style={{
								backgroundColor: getAbsColor(item.absences ?? 0, item.maxAbsences),
								paddingVertical: 6, paddingHorizontal: 10, borderRadius: 999
							}}>
								<Text style={{ color:'#fff', fontWeight:'700' }}>
									Faltas: {item.absences ?? 0}{item.maxAbsences != null ? ` / ${item.maxAbsences}` : ''}
								</Text>
							</View>

							<View style={{ flexDirection:'row', gap:8 }}>
								<Pressable
									onPress={async () => { await decrementAbsence(item.id, 1); }}
									style={[chip, { paddingHorizontal:12 }]}
								>
									<Text>−</Text>
								</Pressable>
								<Pressable
									onPress={async () => {
										await incrementAbsence(item.id, 1);
										const d = disciplines.find(d => d.id === item.id);
										const cur = (d?.absences ?? 0) + 0;
										if (d?.maxAbsences != null && cur >= d.maxAbsences) {
											Alert.alert('Atenção', `Você atingiu o limite de faltas em "${item.name}".`);
										}
									}}
									style={[chip, { backgroundColor:'#1e40af' }]}
								>
									<Text style={{ color:'#fff', fontWeight:'600' }}>+ Falta</Text>
								</Pressable>
							</View>
						</View>
					)}
				</View>
			)}
		/>
	);
}

const btn = { backgroundColor:'#1e40af', paddingVertical:10, paddingHorizontal:14, borderRadius:10 } as const;
const card = { backgroundColor:'#f3f4f6', padding:16, borderRadius:12, gap:12 } as const;
const title = { fontSize:16, fontWeight:'600' } as const;

/* nota: alinhei o card para 'flex-start' pra caber o footer bonitinho em baixo */
const row = {
	backgroundColor:'#fff',
	borderWidth:1,
	borderColor:'#e5e7eb',
	padding:14,
	borderRadius:10,
	gap:10
} as const;

const footer = {
	marginTop:8,
	borderTopWidth:1,
	borderColor:'#e5e7eb',
	paddingTop:8,
	flexDirection:'row',
	alignItems:'center',
	justifyContent:'space-between'
} as const;

const chip = { backgroundColor:'#e5e7eb', paddingVertical:8, paddingHorizontal:10, borderRadius:10, alignItems:'center' } as const;
const chipDanger = { backgroundColor:'#b91c1c', paddingVertical:8, paddingHorizontal:10, borderRadius:10, alignItems:'center' } as const;
