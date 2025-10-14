import * as React from "react";

/**
 * The complete Avidato logo, including the logomark and logotype.
 * This is a high-fidelity SVG recreation for optimal quality and scalability.
 */
const AvidatoLogo = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 350 140" // Adjusted viewBox to fit both elements
    {...props}
  >
    {/* Gradient definition for the logotype */}
    <defs>
      <linearGradient id="avidatoGradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" style={{ stopColor: "#263A5E" }} />
        <stop offset="100%" style={{ stopColor: "#2A7AB5" }} />
      </linearGradient>
    </defs>

    {/* Logomark (The 'A' Icon) */}
    <g transform="translate(125, 0) scale(1.2)">
      <path
        d="M52.5 0L0 85H20L41 48C45 40 50 35 52.5 32L64 48H85L52.5 0Z"
        fill="#263A5E"
      />
      <path
        d="M20 85C35 75 55 72 64 78L85 85H20Z"
        fill="#2A7AB5"
      />
      <path
        d="M52.5 0L85 85H64L52.5 32C50 35 40 45 41 48L57 70C65 60 70 40 68 25L52.5 0Z"
        fill="#33C1B5"
      />
    </g>

    {/* Logotype (The "Avidato" Text) */}
    {/* This is the text converted to paths to preserve the unique font style */}
    <g transform="translate(0, 110)" fill="url(#avidatoGradient)">
      <path d="M41.4 0L0 55.8H13.6L41.4 15.3L69.2 55.8H82.8L41.4 0Z" />
      <path d="M84.7 20.4L94.1 55.8H106.3L96.9 20.4H84.7Z" />
      <path d="M117.8 12.3C114.3 12.3 111.4 14.2 110.1 17.1C108.8 14.2 105.9 12.3 102.4 12.3C97.1 12.3 93.3 16.9 93.3 22.4V55.8H105.5V23.4C105.5 22.1 106.3 21.3 107.4 21.3C108.5 21.3 109.3 22.1 109.3 23.4V55.8H121.5V22.4C121.5 16.9 117.8 12.3 117.8 12.3Z" transform="translate(1, -12.3) scale(0.95, 1)"/>
      <path d="M165.7 20.4V12.1H141.9V55.8H154.1V39.6H163.4L164.7 47.9H177.5L165.7 20.4ZM154.1 29.8V20.4H157.9L161.7 29.8H154.1Z" />
      <path d="M220.6 38.1C220.6 48 212.7 55.8 202.8 55.8C192.9 55.8 185 48 185 38.1C185 28.2 192.9 20.4 202.8 20.4C212.7 20.4 220.6 28.2 220.6 38.1ZM197.2 38.1C197.2 42.1 200.5 45.4 202.8 45.4C205.1 45.4 208.4 42.1 208.4 38.1C208.4 34.1 205.1 30.8 202.8 30.8C200.5 30.8 197.2 34.1 197.2 38.1Z" />
      <path d="M259 20.4H244.2V8.9H232V55.8H244.2V44.3H251.4V34H244.2V29.8H259V20.4Z" transform="translate(-10, 0)"/>
      <path d="M298.8 38.1C298.8 48 290.9 55.8 281 55.8C271.1 55.8 263.2 48 263.2 38.1C263.2 28.2 271.1 20.4 281 20.4C290.9 20.4 298.8 28.2 298.8 38.1ZM275.4 38.1C275.4 42.1 278.7 45.4 281 45.4C283.3 45.4 286.6 42.1 286.6 38.1C286.6 34.1 283.3 30.8 281 30.8C278.7 30.8 275.4 34.1 275.4 38.1Z" transform="translate(-15, 0)"/>
    </g>
  </svg>
);

export default AvidatoLogo;