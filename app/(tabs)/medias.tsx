// medias.tsx
import React, { useMemo, useState, useCallback } from 'react';
import { View, Text, Pressable, FlatList, LayoutChangeEvent } from 'react-native';
import { useApp } from '@/context/AppContext';
import { computeDisciplineAverageFromTasks } from '@/lib/averages';
import { Ionicons } from '@expo/vector-icons';
import { Svg, Rect, G, Text as SvgText, Line } from 'react-native-svg';
import { useAppTheme } from '@/hooks/useAppTheme';

function BarChart({
    data,
    maxY,
    height = 220,
    barColor,
    axisColor,
    labelColor,
}: {
    data: { label: string; value: number }[];
    maxY: number;
    height?: number;
    barColor: string;
    axisColor: string;
    labelColor: string;
}) {
    const [width, setWidth] = useState(0);
    const onLayout = useCallback((e: LayoutChangeEvent) => {
        setWidth(e.nativeEvent.layout.width);
    }, []);

    const pad = { top: 12, right: 12, bottom: 36, left: 12 };
    const innerW = Math.max(0, width - pad.left - pad.right);
    const innerH = Math.max(0, height - pad.top - pad.bottom);

    const barW = data.length > 0 ? innerW / data.length * 0.6 : 0;
    const stepX = data.length > 0 ? innerW / data.length : 0;

    return (
        <View style={{ width: '100%', height }} onLayout={onLayout}>
            {width > 0 && (
                <Svg width={width} height={height}>
                    <G>
                        <Line
                            x1={pad.left}
                            y1={pad.top}
                            x2={pad.left}
                            y2={pad.top + innerH}
                            stroke={axisColor}
                            strokeWidth={1}
                        />
                        <Line
                            x1={pad.left}
                            y1={pad.top + innerH}
                            x2={pad.left + innerW}
                            y2={pad.top + innerH}
                            stroke={axisColor}
                            strokeWidth={1}
                        />
                    </G>

                    {[0.25, 0.5, 0.75].map((p, i) => {
                        const y = pad.top + innerH * (1 - p);
                        return (
                            <Line
                                key={i}
                                x1={pad.left}
                                y1={y}
                                x2={pad.left + innerW}
                                y2={y}
                                stroke={axisColor}
                                strokeDasharray="4 6"
                                strokeWidth={1}
                            />
                        );
                    })}

                    <G>
                        {data.map((d, i) => {
                            const v = Math.max(0, Math.min(d.value, maxY));
                            const h = maxY > 0 ? innerH * (v / maxY) : 0;
                            const x = pad.left + i * stepX + (stepX - barW) / 2;
                            const y = pad.top + innerH - h;
                            return (
                                <G key={i}>
                                    <Rect x={x} y={y} width={barW} height={h} rx={4} fill={barColor} />
                                    <SvgText
                                        x={x + barW / 2}
                                        y={y - 4}
                                        fontSize="10"
                                        fill={labelColor}
                                        textAnchor="middle"
                                    >
                                        {Number(d.value.toFixed(2))}
                                    </SvgText>
                                    <SvgText
                                        x={x + barW / 2}
                                        y={pad.top + innerH + 14}
                                        fontSize="10"
                                        fill={labelColor}
                                        textAnchor="middle"
                                    >
                                        {d.label}
                                    </SvgText>
                                </G>
                            );
                        })}
                    </G>
                </Svg>
            )}
        </View>
    );
}

