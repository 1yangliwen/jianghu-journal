import { RELATIONS, MOODS, SCENES } from '../db';

export const getRelationLabel = (value) => {
    const relation = RELATIONS.find((item) => item.value === value);
    return relation ? relation.label : value;
};

export const getMoodLabel = (value) => {
    const mood = MOODS.find((item) => item.value === value);
    return mood ? mood.label : value;
};

export const getSceneLabel = (value) => {
    const scene = SCENES.find((item) => item.value === value);
    return scene ? scene.label : value;
};
