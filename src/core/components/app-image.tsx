import { forwardRef, type ComponentPropsWithoutRef } from "react"

type ImageProps = ComponentPropsWithoutRef<"img"> & {
  fill?: boolean
  priority?: boolean
}
const Image = forwardRef<HTMLImageElement, ImageProps>(function Image(
  { fill, priority, style, loading, alt, ...props },
  ref
) {
  return (
    <img
      ref={ref}
      {...props}
      alt={alt}
      decoding="async"
      loading={priority ? "eager" : (loading ?? "lazy")}
      fetchPriority={priority ? "high" : undefined}
      style={
        fill
          ? {
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              ...style,
            }
          : style
      }
    />
  )
})
export default Image
