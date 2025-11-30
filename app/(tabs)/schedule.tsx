import React, { useState } from 'react';
import { ClassSchedule } from '@/types';
import { View, Text, FlatList, Pressable } from 'react-native';
import ScheduleForm from '@/components/ScheduleForm';
import { useApp } from '@/context/AppContext';
import { useAppTheme } from '@/hooks/useAppTheme';

const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export default function ScheduleScreen() {
	const { disciplines, schedule, addSchedule, updateSchedule, removeSchedule } = useApp();
	const [formKey, setFormKey] = useState(0); // para resetar o form após submit
	const [creating, setCreating] = useState(false);
	const [editing, setEditing] = useState<ClassSchedule | null>(null);
	const { colors } = useAppTheme();

	// estilos dependentes do tema
	const containerStyle = { flex: 1, padding: 16, gap: 16, backgroundColor: colors.background } as const;
	const cardStyle = { backgroundColor: colors.cardBg, padding: 16, borderRadius: 12, marginVertical: 12 } as const;
	const headerText = { fontSize: 22, fontWeight: '700', color: colors.text } as const;
	const btn = { backgroundColor: colors.primary, paddingVertical:10, paddingHorizontal:14, borderRadius:10 } as const;
	const btnText = { color: colors.onPrimary, fontWeight:'600' } as const;
	const row = { backgroundColor: colors.surface, borderWidth:1, borderColor: colors.border, padding:14, borderRadius:10, flexDirection:'row', alignItems:'center', gap:12 } as const;
	const chip = { backgroundColor: colors.border, paddingVertical:8, paddingHorizontal:10, borderRadius:10 } as const;
	const chipDanger = { backgroundColor:'#b91c1c', paddingVertical:8, paddingHorizontal:10, borderRadius:10 } as const;

	return (
		<View style={containerStyle}>
			<View style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'center' }}>
				<Text style={headerText}>Horários de Aula</Text>
				<Pressable onPress={() => setCreating(true)} style={btn}>
					<Text style={btnText}>Novo</Text>
				</Pressable>
			</View>

			{creating && (
				<View style={cardStyle}>
					<Text style={{ fontSize:16, fontWeight:'600', marginBottom:8, color: colors.text }}>Adicionar horário</Text>
					<ScheduleForm
						key={formKey}
						disciplines={disciplines}
						onSubmit={async (data) => {
							if (!data.disciplineId || !data.start || !data.end) return;
							await addSchedule(data);
							setFormKey(k => k + 1); // reseta o form
							setCreating(false);
						}}
						onCancel={() => setCreating(false)}
					/>
				</View>
			)}

			{editing && (
				<View style={cardStyle}>
					<Text style={{ fontSize:16, fontWeight:'600', marginBottom:8, color: colors.text }}>Editar horário</Text>
					<ScheduleForm
						key={formKey + 'edit'}
						disciplines={disciplines}
						initial={editing}
						onSubmit={async (data) => {
							await updateSchedule(editing.id, data);
							setEditing(null);
						}}
						onCancel={() => setEditing(null)}
					/>
				</View>
			)}

			<FlatList
				data={schedule.sort((a, b) => a.weekday - b.weekday || a.start.localeCompare(b.start))}
				keyExtractor={i => i.id}
				style={{ backgroundColor: colors.background }}
				contentContainerStyle={{ gap:10, paddingBottom:20, backgroundColor: colors.background }}
				renderItem={({ item }) => (
					<View style={row}>
						<View style={{ flex:1 }}>
							<Text style={{ fontSize:16, fontWeight:'600', color: colors.text }}>{weekdays[item.weekday]} {item.start}-{item.end}</Text>
							<Text style={{ color: colors.primary, fontWeight:'500' }}>{disciplines.find(d => d.id === item.disciplineId)?.name}</Text>
							{!!item.location && <Text style={{ color: colors.textMuted }}>{item.location}</Text>}
						</View>
						<View style={{ flexDirection:'row', gap:8 }}>
							<Pressable onPress={() => setEditing(item)} style={chip}><Text style={{ color: colors.text }}>Editar</Text></Pressable>
							<Pressable onPress={() => removeSchedule(item.id)} style={chipDanger}>
								<Text style={{ color:'#fff' }}>Excluir</Text>
							</Pressable>
						</View>
					</View>
				)}
			/>
		</View>
	);
}
