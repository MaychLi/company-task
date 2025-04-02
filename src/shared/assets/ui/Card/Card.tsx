import type React from "react"
import classNames from "classnames"
import styles from "./Card.module.scss"

interface CardProps {
  children: React.ReactNode
  className?: string
}

export const Card: React.FC<CardProps> = ({ children, className }) => {
  return <div className={classNames(styles.card, className)}>{children}</div>
}

