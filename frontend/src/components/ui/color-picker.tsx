'use client'

import { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'

interface ColorPickerProps {
  label: string
  value: string
  onChange: (color: string) => void
}

const PRESET_COLORS = [
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#f59e0b', // amber
  '#10b981', // emerald
  '#06b6d4', // cyan
  '#f97316', // orange
  '#ef4444', // red
  '#6366f1', // indigo
  '#14b8a6', // teal
]

export function ColorPicker({ label, value, onChange }: ColorPickerProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              type="button"
            >
              <div
                className="w-6 h-6 rounded border"
                style={{ backgroundColor: value }}
              />
              <span className="flex-1 text-left font-mono text-sm">{value}</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64">
            <div className="space-y-3">
              <div className="grid grid-cols-5 gap-2">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className="w-10 h-10 rounded border-2 hover:scale-110 transition-transform"
                    style={{
                      backgroundColor: color,
                      borderColor: value === color ? '#000' : 'transparent',
                    }}
                    onClick={() => {
                      onChange(color)
                      setOpen(false)
                    }}
                  />
                ))}
              </div>
              <div className="space-y-2">
                <Label htmlFor="custom-color">Cor Personalizada</Label>
                <div className="flex gap-2">
                  <Input
                    id="custom-color"
                    type="color"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-14 h-10 p-1 cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={value}
                    onChange={(e) => {
                      const val = e.target.value
                      if (/^#[0-9A-Fa-f]{0,6}$/.test(val)) {
                        onChange(val)
                      }
                    }}
                    placeholder="#000000"
                    className="flex-1 font-mono"
                  />
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}
