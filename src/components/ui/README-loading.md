# Loading Components

This directory contains various loading components that match your website's theme and can be used throughout the application.

## Components

### 1. Progress
A determinate progress bar component.

```tsx
import { Progress } from '@/components/ui/loading'

// Basic usage
<Progress value={50} />

// With custom styling
<Progress value={75} className="h-6" />
```

### 2. LoadingProgress
An indeterminate progress bar with animation.

```tsx
import { LoadingProgress } from '@/components/ui/loading'

// Basic usage
<LoadingProgress />

// With text and custom size
<LoadingProgress 
  size="lg" 
  showText={true} 
  text="Processing..." 
/>
```

### 3. LoadingSpinner
A spinning loader component.

```tsx
import { LoadingSpinner } from '@/components/ui/loading'

// Basic usage
<LoadingSpinner />

// With text and custom size
<LoadingSpinner 
  size="xl" 
  showText={true} 
  text="Loading..." 
/>
```

### 4. LoadingOverlay
A full-screen loading overlay with backdrop blur.

```tsx
import { LoadingOverlay } from '@/components/ui/loading'

// Basic usage
<LoadingOverlay show={isLoading} />

// With custom options
<LoadingOverlay 
  show={isLoading}
  variant="both"
  size="lg"
  text="Processing your request..."
  backdrop={true}
/>
```

## Hook

### useLoading
A custom hook to manage loading states.

```tsx
import { useLoading } from '@/hooks/use-loading'

const MyComponent = () => {
  const { isLoading, startLoading, stopLoading, withLoading } = useLoading()

  const handleAsyncOperation = async () => {
    await withLoading(
      async () => {
        // Your async operation here
        await fetch('/api/data')
      },
      "Loading data..."
    )
  }

  return (
    <div>
      {isLoading && <LoadingSpinner />}
      <button onClick={handleAsyncOperation}>
        Load Data
      </button>
    </div>
  )
}
```

## Usage Examples

### Page Loading
```tsx
import { LoadingWrapper } from '@/components/loading-wrapper'

export default function MyPage() {
  return (
    <LoadingWrapper>
      <div>Your page content</div>
    </LoadingWrapper>
  )
}
```

### Button Loading State
```tsx
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/loading'
import { useLoading } from '@/hooks/use-loading'

const SubmitButton = () => {
  const { isLoading, withLoading } = useLoading()

  const handleSubmit = async () => {
    await withLoading(
      async () => {
        await submitForm()
      },
      "Submitting..."
    )
  }

  return (
    <Button onClick={handleSubmit} disabled={isLoading}>
      {isLoading ? (
        <>
          <LoadingSpinner size="sm" />
          <span className="ml-2">Submitting...</span>
        </>
      ) : (
        "Submit"
      )}
    </Button>
  )
}
```

### Form Loading
```tsx
import { LoadingProgress } from '@/components/ui/loading'

const FormWithProgress = () => {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      await submitForm()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
      {isSubmitting && (
        <LoadingProgress 
          showText={true} 
          text="Submitting form..." 
        />
      )}
    </form>
  )
}
```

## Theme Integration

All loading components automatically use your website's theme colors:
- Primary color for main loading elements
- Accent color for highlights and gradients
- Background colors for overlays and containers
- Text colors for loading messages

The components are fully responsive and work in both light and dark modes. 