import * as Base from '@base-ui/react/button'
import cn from 'cnfast'

interface ButtonProps extends Base.ButtonProps {}

export function Button({ children }: ButtonProps) {
  return (
    <Base.Button
      className={cn(
        'rounded-md bg-zinc-400-600 px-3 py-2 shadow-sm transition-transform',
        'hover:bg-zinc-500 active:scale-95',
      )}
    >
      {children}
    </Base.Button>
  )
}
