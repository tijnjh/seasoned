import * as Base from '@base-ui/react/input'
import cn from 'cnfast'

interface InputProps extends Base.InputProps {}

export function Input({ children, className, ...props }: InputProps) {
  return (
    <Base.Input
      {...props}
      className={cn(
        'rounded-md border border-zinc-400-600 px-3 py-2 shadow-sm',
        'hover:border-zinc-500',
        className,
      )}
    >
      {children}
    </Base.Input>
  )
}
