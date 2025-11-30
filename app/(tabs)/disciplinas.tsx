import React, { useState } from 'react';
import { View, Text, FlatList, Pressable, Alert } from 'react-native';
import { useApp } from '@/context/AppContext';
import DisciplineForm from '@/components/DisciplinaForm';
import { Discipline } from '@/types';
import { useAppTheme } from '@/hooks/useAppTheme';

export default function DisciplinesScreen() {
	const { disciplines, addDiscipline, updateDiscipline, removeDiscipline, incrementAbsence, decrementAbsence } = useApp();
	const [editing, setEditing] = useState<Discipline | null>(null);
	const [creating, setCreating] = useState(false);
	const { colors } = useAppTheme();

	function getAbsColor(cur: number, max?: number) {
		if (max == null || max <= 0) return colors.textMuted; // cinza quando não definido
		const ratio = cur / max;
		if (ratio < 0.5) return '#16a34a';              // verde (mantido sem tema)
		if (ratio < 0.8) return colors.accent;         // amarelo/aviso -> usa accent do tema
		return '#b91c1c';                               // vermelho (mantido sem tema)
	}

	// estilos abaixo usam o tema
	const btn = { backgroundColor: colors.primary, paddingVertical:10, paddingHorizontal:14, borderRadius:10 } as const;
	const card = { backgroundColor: colors.cardBg, padding:16, borderRadius:12, gap:12 } as const;
	const title = { fontSize:16, fontWeight:'600', color: colors.text } as const;

	/* nota: alinhei o card para 'flex-start' pra caber o footer bonitinho em baixo */
	const row = {
		backgroundColor: colors.surface,
		borderWidth:1,
		borderColor: colors.border,
		padding:14,
		borderRadius:10,
		gap:10
	} as const;

	const footer = {
		marginTop:8,
		borderTopWidth:1,
		borderColor: colors.border,
		paddingTop:8,
		flexDirection:'row',
		alignItems:'center',
		justifyContent:'space-between'
	} as const;

	const chip = { backgroundColor: colors.border, paddingVertical:8, paddingHorizontal:10, borderRadius:10, alignItems:'center' } as const;
	const chipDanger = { backgroundColor:'#b91c1c', paddingVertical:8, paddingHorizontal:10, borderRadius:10, alignItems:'center' } as const;

	return (
		<FlatList
			style={{ backgroundColor: colors.background }}
			data={disciplines}
			keyExtractor={(item) => item.id}
			contentContainerStyle={{ padding:16, gap:16, paddingBottom:20, backgroundColor: colors.background }}
			ListHeaderComponent={() => (
				<View style={{ gap:16 }}>
					<View style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'center' }}>
						<Text style={{ fontSize:22, fontWeight:'700', color: colors.text }}>Disciplinas</Text>
						<Pressable onPress={() => { setCreating(true); setEditing(null); }} style={btn}>
							<Text style={{ color: colors.onPrimary, fontWeight:'600' }}>Nova</Text>
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
							<Text style={{ fontSize:16, fontWeight:'600', color: colors.text }}>{item.name}</Text>
							{!!item.professor && <Text style={{ color: colors.textMuted }}>Prof.: {item.professor}</Text>}
							{!!item.code && <Text style={{ color: colors.textMuted }}>Código: {item.code}</Text>}
							{!!item.grading?.components?.length && (
								<Text style={{ color: colors.textMuted, marginTop: 4 }}>
									{item.grading.components.map(c => `${c.label} ${c.weight}%`).join('  •  ')}
								</Text>
							)}
						</View>

						<View style={{ flexDirection:'row', gap:8 }}>
							<Pressable onPress={() => setEditing(item)} style={chip}>
								<Text style={{ color: colors.text }}>Editar</Text>
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
									<Text style={{ color: colors.text }}>−</Text>
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
									style={[chip, { backgroundColor: colors.primary }]}
								>
									<Text style={{ color: colors.onPrimary, fontWeight:'600' }}>+ Falta</Text>
								</Pressable>
							</View>
						</View>
					)}
				</View>
			)}
		/>
	);
}
