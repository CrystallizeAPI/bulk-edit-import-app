import { Component, NonStructuaralComponent } from './components';

export type Item = Omit<InnerNode, 'components'> & {
    components: NonStructuaralComponent[];
};

export type InnerNode = {
    id: string;
    name: string;
    language: string;
    shapeIdentifier: string;
    topics: { id: string }[];
    components: Component[];
};
