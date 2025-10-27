// lib/averages.ts
import { Discipline, Task } from '@/types';

/**
 * Normaliza uma nota de uma escala para outra. Ex.: 7/20 -> escalar para 10 => 3.5
 */
export function normalizeGrade(value: number, fromMax: number, toMax: number): number {
    if (!Number.isFinite(value) || !Number.isFinite(fromMax) || fromMax <= 0) return 0;
    return (value / fromMax) * toMax;
}

/**
 * Calcula a média de UMA disciplina a partir das tasks dela.
 * Considera:
 *  - disciplina.grading.components (pesos somando 100)
 *  - cada task pode ter grade (numérica), gradeMax (default 10), e componentId (vínculo)
 *  - scaleMax da disciplina (default 10)
 * Retorna:
 *  - media (na escala da disciplina)
 *  - porComponente: array com médias por componente (já na escala da disciplina)
 */
export function computeDisciplineAverageFromTasks(
    discipline: Discipline,
    tasks: Task[]
): {
    media: number | null;
    porComponente: { componentId: string; label: string; weight: number; media: number | null }[];
} {
    const scheme = discipline.grading;
    if (!scheme || !scheme.components?.length) {
        return { media: null, porComponente: [] };
    }
    const scaleMax = scheme.scaleMax ?? 10;

    // prepara estrutura por componente
    const compMap = new Map<string, { label: string; weight: number; grades: number[] }>();
    for (const c of scheme.components) {
        compMap.set(c.id, { label: c.label, weight: c.weight, grades: [] });
    }

    // agrega notas das tasks já lançadas (com componentId válido)
    for (const t of tasks) {
        if (t.grade == null) continue;
        if (!t.componentId) continue;
        const comp = compMap.get(t.componentId);
        if (!comp) continue;
        const fromMax = t.gradeMax ?? 10;
        // normaliza para a escala da disciplina (ex.: 8/20 -> 4/10 se scaleMax=10)
        const normalized = normalizeGrade(t.grade, fromMax, scaleMax);
        comp.grades.push(normalized);
    }

    // média por componente (na escala da disciplina)
    let totalPercent = 0;
    let weighted = 0;

    const porComponente = Array.from(compMap.entries()).map(([componentId, info]) => {
        let avg: number | null = null;
        if (info.grades.length > 0) {
            const sum = info.grades.reduce((a, b) => a + b, 0);
            avg = Number((sum / info.grades.length).toFixed(2));
            // ponderação: (avg / scaleMax) * weight
            weighted += (avg / scaleMax) * info.weight;
            totalPercent += info.weight;
        }
        return { componentId, label: info.label, weight: info.weight, media: avg };
    });

    if (totalPercent === 0) {
        return { media: null, porComponente };
    }

    // weighted está em porcentagem (0..100) porque somamos pesos
    const finalOnScale = Number(((weighted / 100) * scaleMax).toFixed(2));
    return { media: finalOnScale, porComponente };
}
