import React, { useState } from 'react';
import { Text, TextInput, Pressable, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, ScrollView, View } from 'react-native';
import { Discipline } from '@/types';
import { useAppTheme } from '@/hooks/useAppTheme';

const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

type Props = {
    disciplines: Discipline[];
    initial?: {
        disciplineId?: string;
        weekday?: number;
        start?: string;
        end?: string;
        location?: string;
    };
    onSubmit: (data: { disciplineId: string; weekday: number; start: string; end: string; location?: string }) => void;
    onCancel?: () => void;
};

export default function ScheduleForm({ disciplines, initial, onSubmit, onCancel }: Props) {
    const [disciplineId, setDisciplineId] = useState(initial?.disciplineId ?? (disciplines[0]?.id ?? ''));
    const [weekday, setWeekday] = useState(initial?.weekday ?? 1);
    const [start, setStart] = useState(initial?.start ?? '');
    const [end, setEnd] = useState(initial?.end ?? '');
    const [location, setLocation] = useState(initial?.location ?? '');
    const { colors } = useAppTheme();

    // estilos dependentes do tema
    const input = { borderWidth: 1, borderColor: colors.border, padding: 10, borderRadius: 8, color: colors.text, backgroundColor: colors.cardBg } as const;
    const disciplineButton = (active?: boolean) => ({
        padding: 8,
        borderWidth: 1,
        borderColor: active ? colors.primary : colors.border,
        borderRadius: 6,
        marginBottom: 4,
        // ativo -> fundo primário para destaque, inativo -> superfície para contraste
        backgroundColor: active ? colors.primary : colors.surface
    });
    const dayButton = (active?: boolean) => ({
        padding: 8,
        borderRadius: 6,
        backgroundColor: active ? colors.primary : colors.border
    });
    const dayText = (active?: boolean) => ({ color: active ? colors.onPrimary : colors.text });
    const btn = { backgroundColor: colors.primary, padding: 12, borderRadius: 8, marginTop: 8, alignItems: 'center' as const } as const;
    const btnCancel = { backgroundColor: colors.border, padding: 12, borderRadius: 8, marginTop: 8, alignItems: 'center' as const } as const;

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{}}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ gap: 8 }}>
                    <Text style={{ color: colors.text }}>Disciplina</Text>
                    {disciplines.map(d => (
                        <Pressable
                            key={d.id}
                            onPress={() => setDisciplineId(d.id)}
                            style={disciplineButton(d.id === disciplineId)}
                        >
                            <Text style={{ color: d.id === disciplineId ? colors.onPrimary : colors.text }}>{d.name}</Text>
                        </Pressable>
                    ))}

                    <Text style={{ color: colors.text }}>Dia da semana</Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                        {weekdays.map((w, idx) => (
                            <Pressable
                                key={idx}
                                onPress={() => setWeekday(idx)}
                                style={dayButton(idx === weekday)}
                            >
                                <Text style={dayText(idx === weekday)}>{w}</Text>
                            </Pressable>
                        ))}
                    </View>

                    <Text style={{ color: colors.text }}>Início</Text>
                    <TextInput
                        value={start}
                        onChangeText={setStart}
                        placeholder="08:00"
                        style={input}
                        placeholderTextColor={colors.textMuted}
                        keyboardType={Platform.OS === 'ios' ? 'numbers-and-punctuation' : 'numeric'}
                        maxLength={5}
                    />

                    <Text style={{ color: colors.text }}>Término</Text>
                    <TextInput
                        value={end}
                        onChangeText={setEnd}
                        placeholder="09:40"
                        style={input}
                        placeholderTextColor={colors.textMuted}
                        keyboardType={Platform.OS === 'ios' ? 'numbers-and-punctuation' : 'numeric'}
                        maxLength={5}
                    />

                    <Text style={{ color: colors.text }}>Local/Link (opcional)</Text>
                    <TextInput
                        value={location}
                        onChangeText={setLocation}
                        placeholder="Sala 203 ou Zoom"
                        style={input}
                        placeholderTextColor={colors.textMuted}
                    />

                    <View style={{ flexDirection: 'row', gap: 10 }}>
                        <Pressable
                            onPress={() => {
                                const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;
                                if (!timeRegex.test(start) || !timeRegex.test(end)) {
                                    alert('Informe horários válidos no formato HH:MM (ex: 08:00)');
                                    return;
                                }
                                onSubmit({ disciplineId, weekday, start, end, location });
                            }}
                            style={btn}
                        >
                            <Text style={{ color: colors.onPrimary }}>Salvar horário</Text>
                        </Pressable>
                        {onCancel && (
                            <Pressable onPress={onCancel} style={btnCancel}>
                                <Text style={{ color: colors.text }}>Cancelar</Text>
                            </Pressable>
                        )}
                    </View>
                </ScrollView>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
}
