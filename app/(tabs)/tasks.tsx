import React, { useState, useMemo } from 'react';
import { View, Text, Pressable, FlatList } from 'react-native';
import { useApp } from '@/context/AppContext';
import TaskForm from '@/components/TaskForm';
import { Task } from '@/types';

const typeLabels = {
	prova: 'Prova',
	trabalho: 'Trabalho',
	projeto: 'Projeto'
};

export default function TasksScreen() {
	const { disciplines, tasks, addTask, updateTask, removeTask } = useApp();
	const [creating, setCreating] = useState(false);
	const [editing, setEditing] = useState<Task | null>(null);
	const sortedTasks = useMemo(() =>
		[...tasks].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
	, [tasks]);

	return (
		<View style={{ flex:1, padding:16, gap:16 }}>
			<View style={{ flexDirection:'row', justifyContent:'space-between', alignItems:'center' }}>
				<Text style={{ fontSize:22, fontWeight:'700' }}>Avaliações & Trabalhos</Text>
				<Pressable onPress={() => { setCreating(true); setEditing(null); }} style={btn}>
					<Text style={{ color:'#fff', fontWeight:'600' }}>Novo</Text>
				</Pressable>
			</View>

			{creating && (
				<View style={card}>
					<Text style={title}>Adicionar tarefa</Text>
					<TaskForm
						disciplines={disciplines}
						onSubmit={async (data) => {
							await addTask(data);
							setCreating(false);
						}}
						onCancel={() => setCreating(false)}
					/>
				</View>
			)}

			{editing && (
				<View style={card}>
					<Text style={title}>Editar tarefa</Text>
					<TaskForm
						disciplines={disciplines}
						initial={editing}
						onSubmit={async (data) => {
							await updateTask(editing.id, data);
							setEditing(null);
						}}
						onCancel={() => setEditing(null)}
					/>
				</View>
			)}

			<FlatList
				data={sortedTasks}
				keyExtractor={i => i.id}
				contentContainerStyle={{ gap:10, paddingBottom:20 }}
				renderItem={({ item }) => (
					<View style={row}>
						<View style={{ flex:1 }}>
							<Text style={{ fontSize:16, fontWeight:'600' }}>{typeLabels[item.type]} – {item.title}</Text>
							<Text style={{ color:'#1e40af', fontWeight:'500' }}>{disciplines.find(d => d.id === item.disciplineId)?.name}</Text>
							<Text>{new Date(item.dueDate).toLocaleString()}</Text>
							{!!item.notes && <Text style={{ color:'#555' }}>{item.notes}</Text>}
						</View>
						<View style={{ flexDirection:'row', gap:8 }}>
							<Pressable onPress={() => setEditing(item)} style={chip}><Text>Editar</Text></Pressable>
							<Pressable onPress={() => removeTask(item.id)} style={chipDanger}>
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
