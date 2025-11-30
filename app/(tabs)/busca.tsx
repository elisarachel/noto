import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, FlatList, Pressable } from 'react-native';
import { useApp } from '@/context/AppContext';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useRouter } from 'expo-router';

type Result =
	| { kind: 'disc'; id: string; title: string; subtitle?: string }
	| { kind: 'task'; id: string; title: string; subtitle?: string }
	| { kind: 'note'; id: string; title: string; subtitle?: string };

export default function SearchScreen() {
	const { disciplines, tasks, notes } = useApp();
	const [q, setQ] = useState('');
	const { colors } = useAppTheme();
	const router = useRouter();

	const results = useMemo<Result[]>(() => {
		const term = q.trim().toLowerCase();
		if (!term) return [];
		const out: Result[] = [];

		for (const d of disciplines) {
			if (
				d.name.toLowerCase().includes(term) ||
				d.professor?.toLowerCase().includes(term)
			) {
				out.push({
					kind: 'disc',
					id: d.id,
					title: d.name,
					subtitle: d.professor
				});
			}
		}

		for (const t of tasks) {
			const disc = disciplines.find(d => d.id === t.disciplineId)?.name;
			const text = `${t.title} ${t.notes ?? ''}`.toLowerCase();
			if (text.includes(term)) {
				out.push({
					kind: 'task',
					id: t.id,
					title: t.title,
					subtitle: `${disc ?? '—'} • ${new Date(t.dueDate).toLocaleString()}`
				});
			}
		}

		for (const n of notes) {
			const disc = disciplines.find(d => d.id === n.disciplineId)?.name;
			const text = `${n.title ?? ''} ${n.content ?? ''}`.toLowerCase();
			if (text.includes(term)) {
				out.push({
					kind: 'note',
					id: n.id,
					title: n.title ?? '(sem título)',
					subtitle: disc
				});
			}
		}
		return out;
	}, [q, disciplines, tasks, notes]);

	function handlePress(item: Result) {
		if (item.kind === 'disc') {
			// vai para a aba de Disciplinas
			router.push('/(tabs)/disciplinas');
		} else if (item.kind === 'task') {
			// vai para a aba de Avaliações & Trabalhos
			// (ajusta o pathname se o arquivo da aba tiver outro nome)
			router.push('/(tabs)/tasks');
		} else if (item.kind === 'note') {
			// abre a nota específica
			router.push({
				pathname: '/notes/[id]',
				params: { id: item.id }
			});
		}
	}

	return (
		<View
			style={{
				flex: 1,
				padding: 16,
				gap: 12,
				backgroundColor: colors.background
			}}
		>
			<Text
				style={{
					fontSize: 22,
					fontWeight: '700',
					color: colors.text
				}}
			>
				Buscar
			</Text>

			<TextInput
				value={q}
				onChangeText={setQ}
				placeholder="Disciplina, tarefa, anotação..."
				placeholderTextColor={colors.textMuted}
				style={{
					borderWidth: 1,
					borderColor: colors.border,
					borderRadius: 10,
					padding: 12,
					backgroundColor: colors.cardBg,
					color: colors.text
				}}
			/>

			<FlatList
				data={results}
				keyExtractor={(i) => `${i.kind}:${i.id}`}
				contentContainerStyle={{ paddingTop: 8, paddingBottom: 20 }}
				renderItem={({ item }) => (
					<Pressable
						onPress={() => handlePress(item)}
						style={{
							padding: 12,
							backgroundColor: colors.surface,
							borderRadius: 10,
							borderWidth: 1,
							borderColor: colors.border,
							marginBottom: 8
						}}
					>
						<Text
							style={{
								fontWeight: '600',
								color: colors.text
							}}
						>
							{item.kind === 'disc'
								? '📚 '
								: item.kind === 'task'
								? '🗓️ '
								: '📝 '}
							{item.title}
						</Text>
						{!!item.subtitle && (
							<Text style={{ color: colors.textMuted }}>
								{item.subtitle}
							</Text>
						)}
					</Pressable>
				)}
			/>
		</View>
	);
}
