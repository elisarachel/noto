import React, { useState } from 'react';
import { Text, TextInput, Pressable, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, ScrollView, View } from 'react-native';
import { Discipline } from '@/types';

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

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{}}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ gap: 8 }}>
                    <Text>Disciplina</Text>
                    {disciplines.map(d => (
                        <Pressable
                            key={d.id}
                            onPress={() => setDisciplineId(d.id)}
                            style={{
                                padding: 8,
                                borderWidth: 1,
                                borderColor: d.id === disciplineId ? '#1e40af' : '#ccc',
                                borderRadius: 6,
                                marginBottom: 4
                            }}
                        >
                            <Text>{d.name}</Text>
                        </Pressable>
                    ))}

                    <Text>Dia da semana</Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                        {weekdays.map((w, idx) => (
                            <Pressable
                                key={idx}
                                onPress={() => setWeekday(idx)}
                                style={{
                                    padding: 8,
                                    borderRadius: 6,
                                    backgroundColor: idx === weekday ? '#1e40af' : '#e5e7eb'
                                }}
                            >
                                <Text style={{ color: idx === weekday ? '#fff' : '#111' }}>{w}</Text>
                            </Pressable>
                        ))}
                    </View>


                    <Text>Início</Text>
                    <TextInput
                        value={start}
                        onChangeText={setStart}
                        placeholder="08:00"
                        style={input}
                        keyboardType={Platform.OS === 'ios' ? 'numbers-and-punctuation' : 'numeric'}
                        maxLength={5}
                    />

                    <Text>Término</Text>
                    <TextInput
                        value={end}
                        onChangeText={setEnd}
                        placeholder="09:40"
                        style={input}
                        keyboardType={Platform.OS === 'ios' ? 'numbers-and-punctuation' : 'numeric'}
                        maxLength={5}
                    />

                    <Text>Local/Link (opcional)</Text>
                    <TextInput
                        value={location}
                        onChangeText={setLocation}
                        placeholder="Sala 203 ou Zoom"
                        style={input}
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
                            <Text style={{ color: '#fff' }}>Salvar horário</Text>
                        </Pressable>
                        {onCancel && (
                            <Pressable onPress={onCancel} style={btnCancel}>
                                <Text>Cancelar</Text>
                            </Pressable>
                        )}
                    </View>
                </ScrollView>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
}

const input = { borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 8 };
const btn = { backgroundColor: '#1e40af', padding: 12, borderRadius: 8, marginTop: 8, alignItems: 'center' as const };
const btnCancel = { backgroundColor: '#e5e7eb', padding: 12, borderRadius: 8, marginTop: 8, alignItems: 'center' as const };
