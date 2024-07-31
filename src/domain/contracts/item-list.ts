import { InnerNode } from '~/infrastructure/crystallize/fetch-descendants.server';
import { NonStructuaralComponent } from './components';

export type Item = Omit<InnerNode, 'components'> & {
    components: NonStructuaralComponent[];
};
