"use client"

import * as React from "react"
import { motion } from "framer-motion"

interface SwitchProps {
    checked: boolean
    onCheckedChange: (checked: boolean) => void
    disabled?: boolean
}

export function Switch({ checked, onCheckedChange, disabled }: SwitchProps) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            disabled={disabled}
            onClick={() => onCheckedChange(!checked)}
            className={`
        relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full 
        transition-colors duration-200 outline-none
        ${checked ? 'bg-purple-600' : 'bg-zinc-800'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
        >
            <motion.span
                animate={{ x: checked ? 20 : 4 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className="pointer-events-none block h-4 w-4 rounded-full bg-white shadow-lg ring-0"
            />
        </button>
    )
}
