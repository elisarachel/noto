import React, { useMemo, useRef, useState } from 'react';
import { View, Text, ScrollView, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { Discipline, ClassSchedule } from '@/types';
import { useAppTheme } from '@/hooks/useAppTheme';

type Props = {
	schedule: ClassSchedule[];
	disciplines: Discipline[];
	minMinute?: number;
	maxMinute?: number;
};

const DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const PX_PER_MIN = 1;   // 60min = 60px (ajuste para 0.8 se quiser mais compacto)
const TOP_PAD = 12;
const BOTTOM_PAD = 12;
const GUTTER_WIDTH = 40; // largura menor do gutter (horas) — ajustável
const DAY_COL_WIDTH = 128; // largura coluna dia (ajustável)

function normalizeWeekday(w: number) {
	if (w >= 1 && w <= 7) return w % 7; // 7 -> 0 (Dom)
	return Math.max(0, Math.min(6, w));
}

function toMinutes(hhmm: string) {
	const [h, m] = hhmm.split(':').map(Number);
	return (h || 0) * 60 + (m || 0);
}

type Enriched = ClassSchedule & {
	weekdayNorm: number;
	startMin: number;
	endMin: number;
};

export default function WeekScheduleGrid({
	schedule,
	disciplines,
	minMinute,
	maxMinute,
}: Props) {
	const { colors } = useAppTheme();

	// enrich
	const items = useMemo<Enriched[]>(() => {
		return schedule.map((s) => {
			const startMin = toMinutes(s.start);
			const endMinRaw = toMinutes(s.end ?? s.start);
			return {
				...(s as ClassSchedule),
				weekdayNorm: normalizeWeekday(s.weekday),
				startMin,
				endMin: Math.max(startMin + 30, endMinRaw),
			};
		});
	}, [schedule]);

	// range
	const computedRange = useMemo(() => {
		if (typeof minMinute === 'number' && typeof maxMinute === 'number') {
			return { minMinute, maxMinute };
		}
		if (items.length === 0) return { minMinute: 7 * 60, maxMinute: 22 * 60 };
		const minS = Math.min(...items.map((i) => i.startMin));
		const maxE = Math.max(...items.map((i) => i.endMin));
		const floor = Math.floor(minS / 60) * 60;
		const ceil = Math.ceil(maxE / 60) * 60;
		return {
			minMinute: Math.min(floor, 7 * 60),
			maxMinute: Math.max(ceil, 22 * 60),
		};
	}, [items, minMinute, maxMinute]);

	const totalMinutes = computedRange.maxMinute - computedRange.minMinute;
	const trackHeight = Math.max(300, totalMinutes * PX_PER_MIN) + TOP_PAD + BOTTOM_PAD;

	// group by day
	const byDay = useMemo(() => {
		const map: Record<number, Enriched[]> = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };
		for (const it of items) map[it.weekdayNorm].push(it);
		Object.values(map).forEach((arr) => arr.sort((a, b) => a.startMin - b.startMin));
		return map;
	}, [items]);

	// hour lines (em coordenadas já com TOP_PAD)
	const hourLines: { top: number; label: string }[] = [];
	for (let m = computedRange.minMinute; m <= computedRange.maxMinute; m += 60) {
		const top = TOP_PAD + (m - computedRange.minMinute) * PX_PER_MIN;
		const label = `${String(Math.floor(m / 60)).padStart(2, '0')}:00`;
		hourLines.push({ top, label });
	}

	// ==== SYNC SCROLL: gutter (esquerda) <-> grid (direita) ====
	const gutterRef = useRef<ScrollView>(null);
	const gridRef = useRef<ScrollView>(null);
	const [syncing, setSyncing] = useState<'none' | 'gutter' | 'grid'>('none');

	const onGridScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
		if (syncing === 'gutter') return; // evita loop
		setSyncing('grid');
		const y = e.nativeEvent.contentOffset.y;
		gutterRef.current?.scrollTo({ y, animated: false });
		setSyncing('none');
	};

	const onGutterScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
		if (syncing === 'grid') return; // evita loop
		setSyncing('gutter');
		const y = e.nativeEvent.contentOffset.y;
		gridRef.current?.scrollTo({ y, animated: false });
		setSyncing('none');
	};

	return (
		<View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
			{/* GUTTER VERTICAL (horas) — rola só na vertical, sincronizado */}
			<ScrollView
				ref={gutterRef}
				showsVerticalScrollIndicator={false}
				scrollEventThrottle={16}
				onScroll={onGutterScroll}
				style={{ maxHeight: 420 }}
				contentContainerStyle={{ paddingLeft: 0 }}
			>
				{/* largura fixa do gutter */}
				<View style={{ width: GUTTER_WIDTH }}>
					<View style={{ height: trackHeight, position: 'relative' }}>
						{hourLines.map((h) => (
							<View key={h.top} style={{ position: 'absolute', top: h.top - 8, left: 0, width: GUTTER_WIDTH }}>
								<Text
									style={{
										color: colors.textMuted,
										fontSize: 12,
										textAlign: 'right',
										paddingRight: 6,
									}}
								>
									{h.label}
								</Text>
							</View>
						))}
					</View>
				</View>
			</ScrollView>

			{/* GRADE: Scroll vertical (sync) + Scroll horizontal (dias) */}
			<ScrollView
				ref={gridRef}
				showsVerticalScrollIndicator={false}
				scrollEventThrottle={16}
				onScroll={onGridScroll}
				style={{ maxHeight: 420, flex: 1 }}
			>
				<ScrollView
					horizontal
					showsHorizontalScrollIndicator={false}
					contentContainerStyle={{ paddingLeft: 0 }}
				>
					<View style={{ flexDirection: 'row' }}>
						{DAYS.map((dayLabel, dayIdx) => (
							<View key={dayIdx} style={{ width: DAY_COL_WIDTH, marginRight: 6 }}>
								{/* Cabeçalho do dia */}
								<Text style={{ textAlign: 'center', fontWeight: '700', marginBottom: 8, color: colors.text }}>{dayLabel}</Text>

								{/* Track */}
								<View
									style={{
										height: trackHeight,
										backgroundColor: colors.cardBg,
										borderRadius: 10,
										overflow: 'hidden',
									}}
								>
									<View style={{ position: 'relative', height: '100%' }}>
										{/* Linhas de grade por hora */}
										{hourLines.map((h) => (
											<View
												key={h.top}
												style={{
													position: 'absolute',
													top: h.top,
													left: 0,
													right: 0,
													height: 1,
													backgroundColor: colors.border,
												}}
											/>
										))}

										{/* Blocos de aula */}
										{byDay[dayIdx].map((block) => {
											const top = TOP_PAD + (block.startMin - computedRange.minMinute) * PX_PER_MIN;
											const height = (block.endMin - block.startMin) * PX_PER_MIN;
											const disc = disciplines.find((d) => d.id === block.disciplineId);
											return (
												<View
													key={block.id}
													style={{
														position: 'absolute',
														left: 2,
														right: 2,
														top,
														height,
														backgroundColor: colors.mutedBg,
														borderLeftWidth: 2,
														borderLeftColor: colors.primary,
														borderRadius: 6,
														paddingVertical: 6,
														paddingHorizontal: 6,
														justifyContent: 'center',
													}}
												>
													<Text style={{ color: colors.primary, fontWeight: '700' }}>
														{disc?.name ?? 'Disciplina'}
													</Text>
													<Text style={{ color: colors.textMuted, fontSize: 12 }}>
														{block.start}–{block.end ?? block.start}
														{block.location ? ` • ${block.location}` : ''}
													</Text>
												</View>
											);
										})}
									</View>
								</View>
							</View>
						))}
					</View>
				</ScrollView>
			</ScrollView>
		</View>
	);
}
