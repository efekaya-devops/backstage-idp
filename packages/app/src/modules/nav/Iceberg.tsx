// Minimal iceberg: a pale tip above the waterline, a larger translucent body below it.
export const Iceberg = ({ height }: { height: number }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 64 64"
    height={height}
    width={height}
    aria-hidden
  >
    <path d="M12 30 26 11 33 19 40 13 52 30Z" fill="#EAF2FF" />
    <path d="M12 30H52L45 47 32 58 20 46Z" fill="#9DB8E8" fillOpacity={0.55} />
    <path d="M6 30H58" stroke="#EAF2FF" strokeWidth={2} strokeLinecap="round" />
  </svg>
);
