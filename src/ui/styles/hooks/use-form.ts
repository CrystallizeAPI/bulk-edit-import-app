import { useReducer, useEffect, useCallback } from 'react';
import { LoaderData } from '../types';
import { SelectOption } from '~/domain/contracts/select-option';

type UseFormProps = {
    loaderData: LoaderData;
    hasEnded: boolean;
};

enum ActionType {
    ShapeOptionChange = 'SHAPE_OPTION_CHANGE',
    LanguageOptionChange = 'LANGUAGE_OPTION_CHANGE',
    Reset = 'RESET',
}

type Action = {
    type: ActionType;
    languageOption?: SelectOption;
    shapeOption?: SelectOption;
};

export type State = {
    renderKey: number;
    languageOption?: SelectOption;
    shapeOption?: SelectOption;
};

const reducer = (state: State, action: Action) => {
    switch (action.type) {
        case ActionType.LanguageOptionChange: {
            return { ...state, languageOption: action.languageOption };
        }
        case ActionType.ShapeOptionChange: {
            return { ...state, shapeOption: action.shapeOption };
        }
        case ActionType.Reset: {
            return {
                ...state,
                renderKey: state.renderKey + 1,
                shapeOption: undefined,
            };
        }
    }
};

export const useForm = ({ loaderData, hasEnded }: UseFormProps) => {
    const { filterList } = loaderData;
    const languageOption = filterList.languages[0];
    const [form, dispatch] = useReducer(reducer, {
        renderKey: 0,
        shapeOption: undefined,
        languageOption,
    });

    useEffect(() => {
        hasEnded && dispatch({ type: ActionType.Reset });
    }, [hasEnded]);

    const onShapeOptionChange = useCallback((shapeOption?: SelectOption) => {
        dispatch({ type: ActionType.ShapeOptionChange, shapeOption });
    }, []);

    const onLanguageOptionChange = useCallback((languageOption: SelectOption) => {
        dispatch({ type: ActionType.LanguageOptionChange, languageOption });
    }, []);

    return { ...form, onShapeOptionChange, onLanguageOptionChange };
};
