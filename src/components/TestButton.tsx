import React from 'react'

export function TestButton() {
  const handleClick = () => {
    console.log('Button clicked!')
    alert('Button works!')
  }

  return (
    <div className="p-4">
      <button 
        onClick={handleClick}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        style={{ zIndex: 9999, position: 'relative' }}
      >
        Test Button
      </button>
    </div>
  )
}