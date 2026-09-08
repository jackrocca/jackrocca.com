/**
 * Google, LinkedIn and Slack paths: https://authjs.dev/img/providers/
 * ISC License
 *
 * Copyright (c) 2022-2024, Balázs Orbán
 *
 * Permission to use, copy, modify, and/or distribute this software for any
 * purpose with or without fee is hereby granted, provided that the above
 * copyright notice and this permission notice appear in all copies.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
 * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
 * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
 * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
 * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
 * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 */

interface BrandIconProps {
  size?: number;
}

export const GoogleLogo = ({ size = 20 }: BrandIconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width={size}
    height={size}
    aria-hidden="true"
    focusable="false"
  >
    <path
      fill="#EA4335"
      d="M5.27 9.76A7.08 7.08 0 0 1 16.42 6.5L19.9 3A11.97 11.97 0 0 0 1.24 6.65l4.03 3.11Z"
    />
    <path
      fill="#34A853"
      d="M16.04 18.01A7.4 7.4 0 0 1 12 19.1a7.08 7.08 0 0 1-6.72-4.82l-4.04 3.06A11.96 11.96 0 0 0 12 24a11.4 11.4 0 0 0 7.83-3l-3.79-2.99Z"
    />
    <path
      fill="#4A90E2"
      d="M19.83 21c2.2-2.05 3.62-5.1 3.62-9 0-.7-.1-1.47-.27-2.18H12v4.63h6.44a5.4 5.4 0 0 1-2.4 3.56l3.8 2.99Z"
    />
    <path
      fill="#FBBC05"
      d="M5.28 14.27a7.12 7.12 0 0 1-.01-4.5L1.24 6.64A11.93 11.93 0 0 0 0 12c0 1.92.44 3.73 1.24 5.33l4.04-3.06Z"
    />
  </svg>
);

export const LinkedInLogo = ({ size = 20 }: BrandIconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    preserveAspectRatio="xMidYMid"
    viewBox="0 0 256 256"
    width={size}
    height={size}
    aria-hidden="true"
    focusable="false"
  >
    <path
      fill="currentColor"
      d="M218.1 218.1h-38v-59.4c0-14.1-.2-32.4-19.6-32.4-19.8 0-22.8 15.5-22.8 31.4V218h-38V96h36.5v16.7h.5a40 40 0 0 1 36-19.8c38.4 0 45.4 25.3 45.4 58.2v67ZM57 79.3a22 22 0 1 1 0-44 22 22 0 0 1 0 44M76 218H38V96h38v122ZM237 .1H19A18.7 18.7 0 0 0 0 18.4v219A18.7 18.7 0 0 0 18.9 256H237c10.4.1 18.9-8.1 19-18.5v-219A18.7 18.7 0 0 0 237 0"
    />
  </svg>
);

export const SlackLogo = ({ size = 20 }: BrandIconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 2447.6 2452.5"
    width={size}
    height={size}
    aria-hidden="true"
    focusable="false"
  >
    <g fillRule="evenodd" clipRule="evenodd">
      <path
        fill="#36c5f0"
        d="M897.4 0a245 245 0 0 0-244.7 245.2 245 245 0 0 0 244.8 245.2h244.8V245.3A245.2 245.2 0 0 0 897.4 0c.1 0 .1 0 0 0m0 654H244.8A245 245 0 0 0 0 899.2a245 245 0 0 0 244.7 245.3h652.7a245 245 0 0 0 244.8-245.2A245 245 0 0 0 897.4 654z"
      />
      <path
        fill="#2eb67d"
        d="M2447.6 899.2A245 245 0 0 0 2202.8 654 245 245 0 0 0 1958 899.2v245.3h244.8a245 245 0 0 0 244.8-245.3zm-652.7 0v-654A245 245 0 0 0 1550.2 0a245 245 0 0 0-244.8 245.2v654a245 245 0 0 0 244.7 245.3 245 245 0 0 0 244.8-245.3z"
      />
      <path
        fill="#ecb22e"
        d="M1550.1 2452.5a245 245 0 0 0 244.8-245.2 245 245 0 0 0-244.8-245.2h-244.8v245.2a245.1 245.1 0 0 0 244.8 245.2zm0-654.1h652.7a245 245 0 0 0 244.8-245.2 245 245 0 0 0-244.7-245.3h-652.7a245 245 0 0 0-244.8 245.2 245 245 0 0 0 244.7 245.3z"
      />
      <path
        fill="#e01e5a"
        d="M0 1553.2a245 245 0 0 0 244.8 245.2 245 245 0 0 0 244.8-245.2V1308H244.8A245 245 0 0 0 0 1553.2zm652.7 0v654a245 245 0 0 0 244.7 245.3 245 245 0 0 0 244.8-245.2v-653.9a244.8 244.8 0 1 0-489.5-.2s0 .1 0 0"
      />
    </g>
  </svg>
);

export const MicrosoftLogo = ({ size = 20 }: BrandIconProps) => (
  <svg
    viewBox="0 0 21 21"
    width={size}
    height={size}
    aria-hidden="true"
    focusable="false"
  >
    <path fill="#f25022" d="M1 1h9v9H1z" />
    <path fill="#7fba00" d="M11 1h9v9h-9z" />
    <path fill="#00a4ef" d="M1 11h9v9H1z" />
    <path fill="#ffb900" d="M11 11h9v9h-9z" />
  </svg>
);
