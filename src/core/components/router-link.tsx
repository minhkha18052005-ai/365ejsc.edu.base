import { forwardRef, type ComponentPropsWithoutRef } from "react"
import { Link as RouterLink } from "react-router-dom"

type LinkProps = Omit<ComponentPropsWithoutRef<typeof RouterLink>, "to"> & {
  href: string
}
const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  { href, ...props },
  ref
) {
  if (/^(?:https?:|mailto:|tel:)/.test(href) || props.target === "_blank")
    return <a ref={ref} href={href} {...props} />
  return <RouterLink ref={ref} to={href} {...props} />
})
export default Link
