# Loading Component Usage Examples

The `Loading` component is a flexible, animated loading spinner that uses the blocks-wave SVG animation.

## Basic Usage

```tsx
import { Loading } from "@/components/ui"

function MyComponent() {
  return <Loading />
}
```

## With Custom Size

```tsx
import { Loading } from "@/components/ui"

function MyComponent() {
  return (
    <div>
      <Loading size="sm" />
      <Loading size="md" />
      <Loading size="lg" />
      <Loading size="xl" />
    </div>
  )
}
```

## With Loading Text

```tsx
import { Loading } from "@/components/ui"

function MyComponent() {
  return <Loading text="Loading your data..." />
}
```

## Full Screen Loading

```tsx
import { Loading } from "@/components/ui"

function MyComponent() {
  return <Loading fullScreen text="Please wait..." />
}
```

## With Custom Styling

```tsx
import { Loading } from "@/components/ui"

function MyComponent() {
  return (
    <Loading 
      className="my-custom-class"
      text="Custom loading message"
      size="lg"
    />
  )
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `"sm" \| "md" \| "lg" \| "xl"` | `"md"` | Size of the loading spinner |
| `text` | `string` | `undefined` | Optional text to display below the spinner |
| `fullScreen` | `boolean` | `false` | Whether to display as a full-screen overlay |
| `className` | `string` | `undefined` | Additional CSS classes to apply |
| `...props` | `React.HTMLAttributes<HTMLDivElement>` | - | Any other HTML div attributes |

## Features

- **Animated SVG**: Uses the blocks-wave animation for smooth, modern loading visuals
- **Responsive Sizing**: Four size options (sm, md, lg, xl) for different use cases
- **Full Screen Mode**: Can be used as a full-screen overlay with backdrop blur
- **Customizable**: Supports custom CSS classes and all standard HTML div attributes
- **Theme Compatible**: Uses CSS variables for colors that match your project's theme
- **Accessible**: Properly structured for screen readers

## Example: Async Data Loading

```tsx
import { useState } from "react"
import { Loading } from "@/components/ui"

function DataFetcher() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(null)

  useEffect(() => {
    fetchData().then(result => {
      setData(result)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return <Loading fullScreen text="Fetching data..." />
  }

  return <div>{/* Render your data */}</div>
}
```
