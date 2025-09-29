import React, { useMemo } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useApp } from '@/context/AppContext';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function Dashboard() {
	const { profile, disciplines, notes, tasks, schedule } = useApp();

	const greeting = useMemo(() => {
		const h = new Date().getHours();
		if (h < 12) return 'Bom dia';
		if (h < 18) return 'Boa tarde';
		return 'Boa noite';
	}, []);

	// Próximas tasks (até 3)
	const upcomingTasks = useMemo(() =>
		[...tasks]
			.filter(t => new Date(t.dueDate) > new Date())
			.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
			.slice(0, 3)
	, [tasks]);

	// Próximo horário
	const nextSchedule = useMemo(() => {
		const now = new Date();
		return schedule
			.map(s => ({
				...s,
				date: getNextWeekdayDate(s.weekday, s.start)
			}))
			.filter(s => s.date > now)
			.sort((a, b) => a.date.getTime() - b.date.getTime())[0];
	}, [schedule]);

	function getNextWeekdayDate(weekday: number, time: string) {
		const [h, m] = time.split(":").map(Number);
		const now = new Date();
		const result = new Date(now);
		result.setHours(h, m, 0, 0);
		const dayDiff = (weekday - now.getDay() + 7) % 7;
		if (dayDiff === 0 && result <= now) result.setDate(result.getDate() + 7);
		else result.setDate(result.getDate() + dayDiff);
		return result;
	}

	return (
		<View style={{ flex:1, padding:16, gap:16 }}>
			<Text style={{ fontSize:24, fontWeight:'700', marginBottom:4 }}>
				{greeting}, {profile?.name?.split(' ')[0]}!
			</Text>
			<Text style={{ color:'#6b7280', marginBottom:8 }}>
				Aqui está um resumo do seu semestre 📚
			</Text>

			{/* Resumo rápido */}
			<View style={{ flexDirection:'row', gap:12 }}>
				<SummaryCard
					icon="book-outline"
					title="Disciplinas"
					value={disciplines.length.toString()}
					color="#4f46e5"
				/>
				<SummaryCard
					icon="document-text-outline"
					title="Anotações"
					value={notes.length.toString()}
					color="#d97706"
				/>
			</View>

			{/* Próximas tarefas */}
			<Card title="Próximas tarefas" icon="calendar-outline">
				{upcomingTasks.length === 0 ? (
					<Text style={{ color:'#6b7280' }}>Nenhuma tarefa por vir</Text>
				) : (
					upcomingTasks.map(t => (
						<View key={t.id} style={taskBox}>
							<Text style={{ color:'#1e3a8a', fontWeight:'600' }}>{t.title}</Text>
							<Text style={{ color:'#2563eb', fontSize:13 }}>
								{new Date(t.dueDate).toLocaleString()}
							</Text>
						</View>
					))
				)}
			</Card>

			{/* Próximo horário */}
			<Card title="Próxima aula" icon="time-outline">
				{nextSchedule ? (
					<View style={taskBox}>
						<Text style={{ color:'#1e40af', fontWeight:'600' }}>
							{disciplines.find(d => d.id === nextSchedule.disciplineId)?.name || "Disciplina"}
						</Text>
						<Text style={{ color:'#6366f1', fontSize:13 }}>
							{nextSchedule.start} – {nextSchedule.location || "local não informado"}
						</Text>
						<Text style={{ color:'#6b7280', fontSize:12 }}>
							{nextSchedule.date.toLocaleString()}
						</Text>
					</View>
				) : (
					<Text style={{ color:'#6b7280' }}>Nenhum horário futuro</Text>
				)}
			</Card>

			{/* Navegação rápida */}
			<View style={{ flexDirection:'row', gap:10, marginTop:8 }}>
				<Link asChild href="/profile">
					<Pressable style={btnSecondary}>
						<Ionicons name="person-circle-outline" size={20} color="#374151" />
						<Text style={{ marginLeft:6 }}>Perfil</Text>
					</Pressable>
				</Link>
				<Link asChild href="/(tabs)/disciplinas">
					<Pressable style={btn}>
						<Ionicons name="book-outline" size={20} color="#fff" />
						<Text style={[btnText, { marginLeft:6 }]}>Disciplinas</Text>
					</Pressable>
				</Link>
				<Link asChild href="/(tabs)/notas">
					<Pressable style={btn}>
						<Ionicons name="pencil-outline" size={20} color="#fff" />
						<Text style={[btnText, { marginLeft:6 }]}>Anotações</Text>
					</Pressable>
				</Link>
			</View>
		</View>
	);
}

function SummaryCard({ icon, title, value, color }: { icon: any, title: string, value: string, color: string }) {
	return (
		<View style={{
			flex:1, backgroundColor:'#f9fafb', borderRadius:12, padding:14, alignItems:'center', elevation:2
		}}>
			<Ionicons name={icon} size={28} color={color} />
			<Text style={{ fontSize:20, fontWeight:'700', marginTop:6, color }}>{value}</Text>
			<Text style={{ color:'#6b7280' }}>{title}</Text>
		</View>
	);
}

function Card({ title, icon, children }: { title:string, icon:any, children:React.ReactNode }) {
	return (
		<View style={{
			backgroundColor:'#fff', borderRadius:12, padding:14, gap:6,
			shadowColor:'#000', shadowOpacity:0.05, shadowRadius:4, elevation:2
		}}>
			<View style={{ flexDirection:'row', alignItems:'center', marginBottom:4 }}>
				<Ionicons name={icon} size={20} color="#374151" style={{ marginRight:6 }} />
				<Text style={{ fontSize:16, fontWeight:'600' }}>{title}</Text>
			</View>
			{children}
		</View>
	);
}

const taskBox = {
	backgroundColor:'#eef2ff',
	padding:8,
	borderRadius:8,
	marginBottom:6
};

const btn = {
	flexDirection: "row" as "row",
	alignItems:'center' as const,
	backgroundColor:'#1e40af',
	paddingVertical:10,
	paddingHorizontal:14,
	borderRadius:10
};
const btnText = { color:'#fff' };
const btnSecondary = {
	flexDirection: "row" as "row",
	alignItems:'center' as const,
	backgroundColor:'#e5e7eb',
	paddingVertical:10,
	paddingHorizontal:14,
	borderRadius:10
};
