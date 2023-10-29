import { Dispatch,  } from 'react'
import { Prompt } from '@/types/prompt'
import { ActionType } from '@/hooks/useCreateReducer'
import { HomeInitialState } from '~/pages/api/home/home.state';

export const updatePrompt = (
  dispatch: Dispatch<ActionType<HomeInitialState>>,
  updatedPrompt: Prompt, allPrompts: Prompt[],
) => {
  const updatedPrompts = allPrompts.map((c) => {
    if (c.id === updatedPrompt.id) {
      return updatedPrompt
    }

    return c
  });

  savePrompts(dispatch, updatedPrompts);
}

export const savePrompts = (
  dispatch: Dispatch<ActionType<HomeInitialState>>,
  prompts: Prompt[]
) => {
  dispatch({ field: 'prompts', value: prompts })
  localStorage.setItem('prompts', JSON.stringify(prompts))
}