export default function MediasScreen() {
    const { disciplines, tasks } = useApp();
    const { colors } = useAppTheme();
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});

    const rows = useMemo(() => {
        return disciplines.map(d => {
            const tasksOf = tasks.filter(t => t.disciplineId === d.id);
            const calc = computeDisciplineAverageFromTasks(d, tasksOf);
            const min = d.grading?.approvalThreshold ?? 6;
            return {
                id: d.id,
                name: d.name,
                media: calc.media,
                minRequired: min,
                scaleMax: d.grading?.scaleMax ?? 10,
                porComponente: calc.porComponente,
            };
        });
    }, [disciplines, tasks]);

    const chartData = useMemo(() => {
        return rows.map((r) => ({
            label: r.name.length > 10 ? r.name.slice(0, 10) + '…' : r.name,
            value: r.media ?? 0,
            max: r.scaleMax,
        }));
    }, [rows]);

    const maxY = useMemo(() => {
        return Math.max( ...(rows.map(r => r.scaleMax || 10)), 10 );
    }, [rows]);

    return (
        <View style={{ flex: 1, padding: 16, gap: 16, backgroundColor: colors.background }}>
            <Text style={{ fontSize: 22, fontWeight: '700', color: colors.text }}>Médias</Text>

            <View style={{ backgroundColor: colors.surface, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: colors.border }}>
                <Text style={{ fontWeight: '600', marginBottom: 8, color: colors.text }}>Panorama das médias</Text>
                {chartData.length === 0 ? (
                    <Text style={{ color: colors.textMuted }}>Cadastre disciplinas para visualizar.</Text>
                ) : (
                    <BarChart
                        data={chartData.map(d => ({ label: d.label, value: d.value }))}
                        maxY={maxY}
                        barColor={colors.primary}
                        axisColor={colors.border}
                        labelColor={colors.textMuted}
                    />
                )}
            </View>

            <FlatList
                data={rows}
                keyExtractor={i => i.id}
                contentContainerStyle={{ gap: 10, paddingBottom: 20 }}
                renderItem={({ item }) => {
                    const isOpen = !!expanded[item.id];
                    const hasMedia = item.media != null;
                    const badgeColor =
                        !hasMedia ? colors.textMuted : (item.media! >= item.minRequired ? colors.primary : '#b91c1c');

                    return (
                        <View style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 12, gap: 8 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text }}>{item.name}</Text>
                                <View style={{ marginLeft: 'auto', flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                    <View style={{ backgroundColor: badgeColor, paddingVertical: 4, paddingHorizontal: 8, borderRadius: 999 }}>
                                        <Text style={{ color: colors.onPrimary && badgeColor !== colors.textMuted ? colors.onPrimary : colors.text, fontWeight: '700' }}>
                                            {hasMedia ? `${item.media}/${item.scaleMax}` : '—'}
                                        </Text>
                                    </View>
                                    <Pressable onPress={() => setExpanded(prev => ({ ...prev, [item.id]: !isOpen }))}>
                                        <Ionicons name={isOpen ? 'chevron-up' : 'chevron-down'} size={20} color={colors.textMuted} />
                                    </Pressable>
                                </View>
                            </View>

                            <Text style={{ color: colors.textMuted }}>
                                Mínimo para aprovação: {item.minRequired} / {item.scaleMax}
                            </Text>

                            {isOpen && (
                                <View style={{ marginTop: 8, gap: 8 }}>
                                    <Text style={{ fontWeight: '600', color: colors.text }}>Detalhe por componente</Text>
                                    {item.porComponente.length === 0 ? (
                                        <Text style={{ color: colors.textMuted }}>Nenhum componente definido para a disciplina.</Text>
                                    ) : (
                                        item.porComponente.map(pc => (
                                            <View
                                                key={pc.componentId}
                                                style={{
                                                    borderWidth: 1,
                                                    borderColor: colors.border,
                                                    borderRadius: 10,
                                                    padding: 10,
                                                    gap: 6
                                                }}
                                            >
                                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                    <Text style={{ fontWeight: '600', color: colors.text }}>
                                                        {pc.label} ({pc.weight}%)
                                                    </Text>
                                                    <Text style={{ marginLeft: 'auto', color: colors.text, fontWeight: '700' }}>
                                                        {pc.media != null ? `${pc.media}/${item.scaleMax}` : '—'}
                                                    </Text>
                                                </View>

                                                <View style={{ height: 8, backgroundColor: colors.border, borderRadius: 999, overflow: 'hidden' }}>
                                                    <View
                                                        style={{
                                                            height: 8,
                                                            width: `${pc.media != null ? (pc.media / item.scaleMax) * 100 : 0}%`,
                                                            backgroundColor: colors.primary
                                                        }}
                                                    />
                                                </View>
                                            </View>
                                        ))
                                    )}
                                </View>
                            )}
                        </View>
                    );
                }}
            />
        </View>
    );
}
