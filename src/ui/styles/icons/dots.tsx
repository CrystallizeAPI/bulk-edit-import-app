type DotsProps = React.SVGProps<SVGSVGElement>;

export function Dots(props: DotsProps) {
    return (
        <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            {...props}
        >
            <circle cx="10" cy="5" r="1.7857" fill="#9095A8" />
            <circle cx="10" cy="10" r="1.7857" fill="#9095A8" />
            <circle cx="10" cy="15" r="1.7857" fill="#9095A8" />
        </svg>
    );
}
