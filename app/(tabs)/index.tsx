import React, { useMemo } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { useApp } from '@/context/AppContext';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import CalendarCard from '@/components/CalendarCard';
import { LocaleConfig } from 'react-native-calendars';
import WeekScheduleGrid from '@/components/WeekScheduleGrid';
import { useAppTheme } from '@/hooks/useAppTheme';

LocaleConfig.locales['pt-br'] = {
  monthNames: ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'],
  monthNamesShort: ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'],
  dayNames: ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'],
  dayNamesShort: ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'],
  today: 'Hoje'
};
LocaleConfig.defaultLocale = 'pt-br';

export default function Dashboard() {
	const { profile, disciplines, notes, tasks, schedule } = useApp();
	const { colors } = useAppTheme();

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

	function getWindowForPeriod(p?: 'matutino' | 'integral' | 'noturno') {
		switch (p) {
			case 'matutino': return { minMinute: 6 * 60, maxMinute: 13 * 60 };   // 06:00–13:00
			case 'noturno':  return { minMinute: 18 * 60, maxMinute: 23 * 60 };  // 18:00–23:00
			case 'integral':
			default:         return { minMinute: 7 * 60, maxMinute: 22 * 60 };  // 07:00–22:00
		}
	}

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
	
	const { minMinute, maxMinute } = getWindowForPeriod(profile?.studyPeriod);

	// estilos que dependem do tema (antes estavam no topo do arquivo)
	const taskBox = {
		backgroundColor: colors.mutedBg,
		padding: 8,
		borderRadius: 8,
		marginBottom: 6
	};
	const btn = {
		flexDirection: "row" as "row",
		alignItems:'center' as const,
		backgroundColor: colors.primary,
		paddingVertical:10,
		paddingHorizontal:14,
		borderRadius:10
	};
	const btnText = { color: colors.onPrimary };
	const btnSecondary = {
		flexDirection: "row" as "row",
		alignItems:'center' as const,
		backgroundColor: colors.border,
		paddingVertical:10,
		paddingHorizontal:14,
		borderRadius:10
	};

	// Componentes internos que usam o tema
	function SummaryCard({ icon, title, value, color }: { icon: any, title: string, value: string, color: string }) {
		return (
			<View style={{
				flex:1, backgroundColor: colors.cardBg, borderRadius:12, padding:14, alignItems:'center', elevation:2
			}}>
				<Ionicons name={icon} size={28} color={color} />
				<Text style={{ fontSize:20, fontWeight:'700', marginTop:6, color }}>{value}</Text>
				<Text style={{ color: colors.textMuted }}>{title}</Text>
			</View>
		);
	}

	function Card({ title, icon, children }: { title:string, icon:any, children:React.ReactNode }) {
		return (
			<View style={{
				backgroundColor: colors.surface, borderRadius:12, padding:14, gap:6,
				shadowColor:'#000', shadowOpacity:0.05, shadowRadius:4, elevation:2
			}}>
				<View style={{ flexDirection:'row', alignItems:'center', marginBottom:4 }}>
					<Ionicons name={icon} size={20} color={colors.text} style={{ marginRight:6 }} />
					<Text style={{ fontSize:16, fontWeight:'600', color: colors.text }}>{title}</Text>
				</View>
				{children}
			</View>
		);
	}

	return (
		<ScrollView style={{ flex:1, backgroundColor: colors.background }} contentContainerStyle={{ padding:16, gap:16 }}>
			<Text style={{ fontSize:24, fontWeight:'700', marginBottom:4, color: colors.text }}>
				{greeting}, {profile?.name?.split(' ')[0]}!
			</Text>
			<Text style={{ color: colors.textMuted, marginBottom:8 }}>
				Aqui está um resumo do seu semestre 📚
			</Text>

			{/* Resumo rápido */}
			<View style={{ flexDirection:'row', gap:12 }}>
				<SummaryCard
					icon="book-outline"
					title="Disciplinas"
					value={disciplines.length.toString()}
					color={colors.primary}
				/>
				<SummaryCard
					icon="document-text-outline"
					title="Anotações"
					value={notes.length.toString()}
					color={colors.accent}
				/>
			</View>

			{/* Próximas tarefas */}
			<Card title="Próximas tarefas" icon="calendar-outline">
				{upcomingTasks.length === 0 ? (
					<Text style={{ color: colors.textMuted }}>Nenhuma tarefa por vir</Text>
				) : (
					upcomingTasks.map(t => (
						<View key={t.id} style={taskBox}>
							<Text style={{ color: colors.primary, fontWeight:'600' }}>{t.title}</Text>
							<Text style={{ color: colors.primary, fontSize:13 }}>
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
						<Text style={{ color: colors.primary, fontWeight:'600' }}>
							{disciplines.find(d => d.id === nextSchedule.disciplineId)?.name || "Disciplina"}
						</Text>
						<Text style={{ color: colors.primary, fontSize:13 }}>
							{nextSchedule.start} – {nextSchedule.location || "Local não informado"}
						</Text>
						<Text style={{ color: colors.textMuted, fontSize:12 }}>
					{(() => {
						const date = nextSchedule.date;
						const dayStr = date
							.toLocaleDateString('pt-BR', {
								weekday: 'long',
								day: '2-digit',
								month: '2-digit'
							})
							.replace(/^([a-z])/u, (m) => m.toUpperCase());
						const timeStr = date.toLocaleTimeString('pt-BR', {
							hour: '2-digit',
							minute: '2-digit'
						});
						return `${dayStr}, ${timeStr}`;
					})()}
				</Text>

					</View>
				) : (
					<Text style={{ color: colors.textMuted }}>Nenhum horário futuro</Text>
				)}
			</Card>

			<Card title="Calendário" icon="calendar-outline">
				<CalendarCard tasks={tasks} />
			</Card>


			<Card title="Semana (aulas)" icon="grid-outline">
				<WeekScheduleGrid
					schedule={schedule}
					disciplines={disciplines}
					minMinute={minMinute}
					maxMinute={maxMinute}
				/>
			</Card>
		</ScrollView>
	);
}
