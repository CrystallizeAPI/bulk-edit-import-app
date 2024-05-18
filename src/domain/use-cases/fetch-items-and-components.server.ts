import { CrystallizeAPI } from '~/infrastructure/crystallize/create-crystallize-api.server';
import { FetchItemsInput } from '../contracts/input/fetch-items-input';

type Deps = {
    api: CrystallizeAPI;
};

/**
 * PIM Search does not have the filter capabilities to fetch items and components in a single request.
 * So we are going to fetch the children as a tree and then filter manually on topics and shapes...
 */
export const fetchItemsAndComponents = async (input: FetchItemsInput, { api }: Deps) => {
    const items = await api.fetchDescendants(input.folders, input.language, input.components);
    return items.filter((item) => {
        if (item.shapeIdentifier !== input.shape) {
            return false;
        }
        if (input.topics.length > 0) {
            const topicIds = item.topics.map((topic) => topic.id);
            if (!input.topics.some((topic) => topicIds.includes(topic))) {
                return false;
            }
        }
        return true;
    });
};
