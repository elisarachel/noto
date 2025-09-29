import React, { useState } from 'react';
import { ClassSchedule } from '@/types';
import { View, Text, FlatList, Pressable } from 'react-native';
import ScheduleForm from '@/components/ScheduleForm';
import { useApp } from '@/context/AppContext';

const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export default function ScheduleScreen() {
	const { disciplines, schedule, addSchedule, updateSchedule, removeSchedule } = useApp();
	const [formKey, setFormKey] = useState(0); // para resetar o form após submit
	const [creating, setCreating] = useState(false);
	const [editing, setEditing] = useState<ClassSchedule | null>(null);

	return (
		<View style={{ flex: 1, padding: 16, gap: 16 }}>
			<View style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'center' }}>
				<Text style={{ fontSize: 22, fontWeight: '700' }}>Horários de Aula</Text>
				<Pressable onPress={() => setCreating(true)} style={{ backgroundColor:'#1e40af', paddingVertical:10, paddingHorizontal:14, borderRadius:10 }}>
					<Text style={{ color:'#fff', fontWeight:'600' }}>Novo</Text>
				</Pressable>
			</View>

			{creating && (
				<View style={{ backgroundColor:'#f3f4f6', padding:16, borderRadius:12, marginVertical:12 }}>
					<Text style={{ fontSize:16, fontWeight:'600', marginBottom:8 }}>Adicionar horário</Text>
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
				<View style={{ backgroundColor:'#f3f4f6', padding:16, borderRadius:12, marginVertical:12 }}>
					<Text style={{ fontSize:16, fontWeight:'600', marginBottom:8 }}>Editar horário</Text>
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
				contentContainerStyle={{ gap:10, paddingBottom:20 }}
				renderItem={({ item }) => (
					<View style={row}>
						<View style={{ flex:1 }}>
							<Text style={{ fontSize:16, fontWeight:'600' }}>{weekdays[item.weekday]} {item.start}-{item.end}</Text>
							<Text style={{ color:'#1e40af', fontWeight:'500' }}>{disciplines.find(d => d.id === item.disciplineId)?.name}</Text>
							{!!item.location && <Text style={{ color:'#555' }}>{item.location}</Text>}
						</View>
						<View style={{ flexDirection:'row', gap:8 }}>
							<Pressable onPress={() => setEditing(item)} style={chip}><Text>Editar</Text></Pressable>
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

const row = { backgroundColor:'#fff', borderWidth:1, borderColor:'#e5e7eb', padding:14, borderRadius:10, flexDirection:'row', alignItems:'center', gap:12 } as const;
const chip = { backgroundColor:'#e5e7eb', paddingVertical:8, paddingHorizontal:10, borderRadius:10 } as const;
const chipDanger = { backgroundColor:'#b91c1c', paddingVertical:8, paddingHorizontal:10, borderRadius:10 } as const;
