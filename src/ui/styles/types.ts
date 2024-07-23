import type { useActionData, useLoaderData } from '@remix-run/react';
import type { indexPageAction } from '~/infrastructure/actions/index-page-action.server';
import type { retrieveFilterListForFrontend } from '~/domain/use-cases/retrieve-filter-list-for-frontend.server';

export type ActionData = ReturnType<typeof useActionData<ReturnType<typeof indexPageAction>>>;

export type LoaderData = {
    filterList: ReturnType<typeof useLoaderData<ReturnType<typeof retrieveFilterListForFrontend>>>;
};
