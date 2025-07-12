// Common Input Component
import React from 'react'

interface InputProps {
  id?: string
  name?: string
  type?: 'text' | 'email' | 'password' | 'number' | 'tel'
  placeholder?: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void
  required?: boolean
  disabled?: boolean
  className?: string
  label?: string
  error?: string
}

const Input: React.FC<InputProps> = ({
  id,
  name,
  type = 'text',
  placeholder,
  value,
  onChange,
  onBlur,
  required = false,
  disabled = false,
  className = '',
  label,
  error
}) => {
  const inputClasses = `w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
    error ? 'border-red-500' : ''
  } ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''} ${className}`

  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 mr-1">*</span>}
        </label>
      )}
      <input
        id={id}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        required={required}
        disabled={disabled}
        className={inputClasses}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}

export default Input
