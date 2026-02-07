import logoSvg from '@/assets/logo.svg'
import recentSvg from '@/assets/recently.svg'
import settingSvg from '@/assets/setting.svg'
import NoItemSvg from '@/assets/noitem.svg'
import NoResultSvg from '@/assets/noRes.svg'

export const OkiLogo = ({
  size = 36,
  ...props
}: { size?: number } & React.ImgHTMLAttributes<HTMLImageElement>) => {
  return (
    <img draggable={false} src={logoSvg} alt="Oki Logo" width={size} height={size} {...props} />
  )
}

export const SearchIcon = ({
  size = 24,
  strokeWidth = 1.5,
  width,
  height,
  ...props
}: {
  size?: number
  strokeWidth?: number
  width?: number
  height?: number
}) => {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      focusable="false"
      height={height || size}
      role="presentation"
      viewBox="0 0 24 24"
      width={width || size}
      {...props}
    >
      <path
        d="M11.5 21C16.7467 21 21 16.7467 21 11.5C21 6.25329 16.7467 2 11.5 2C6.25329 2 2 6.25329 2 11.5C2 16.7467 6.25329 21 11.5 21Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={strokeWidth}
      />
      <path
        d="M22 22L20 20"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={strokeWidth}
      />
    </svg>
  )
}

export const RecentIcon = ({ size = 36, ...props }: { size?: number }) => {
  return (
    <img
      draggable={false}
      src={recentSvg}
      alt="Recent Icon"
      width={size}
      height={size}
      {...props}
    />
  )
}

export const SettingIcon = ({ size = 36, ...props }: { size?: number }) => {
  return (
    <img
      draggable={false}
      src={settingSvg}
      alt="Setting Icon"
      width={size}
      height={size}
      {...props}
    />
  )
}

