import React, { useMemo, useState } from 'react';
import { View, Text } from 'react-native';
import { Calendar, DateObject } from 'react-native-calendars';
import dayjs from 'dayjs';
import { Task } from '@/types';
import { useAppTheme } from '@/hooks/useAppTheme';

type Props = {
  tasks: Task[];
  // opcional: cores por tipo
  colors?: { prova: string; trabalho: string; projeto: string };
};

const DEFAULT_COLORS = {
  prova: '#ef4444',     // vermelho
  trabalho: '#10b981',  // verde
  projeto: '#3b82f6'    // azul
};

export default function CalendarCard({ tasks, colors: propColors }: Props) {
  const { colors: theme } = useAppTheme();

  const today = dayjs().format('YYYY-MM-DD');
  const [selected, setSelected] = useState<string>(today);

  // mantém as 3 cores distintas por tipo, prop pode sobrescrever
  const typeColors = { ...DEFAULT_COLORS, ...(propColors ?? {}) };

  // gera os pontinhos por dia
  const markedDates = useMemo(() => {
    const map: Record<string, { dots: { key:string; color:string }[]; selected?: boolean; selectedColor?: string; }> = {};

    for (const t of tasks) {
      const d = dayjs(t.dueDate).format('YYYY-MM-DD');
      if (!map[d]) map[d] = { dots: [] };
      const key = `dot-${t.type}`;
      const color = typeColors[t.type as keyof typeof typeColors] ?? theme.textMuted;
      // evita duplicar dot do mesmo tipo no mesmo dia
      if (!map[d].dots.find(dot => dot.key === key)) {
        map[d].dots.push({ key, color });
      }
    }

    // selecionado + hoje com borda especial
    if (!map[selected]) map[selected] = { dots: [] };
    map[selected].selected = true;
    map[selected].selectedColor = theme.mutedBg; // fundo suave para o dia selecionado

    // realce “hoje” com um dot cinza claro adicional se não tiver tarefa
    if (!map[today]) map[today] = { dots: [] };
    if (!map[today].dots.length) {
      map[today].dots.push({ key: 'today', color: theme.textMuted });
    }

    return map;
  }, [tasks, selected, typeColors, theme]);

  // tarefas do dia selecionado
  const tasksOfSelected = useMemo(
    () => tasks
      .filter(t => dayjs(t.dueDate).format('YYYY-MM-DD') === selected)
      .sort((a,b) => dayjs(a.dueDate).valueOf() - dayjs(b.dueDate).valueOf()),
    [tasks, selected]
  );

  const renderLegend = () => (
    <View style={{ flexDirection:'row', gap:16, marginTop:8 }}>
      {(['prova','trabalho','projeto'] as const).map(type => (
        <View key={type} style={{ flexDirection:'row', alignItems:'center', gap:6 }}>
          <View style={{ width:8, height:8, borderRadius:999, backgroundColor: typeColors[type] }} />
          <Text style={{ color: theme.textMuted, fontSize:12 }}>{type}</Text>
        </View>
      ))}
      <View style={{ flexDirection:'row', alignItems:'center', gap:6 }}>
        <View style={{ width:8, height:8, borderRadius:999, backgroundColor: theme.textMuted }} />
        <Text style={{ color: theme.textMuted, fontSize:12 }}>hoje</Text>
      </View>
    </View>
  );

  return (
    <View>
      <Calendar
        markingType="multi-dot"
        markedDates={markedDates}
        onDayPress={(day: DateObject) => setSelected(day.dateString)}
        theme={{
          calendarBackground: theme.surface,
          todayTextColor: theme.text,
          arrowColor: theme.primary,
          textDayFontWeight: '500',
          textMonthFontWeight: '700',
          textDayHeaderFontWeight: '600',
          selectedDayBackgroundColor: theme.mutedBg,
          monthTextColor: theme.text,
          dayTextColor: theme.text,
          textDisabledColor: theme.textMuted,
          textSectionTitleColor: theme.textMuted,
        }}
      />

      {renderLegend()}

      {/* lista curta das tarefas do dia selecionado */}
      <View style={{ marginTop:10, gap:6 }}>
        {tasksOfSelected.length === 0 ? (
          <Text style={{ color: theme.textMuted }}>Sem tarefas em {dayjs(selected).format('DD/MM/YYYY')}.</Text>
        ) : (
          tasksOfSelected.map(t => (
            <View
              key={t.id}
              style={{
                backgroundColor: theme.cardBg,
                borderWidth:1, borderColor: theme.border,
                padding:8, borderRadius:8
              }}
            >
              <Text style={{ fontWeight:'600', color: theme.text }}>{t.title}</Text>
              <Text style={{ color: typeColors[t.type as keyof typeof typeColors], fontSize:12 }}>
                {t.type.toUpperCase()} • {dayjs(t.dueDate).format('DD/MM/YYYY HH:mm')}
              </Text>
              {!!t.notes && <Text style={{ color: theme.textMuted, fontSize:12 }}>{t.notes}</Text>}
            </View>
          ))
        )}
      </View>
    </View>
  );
}
