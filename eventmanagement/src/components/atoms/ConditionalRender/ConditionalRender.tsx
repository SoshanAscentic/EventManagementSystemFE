interface ConditionalRenderProps {
  children: React.ReactNode
  condition: boolean
  fallback?: React.ReactNode
}

export const ConditionalRender = ({ 
  children, 
  condition, 
  fallback = null 
}: ConditionalRenderProps) => {
  return condition ? <>{children}</> : <>{fallback}</>
}