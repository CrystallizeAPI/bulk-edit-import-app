import util from 'util';
export const dump = (obj: unknown) => {
    // eslint-disable-next-line no-console
    console.log(util.inspect(obj, false, 200, true));
};
