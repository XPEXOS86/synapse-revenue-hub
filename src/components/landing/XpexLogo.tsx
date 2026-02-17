const XpexLogo = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg viewBox="0 0 32 32" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="xpex-grad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
        <stop stopColor="hsl(224 76% 53%)" />
        <stop offset="1" stopColor="hsl(263 70% 50%)" />
      </linearGradient>
    </defs>
    <rect width="32" height="32" rx="8" fill="url(#xpex-grad)" />
    <path
      d="M8 10L13.5 16L8 22H11.5L15.5 17.2L19.5 22H23L17.5 16L23 10H19.5L15.5 14.8L11.5 10H8Z"
      fill="white"
    />
  </svg>
);

export default XpexLogo;