// SettingsModal 中使用的图标
export const CheckIcon = ({
  size = 16,
  ...props
}: { size?: number } & React.SVGProps<SVGSVGElement>) => {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      focusable="false"
      height={size}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      viewBox="0 0 24 24"
      width={size}
      {...props}
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

export const CircleCheckIcon = ({
  size = 16,
  ...props
}: { size?: number } & React.SVGProps<SVGSVGElement>) => {
  return (
    <svg
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      width={size}
      height={size}
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  )
}

export const LinkIcon = ({
  size = 16,
  ...props
}: { size?: number } & React.SVGProps<SVGSVGElement>) => {
  return (
    <svg
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      width={size}
      height={size}
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
      />
    </svg>
  )
}

export const TagIcon = ({
  size = 16,
  ...props
}: { size?: number } & React.SVGProps<SVGSVGElement>) => {
  return (
    <svg
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      width={size}
      height={size}
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
      />
    </svg>
  )
}

export const TrashIcon = ({
  size = 16,
  ...props
}: { size?: number } & React.SVGProps<SVGSVGElement>) => {
  return (
    <svg
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      width={size}
      height={size}
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
      />
    </svg>
  )
}

export const ServerIcon = ({
  size = 24,
  ...props
}: { size?: number } & React.SVGProps<SVGSVGElement>) => {
  return (
    <svg
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      width={size}
      height={size}
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
      />
    </svg>
  )
}

export const PackageIcon = ({
  size = 24,
  ...props
}: { size?: number } & React.SVGProps<SVGSVGElement>) => {
  return (
    <svg
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      width={size}
      height={size}
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M9 17v1a3 3 0 006 0v-1m3-7V7a3 3 0 00-3-3H9a3 3 0 00-3 3v3m3 7h6a3 3 0 003-3v-1a3 3 0 00-3-3H9a3 3 0 00-3 3v1a3 3 0 003 3z"
      />
    </svg>
  )
}

export const CheckCircleIcon = ({
  size = 20,
  ...props
}: { size?: number } & React.SVGProps<SVGSVGElement>) => {
  return (
    <svg fill="currentColor" viewBox="0 0 20 20" width={size} height={size} {...props}>
      <path
        fillRule="evenodd"
        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
        clipRule="evenodd"
      />
    </svg>
  )
}

export const CloseIcon = ({
  size = 20,
  ...props
}: { size?: number } & React.SVGProps<SVGSVGElement>) => {
  return (
    <svg
      aria-hidden="true"
      fill="currentColor"
      focusable="false"
      height={size}
      role="presentation"
      viewBox="0 0 1024 1024"
      width={size}
      {...props}
    >
      <path d="M597.795527 511.488347 813.564755 295.718095c23.833825-23.833825 23.833825-62.47489 0.001023-86.307691-23.832801-23.832801-62.47489-23.833825-86.307691 0L511.487835 425.180656 295.717583 209.410404c-23.833825-23.833825-62.475913-23.833825-86.307691 0-23.832801 23.832801-23.833825 62.47489 0 86.308715l215.769228 215.769228L209.410915 727.258599c-23.833825 23.833825-23.833825 62.47489 0 86.307691 23.832801 23.833825 62.473867 23.833825 86.307691 0l215.768205-215.768205 215.769228 215.769228c23.834848 23.833825 62.475913 23.832801 86.308715 0 23.833825-23.833825 23.833825-62.47489 0-86.307691L597.795527 511.488347z"></path>
    </svg>
  )
}

export const NoItemIcon = ({ size = 36, ...props }: { size?: number }) => {
  return (
    <img
      draggable={false}
      src={NoItemSvg}
      alt="No Item Icon"
      width={size}
      height={size}
      {...props}
    />
  )
}

export const NoResultIcon = ({ size = 36, ...props }: { size?: number }) => {
  return (
    <img
      draggable={false}
      src={NoResultSvg}
      alt="No Result Icon"
      width={size}
      height={size}
      {...props}
    />
  )
}

export const DownloadIcon = ({
  size = 16,
  ...props
}: { size?: number } & React.SVGProps<SVGSVGElement>) => {
  return (
    <svg
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      width={size}
      height={size}
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
      />
    </svg>
  )
}

export const UploadIcon = ({
  size = 16,
  ...props
}: { size?: number } & React.SVGProps<SVGSVGElement>) => {
  return (
    <svg
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      width={size}
      height={size}
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
      />
    </svg>
  )
}

export const CodeIcon = ({
  size = 16,
  ...props
}: { size?: number } & React.SVGProps<SVGSVGElement>) => {
  return (
    <svg
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      width={size}
      height={size}
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
      />
    </svg>
  )
}

export const GlobeIcon = ({
  size = 16,
  ...props
}: { size?: number } & React.SVGProps<SVGSVGElement>) => {
  return (
    <svg
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      width={size}
      height={size}
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  )
}

export const ArrowUpIcon = ({
  size = 16,
  ...props
}: { size?: number } & React.SVGProps<SVGSVGElement>) => {
  return (
    <svg
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      width={size}
      height={size}
      {...props}
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
    </svg>
  )
}

export const ArrowDownIcon = ({
  size = 16,
  ...props
}: { size?: number } & React.SVGProps<SVGSVGElement>) => {
  return (
    <svg
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      width={size}
      height={size}
      {...props}
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  )
}

export const ArrowLeftIcon = ({
  size = 16,
  ...props
}: { size?: number } & React.SVGProps<SVGSVGElement>) => {
  return (
    <svg
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      width={size}
      height={size}
      {...props}
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  )
}

export const ChevronDownIcon = ({
  size = 24,
  ...props
}: { size?: number } & React.SVGProps<SVGSVGElement>) => {
  return (
    <svg
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      width={size}
      height={size}
      {...props}
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
    </svg>
  )
}

export const FilmIcon = ({
  size = 24,
  ...props
}: { size?: number } & React.SVGProps<SVGSVGElement>) => {
  return (
    <svg
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      width={size}
      height={size}
      {...props}
    >
      <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
      <line x1="7" y1="2" x2="7" y2="22" />
      <line x1="17" y1="2" x2="17" y2="22" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <line x1="2" y1="7" x2="7" y2="7" />
      <line x1="2" y1="17" x2="7" y2="17" />
      <line x1="17" y1="17" x2="22" y2="17" />
      <line x1="17" y1="7" x2="22" y2="7" />
    </svg>
  )
}

export const TvIcon = ({
  size = 24,
  ...props
}: { size?: number } & React.SVGProps<SVGSVGElement>) => {
  return (
    <svg
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      width={size}
      height={size}
      {...props}
    >
      <rect x="2" y="7" width="20" height="15" rx="2" ry="2" />
      <polyline points="17 2 12 7 7 2" />
    </svg>
  )
}

export const ChevronRight = ({
  size = 24,
  ...props
}: { size?: number } & React.SVGProps<SVGSVGElement>) => {
  return (
    <svg
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      width={size}
      height={size}
      {...props}
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  )
}

export const Calendar = ({
  size = 24,
  ...props
}: { size?: number } & React.SVGProps<SVGSVGElement>) => {
  return (
    <svg
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      width={size}
      height={size}
      {...props}
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
}

export const PlayCircle = ({
  size = 24,
  ...props
}: { size?: number } & React.SVGProps<SVGSVGElement>) => {
  return (
    <svg
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      width={size}
      height={size}
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <polygon points="10 8 16 12 10 16 10 8" />
    </svg>
  )
}

export const Mic = ({
  size = 24,
  ...props
}: { size?: number } & React.SVGProps<SVGSVGElement>) => {
  return (
    <svg
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      width={size}
      height={size}
      {...props}
    >
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="23" />
      <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  )
}

export const Video = ({
  size = 24,
  ...props
}: { size?: number } & React.SVGProps<SVGSVGElement>) => {
  return (
    <svg
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      width={size}
      height={size}
      {...props}
    >
      <polygon points="23 7 16 12 23 17 23 7" />
      <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
    </svg>
  )
}

export const Layers = ({
  size = 24,
  ...props
}: { size?: number } & React.SVGProps<SVGSVGElement>) => {
  return (
    <svg
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      width={size}
      height={size}
      {...props}
    >
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  )
}
