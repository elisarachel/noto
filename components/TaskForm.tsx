import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TextInput, Pressable, Alert, Platform, ScrollView, KeyboardAvoidingView } from 'react-native';
import { Discipline, Task } from '@/types';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

const typeLabels = {
    prova: 'Prova',
    trabalho: 'Trabalho',
    projeto: 'Projeto'
};

type TaskFormProps = {
    disciplines: Discipline[];
    initial?: Partial<Task>;
    onSubmit: (data: Omit<Task, 'id' | 'createdAt'>) => void;
    onCancel?: () => void;
};

export default function TaskForm({ disciplines, initial, onSubmit, onCancel }: TaskFormProps) {
    const [title, setTitle] = useState(initial?.title ?? '');
    const [type, setType] = useState<Task['type']>( (initial?.type as any) ?? 'prova' );
    const [disciplineId, setDisciplineId] = useState(initial?.disciplineId ?? (disciplines[0]?.id ?? ''));
    const [dueDate, setDueDate] = useState(initial?.dueDate ?? new Date().toISOString());
    const [notes, setNotes] = useState(initial?.notes ?? '');

    const [componentId, setComponentId] = useState<string | undefined>(initial?.componentId);
	const [showPicker, setShowPicker] = useState(false);

    // componentes da disciplina selecionada
    const selectedDiscipline = useMemo(
        () => disciplines.find(d => d.id === disciplineId),
        [disciplines, disciplineId]
    );

    const components = useMemo(
        () => selectedDiscipline?.grading?.components ?? [],
        [selectedDiscipline?.grading?.components]
    );

    // ao trocar disciplina, reseta o componente se não existir na nova disciplina
    useEffect(() => {
        if (!components.length) {
            setComponentId(undefined);
        } else {
            // se já havia um componentId, garante que pertence à nova disciplina
            if (!components.some(c => c.id === componentId)) {
                setComponentId(undefined);
            }
        }
    }, [disciplineId, components, componentId]);

    const handleSubmit = () => {
        if (!title.trim()) {
            Alert.alert('Informe o título');
            return;
        }
        if (!disciplineId) {
            Alert.alert('Selecione a disciplina');
            return;
        }

        onSubmit({
            title: title.trim(),
            type,
            disciplineId,
            dueDate,
            notes: notes.trim() || undefined,
            // mantém a nota caso esteja editando
            grade: initial?.grade,
            gradeMax: initial?.gradeMax,
            componentId: componentId || undefined,
        } as Omit<Task, 'id' | 'createdAt'>);
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ width: '100%' }}>
            <ScrollView contentContainerStyle={{ gap: 10, paddingBottom: 100 }} keyboardShouldPersistTaps="handled">
                <View style={{ gap: 10 }}>
            <Text>Título*</Text>
            <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="Ex.: Prova 1"
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
			
			{components.length > 0 && (
				<Text>Componente de nota associado</Text>
			)}
            {components.map(d => (
                        <Pressable
                            key={d.id}
                            onPress={() => setComponentId(d.id)}
                            style={{
                                padding:8, borderWidth:1,
                                borderColor: d.id === componentId ? '#1e40af' : '#ccc',
                                borderRadius:6, marginBottom:4
                            }}
                        >
                            <Text>{d.label}</Text>
                        </Pressable>
             ))}

            <Text>Data e hora</Text>
<Pressable
    onPress={() => setShowPicker(true)}
    style={[input, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}
>
    <Text>{new Date(dueDate).toLocaleString('pt-BR')}</Text>
    <Text style={{ color: '#1e40af', fontWeight: '600' }}>📅</Text>
</Pressable>

{showPicker && (
    <DateTimePicker
            value={new Date(dueDate)}
            mode="datetime"
            display={Platform.OS === 'ios' ? 'inline' : 'default'}
            locale="pt-BR"
            themeVariant="light"
            textColor="#111827"
            onChange={(event: DateTimePickerEvent, date?: Date) => {
                if (event.type === 'set' && date) {
                    setDueDate(date.toISOString());
                }
                if (Platform.OS !== 'ios') setShowPicker(false);
            }}
        />
)}



            <Text>Observações</Text>
            <TextInput
                value={notes}
                onChangeText={setNotes}
                placeholder="Detalhes da avaliação"
                style={[input, { minHeight: 80 }]}
                multiline
            />

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
                <Pressable onPress={handleSubmit} style={btnPrimary}>
                    <Text style={{ color: '#fff', fontWeight: '600' }}>Salvar</Text>
                </Pressable>
                {onCancel && (
                    <Pressable onPress={onCancel} style={btnSecondary}>
                        <Text>Cancelar</Text>
                    </Pressable>
                )}
            </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const input = { borderWidth: 1, borderColor: '#ccc', padding: 12, borderRadius: 8 } as const;
const btnPrimary = { backgroundColor: '#1e40af', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 10 } as const;
const btnSecondary = { backgroundColor: '#e5e7eb', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 10 } as const;
