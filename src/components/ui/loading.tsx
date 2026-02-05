import * as React from "react"

import { cn } from "@/lib/utils"

interface LoadingProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg" | "xl"
  text?: string
  fullScreen?: boolean
}

function Loading({
  className,
  size = "md",
  text,
  fullScreen = false,
  ...props
}: LoadingProps) {
  const sizes = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
    xl: "w-24 h-24",
  }

  const containerClasses = fullScreen
    ? "fixed inset-0 z-50 flex items-center justify-center bg-[var(--background)]/80 backdrop-blur-sm"
    : "flex items-center justify-center"

  return (
    <div className={cn(containerClasses, className)} {...props}>
      <div className="flex flex-col items-center gap-4">
        <svg
          className={cn("text-[var(--primary)]", sizes[size])}
          xmlns="http://www.w3.org/2000/svg"
          width="512"
          height="512"
          viewBox="0 0 24 24"
        >
          <rect width="7.33" height="7.33" x="1" y="1" fill="currentColor">
            <animate
              id="svgSpinnersBlocksWave0"
              attributeName="x"
              begin="0;svgSpinnersBlocksWave1.end+0.2s"
              dur="0.6s"
              values="1;4;1"
            />
            <animate
              attributeName="y"
              begin="0;svgSpinnersBlocksWave1.end+0.2s"
              dur="0.6s"
              values="1;4;1"
            />
            <animate
              attributeName="width"
              begin="0;svgSpinnersBlocksWave1.end+0.2s"
              dur="0.6s"
              values="7.33;1.33;7.33"
            />
            <animate
              attributeName="height"
              begin="0;svgSpinnersBlocksWave1.end+0.2s"
              dur="0.6s"
              values="7.33;1.33;7.33"
            />
          </rect>
          <rect width="7.33" height="7.33" x="8.33" y="1" fill="currentColor">
            <animate
              attributeName="x"
              begin="svgSpinnersBlocksWave0.begin+0.1s"
              dur="0.6s"
              values="8.33;11.33;8.33"
            />
            <animate
              attributeName="y"
              begin="svgSpinnersBlocksWave0.begin+0.1s"
              dur="0.6s"
              values="1;4;1"
            />
            <animate
              attributeName="width"
              begin="svgSpinnersBlocksWave0.begin+0.1s"
              dur="0.6s"
              values="7.33;1.33;7.33"
            />
            <animate
              attributeName="height"
              begin="svgSpinnersBlocksWave0.begin+0.1s"
              dur="0.6s"
              values="7.33;1.33;7.33"
            />
          </rect>
          <rect width="7.33" height="7.33" x="1" y="8.33" fill="currentColor">
            <animate
              attributeName="x"
              begin="svgSpinnersBlocksWave0.begin+0.1s"
              dur="0.6s"
              values="1;4;1"
            />
            <animate
              attributeName="y"
              begin="svgSpinnersBlocksWave0.begin+0.1s"
              dur="0.6s"
              values="8.33;11.33;8.33"
            />
            <animate
              attributeName="width"
              begin="svgSpinnersBlocksWave0.begin+0.1s"
              dur="0.6s"
              values="7.33;1.33;7.33"
            />
            <animate
              attributeName="height"
              begin="svgSpinnersBlocksWave0.begin+0.1s"
              dur="0.6s"
              values="7.33;1.33;7.33"
            />
          </rect>
          <rect width="7.33" height="7.33" x="15.66" y="1" fill="currentColor">
            <animate
              attributeName="x"
              begin="svgSpinnersBlocksWave0.begin+0.2s"
              dur="0.6s"
              values="15.66;18.66;15.66"
            />
            <animate
              attributeName="y"
              begin="svgSpinnersBlocksWave0.begin+0.2s"
              dur="0.6s"
              values="1;4;1"
            />
            <animate
              attributeName="width"
              begin="svgSpinnersBlocksWave0.begin+0.2s"
              dur="0.6s"
              values="7.33;1.33;7.33"
            />
            <animate
              attributeName="height"
              begin="svgSpinnersBlocksWave0.begin+0.2s"
              dur="0.6s"
              values="7.33;1.33;7.33"
            />
          </rect>
          <rect width="7.33" height="7.33" x="8.33" y="8.33" fill="currentColor">
            <animate
              attributeName="x"
              begin="svgSpinnersBlocksWave0.begin+0.2s"
              dur="0.6s"
              values="8.33;11.33;8.33"
            />
            <animate
              attributeName="y"
              begin="svgSpinnersBlocksWave0.begin+0.2s"
              dur="0.6s"
              values="8.33;11.33;8.33"
            />
            <animate
              attributeName="width"
              begin="svgSpinnersBlocksWave0.begin+0.2s"
              dur="0.6s"
              values="7.33;1.33;7.33"
            />
            <animate
              attributeName="height"
              begin="svgSpinnersBlocksWave0.begin+0.2s"
              dur="0.6s"
              values="7.33;1.33;7.33"
            />
          </rect>
          <rect width="7.33" height="7.33" x="1" y="15.66" fill="currentColor">
            <animate
              attributeName="x"
              begin="svgSpinnersBlocksWave0.begin+0.2s"
              dur="0.6s"
              values="1;4;1"
            />
            <animate
              attributeName="y"
              begin="svgSpinnersBlocksWave0.begin+0.2s"
              dur="0.6s"
              values="15.66;18.66;15.66"
            />
            <animate
              attributeName="width"
              begin="svgSpinnersBlocksWave0.begin+0.2s"
              dur="0.6s"
              values="7.33;1.33;7.33"
            />
            <animate
              attributeName="height"
              begin="svgSpinnersBlocks0.begin+0.2s"
              dur="0.6s"
              values="7.33;1.33;7.33"
            />
          </rect>
          <rect width="7.33" height="7.33" x="15.66" y="8.33" fill="currentColor">
            <animate
              attributeName="x"
              begin="svgSpinnersBlocksWave0.begin+0.3s"
              dur="0.6s"
              values="15.66;18.66;15.66"
            />
            <animate
              attributeName="y"
              begin="svgSpinnersBlocksWave0.begin+0.3s"
              dur="0.6s"
              values="8.33;11.33;8.33"
            />
            <animate
              attributeName="width"
              begin="svgSpinnersBlocksWave0.begin+0.3s"
              dur="0.6s"
              values="7.33;1.33;7.33"
            />
            <animate
              attributeName="height"
              begin="svgSpinnersBlocksWave0.begin+0.3s"
              dur="0.6s"
              values="7.33;1.33;7.33"
            />
          </rect>
          <rect width="7.33" height="7.33" x="8.33" y="15.66" fill="currentColor">
            <animate
              attributeName="x"
              begin="svgSpinnersBlocksWave0.begin+0.3s"
              dur="0.6s"
              values="8.33;11.33;8.33"
            />
            <animate
              attributeName="y"
              begin="svgSpinnersBlocksWave0.begin+0.3s"
              dur="0.6s"
              values="15.66;18.66;15.66"
            />
            <animate
              attributeName="width"
              begin="svgSpinnersBlocksWave0.begin+0.3s"
              dur="0.6s"
              values="7.33;1.33;7.33"
            />
            <animate
              attributeName="height"
              begin="svgSpinnersBlocksWave0.begin+0.3s"
              dur="0.6s"
              values="7.33;1.33;7.33"
            />
          </rect>
          <rect width="7.33" height="7.33" x="15.66" y="15.66" fill="currentColor">
            <animate
              id="svgSpinnersBlocksWave1"
              attributeName="x"
              begin="svgSpinnersBlocksWave0.begin+0.4s"
              dur="0.6s"
              values="15.66;18.66;15.66"
            />
            <animate
              attributeName="y"
              begin="svgSpinnersBlocksWave0.begin+0.4s"
              dur="0.6s"
              values="15.66;18.66;15.66"
            />
            <animate
              attributeName="width"
              begin="svgSpinnersBlocksWave0.begin+0.4s"
              dur="0.6s"
              values="7.33;1.33;7.33"
            />
            <animate
              attributeName="height"
              begin="svgSpinnersBlocksWave0.begin+0.4s"
              dur="0.6s"
              values="7.33;1.33;7.33"
            />
          </rect>
        </svg>
        {text && (
          <p className="text-sm text-[var(--muted-foreground)] animate-pulse">
            {text}
          </p>
        )}
      </div>
    </div>
  )
}

export { Loading }
