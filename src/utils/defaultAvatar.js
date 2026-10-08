// src/utils/defaultAvatar.js
export const DEFAULT_AVATAR =
    "data:image/svg+xml;utf8," +
    encodeURIComponent(`
        <svg width="46" height="46" viewBox="0 0 46 46" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <clipPath id="avatarClip">
                    <circle cx="23" cy="23" r="23"/>
                </clipPath>
                <linearGradient id="paint0_linear_2446_622" x1="16.2981" y1="4.12368" x2="16.2981" y2="17.2802" gradientUnits="userSpaceOnUse">
                    <stop stop-color="#FF9352"/>
                    <stop offset="1" stop-color="#A65728"/>
                </linearGradient>
                <linearGradient id="paint1_linear_2446_622" x1="16.2984" y1="27.0493" x2="16.2984" y2="41.8504" gradientUnits="userSpaceOnUse">
                    <stop stop-color="#FF9352"/>
                    <stop offset="1" stop-color="#A65728"/>
                </linearGradient>
            </defs>

            <g clip-path="url(#avatarClip)">
                <circle cx="23" cy="23" r="23" fill="#2b313b"/>

                <g transform="translate(9.15 13.5) scale(0.85)">
                    <circle cx="16.2981" cy="8.14918" r="8.14918" fill="url(#paint0_linear_2446_622)"/>
                    <path d="M32.5967 31.578C32.5967 36.6412 32.5967 40.7458 16.2984 40.7458C0 40.7458 0 36.6412 0 31.578C0 26.5147 7.29703 22.4102 16.2984 22.4102C25.2997 22.4102 32.5967 26.5147 32.5967 31.578Z" fill="url(#paint1_linear_2446_622)"/>
                </g>
            </g>
        </svg>
    `);