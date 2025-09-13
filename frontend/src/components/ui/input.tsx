import * as React from "react"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode
  error?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", icon, error, ...props }, ref) => {
    if (icon) {
      return (
        <div className="input-group">
          <div className="input-icon">
            <input
              className={`input ${error ? 'border-red-500' : ''} ${className}`}
              ref={ref}
              {...props}
            />
            <div className="icon">
              {icon}
            </div>
          </div>
          {error && (
            <p className="text-xs text-red-600 mt-2 font-medium">
              {error}
            </p>
          )}
        </div>
      )
    }

    return (
      <div className="input-group">
        <input
          className={`input ${error ? 'border-red-500' : ''} ${className}`}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="text-xs text-red-600 mt-2 font-medium">
            {error}
          </p>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }