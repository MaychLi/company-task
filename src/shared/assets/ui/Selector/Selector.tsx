"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import classNames from "classnames"
import styles from "./Selector.module.scss"

interface SelectorOption {
  value: string
  label: string
}

interface SelectorProps {
  options: SelectorOption[]
  value?: string
  onChange: (value: string) => void
  placeholder?: string
  label?: string
  error?: string
  className?: string
}

export const Selector: React.FC<SelectorProps> = ({
  options,
  value,
  onChange,
  placeholder = "Select option",
  label,
  error,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const selectorRef = useRef<HTMLDivElement>(null)

  const selectedOption = options.find((option) => option.value === value)

  const toggleDropdown = () => {
    setIsOpen(!isOpen)
  }

  const handleOptionClick = (optionValue: string) => {
    onChange(optionValue)
    setIsOpen(false)
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectorRef.current && !selectorRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  return (
    <div className={classNames(styles.selectorWrapper, className)}>
      {label && <label className={styles.label}>{label}</label>}
      <div ref={selectorRef} className={classNames(styles.selector, { [styles.selectorError]: error })}>
        <div className={styles.selectorValue} onClick={toggleDropdown}>
          {selectedOption ? selectedOption.label : placeholder}
          <span className={classNames(styles.arrow, { [styles.arrowUp]: isOpen })}>▼</span>
        </div>
        {isOpen && (
          <div className={styles.dropdown}>
            {options.map((option) => (
              <div
                key={option.value}
                className={classNames(styles.option, {
                  [styles.selected]: option.value === value,
                })}
                onClick={() => handleOptionClick(option.value)}
              >
                {option.label}
              </div>
            ))}
          </div>
        )}
      </div>
      {error && <div className={styles.errorMessage}>{error}</div>}
    </div>
  )
}

