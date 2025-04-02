import type React from "react"
import type { InputHTMLAttributes } from "react"
import classNames from "classnames"
import styles from "./Input.module.scss"

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  className?: string
}

export const Input: React.FC<InputProps> = ({ label, error, className, ...props }) => {
  return (
    <div className={classNames(styles.inputWrapper, className)}>
      {label && <label className={styles.label}>{label}</label>}
      <input className={classNames(styles.input, { [styles.inputError]: error })} {...props} />
      {error && <div className={styles.errorMessage}>{error}</div>}
    </div>
  )
}

