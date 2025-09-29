import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, ScrollView, Alert } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Discipline, Task } from '@/types';

const typeLabels = {
    prova: 'Prova',
    trabalho: 'Trabalho',
    projeto: 'Projeto'
};

type Props = {
    disciplines: Discipline[];
    initial?: Partial<Task>;
    onSubmit: (data: Omit<Task, 'id' | 'createdAt'>) => void;
    onCancel?: () => void;
};

export default function TaskForm({ disciplines, initial, onSubmit, onCancel }: Props) {
    const [title, setTitle] = useState(initial?.title ?? '');
    const [disciplineId, setDisciplineId] = useState(initial?.disciplineId ?? '');
    const [type, setType] = useState<'prova' | 'trabalho' | 'projeto'>(initial?.type ?? 'prova');
    const [notes, setNotes] = useState(initial?.notes ?? '');
    const [date, setDate] = useState(initial?.dueDate ? new Date(initial.dueDate) : new Date());
    const [showPicker, setShowPicker] = useState(false);

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{}}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ gap:10 }}>
                    <Text>Disciplina</Text>
                    {disciplines.map(d => (
                        <Pressable
                            key={d.id}
                            onPress={() => setDisciplineId(d.id)}
                            style={{
                                padding:8, borderWidth:1,
                                borderColor: d.id === disciplineId ? '#1e40af' : '#ccc',
                                borderRadius:6, marginBottom:4
                            }}
                        >
                            <Text>{d.name}</Text>
                        </Pressable>
                    ))}

                    <Text>Título</Text>
                    <TextInput
                        value={title}
                        onChangeText={setTitle}
                        placeholder="Ex.: Prova 1 de Cálculo"
                        style={input}
                    />

                    <Text>Tipo</Text>
                    <View style={{ flexDirection:'row', gap:6 }}>
                        {(['prova','trabalho','projeto'] as const).map(t => (
                            <Pressable
                                key={t}
                                onPress={() => setType(t)}
                                style={{
                                    padding:8,
                                    borderRadius:6,
                                    backgroundColor: type === t ? '#1e40af' : '#e5e7eb'
                                }}
                            >
                                <Text style={{ color: type === t ? '#fff' : '#111' }}>{typeLabels[t]}</Text>
                            </Pressable>
                        ))}
                    </View>

                    <Text>Data & Hora</Text>
                    <Pressable onPress={() => setShowPicker(true)} style={input}>
                        <Text>{date.toLocaleString()}</Text>
                    </Pressable>
                    {showPicker && (
                        <DateTimePicker
                            value={date}
                            mode="datetime"
                            display="default"
                            onChange={(
                                e: React.ComponentProps<typeof DateTimePicker>['onChange'] extends (event: infer E, date?: infer D) => any ? E : unknown,
                                d?: Date | undefined
                            ) => {
                                setShowPicker(false);
                                if (d) setDate(d);
                            }}
                        />
                    )}

                    <Text>Observações</Text>
                    <TextInput
                        value={notes}
                        onChangeText={setNotes}
                        placeholder="Ex.: prova sem consulta"
                        style={[input,{minHeight:80,textAlignVertical:'top'}]}
                        multiline
                    />

                    <View style={{ flexDirection:'row', gap:10 }}>
                        <Pressable
                            onPress={() => {
                                if (!disciplineId || !title) {
                                    Alert.alert('Preencha disciplina e título');
                                    return;
                                }
                                onSubmit({ disciplineId, title, type, dueDate: date.toISOString(), notes });
                            }}
                            style={btn}
                        >
                            <Text style={{ color:'#fff', fontWeight:'600' }}>Salvar</Text>
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

const input = { borderWidth:1, borderColor:'#ccc', padding:10, borderRadius:8 };
const btn = { backgroundColor:'#1e40af', padding:10, borderRadius:8, alignItems:'center' as const };
const btnCancel = { backgroundColor:'#e5e7eb', padding:10, borderRadius:8, alignItems:'center' as const };
