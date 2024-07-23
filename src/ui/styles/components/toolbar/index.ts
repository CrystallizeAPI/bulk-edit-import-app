import { ToolbarActions } from './toolbar-actions';
import { ToolbarButton } from './toolbar-button';
import { ToolbarContainer } from './toolbar-container';
import { ToolbarInput } from './toolbar-input';

export type { Action } from './toolbar-actions';

export const Toolbar = {
    Container: ToolbarContainer,
    Input: ToolbarInput,
    Actions: ToolbarActions,
    Button: ToolbarButton,
};
