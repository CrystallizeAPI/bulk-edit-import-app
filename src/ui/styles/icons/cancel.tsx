import { forwardRef, SVGProps } from 'react';

type CancelProps = SVGProps<SVGSVGElement>;

type CancelRef = SVGSVGElement;

export const Cancel = forwardRef<CancelRef, CancelProps>((delegated, ref) => {
    return (
        <svg ref={ref} width="34" height="34" viewBox="0 0 34 34" fill="none" {...delegated}>
            <path
                d="m27.4301 24.4325-.1299.1299c-.17.15-.6497.5798-1.1695 1.0595l-1.7392 1.5993-.1499.05a.2783.2783 0 0 1-.2299-.14l-3.6183-3.7182-2.6088-2.6388a1.0488 1.0488 0 0 0-.7926-.3838 1.006 1.006 0 0 0-.7096.2899l-5.6474 5.6773-.7696.7496-.07.18h-.2599l-2.6987-2.7088a.3813.3813 0 0 1-.18-.2598l.02-.14 5.6674-5.6173 1.2394-1.2395a.2995.2995 0 0 0 .1-.2398.2903.2903 0 0 0-.1-.2299l-1.8591-1.8692-2.8487-2.8786-1.5692-1.5992-.6197-.6597-.1-.09v-.12a.3689.3689 0 0 1 .12-.2398l2.7786-2.6588.11-.09h.14l.1099.06 5.7273 5.9272.8696.8796a.6998.6998 0 0 0 .9995 0l5.9672-6.0071.1799-.18a4.5467 4.5467 0 0 1 .5597-.5197.5585.5585 0 0 1 .19-.1c.1099 0 .2099.13.2998.22l.08.0899 2.039 2.109s.1899.2.2299.2499a.864.864 0 0 0 .1399.13.7704.7704 0 0 1 .13.1199c.0899.1499 0 .2598-.1799.4298l-6.1172 6.0871a1.3994 1.3994 0 0 0-.5197.7696.9287.9287 0 0 0 .2899.7997l3.0185 2.9786 3.4284 3.1785a2.001 2.001 0 0 1 .1999.2398.2564.2564 0 0 1 .0853.1524.2564.2564 0 0 1-.0323.1715Z"
                fill="currentColor"
            />
        </svg>
    );
});

Cancel.displayName = 'CancelIcon';