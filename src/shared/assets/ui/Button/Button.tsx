import type React from "react"
import type { ButtonHTMLAttributes } from "react"
import classNames from "classnames"
import styles from "./Button.module.scss"

export type ButtonVariant = "filled" | "outline" | "flat"
export type ButtonSize = "sm" | "md" | "lg"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
  className?: string
  children: React.ReactNode
}

export const Button: React.FC<ButtonProps> = ({
  variant = "filled",
  size = "md",
  fullWidth = false,
  className,
  children,
  ...props
}) => {
  return (
    <button
      className={classNames(styles.button, styles[variant], styles[size], { [styles.fullWidth]: fullWidth }, className)}
      {...props}
    >
      {children}
    </button>
  )
}

