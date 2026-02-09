"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { getDimensionFields, type DimensionField } from "@/lib/artwork-constants"

interface ArtworkDimensionsFieldsProps {
  category: string
  dimensions: Record<string, any>
  onDimensionChange: (name: string, value: any) => void
}

export function ArtworkDimensionsFields({
  category,
  dimensions,
  onDimensionChange
}: ArtworkDimensionsFieldsProps) {
  const fields = getDimensionFields(category)

  if (fields.length === 0) {
    return null
  }

  const renderField = (field: DimensionField) => {
    const fieldId = `dimension-${field.name}`
    const value = dimensions[field.name] ?? ""

    switch (field.type) {
      case "number":
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={fieldId}>
              {field.label} {field.required && "*"}
              {field.unit && <span className="text-gray-500 ml-1">({field.unit})</span>}
            </Label>
            <Input
              id={fieldId}
              type="number"
              value={value}
              onChange={(e) => onDimensionChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              required={field.required}
              min={field.min}
              step={field.step}
            />
          </div>
        )

      case "text":
        // Use textarea for longer text fields
        if (field.name.includes("description") || field.name.includes("requirements")) {
          return (
            <div key={field.name} className="space-y-2">
              <Label htmlFor={fieldId}>
                {field.label} {field.required && "*"}
              </Label>
              <Textarea
                id={fieldId}
                value={value}
                onChange={(e) => onDimensionChange(field.name, e.target.value)}
                placeholder={field.placeholder}
                required={field.required}
                rows={3}
              />
            </div>
          )
        }
        
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={fieldId}>
              {field.label} {field.required && "*"}
            </Label>
            <Input
              id={fieldId}
              type="text"
              value={value}
              onChange={(e) => onDimensionChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              required={field.required}
            />
          </div>
        )

      case "checkbox":
        return (
          <div key={field.name} className="flex items-center space-x-2">
            <Checkbox
              id={fieldId}
              checked={!!value}
              onCheckedChange={(checked) => onDimensionChange(field.name, checked)}
            />
            <Label htmlFor={fieldId} className="font-normal cursor-pointer">
              {field.label}
            </Label>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <h3 className="font-semibold text-lg">Dimensioner og specifikationer</h3>
      <div className="space-y-4">
        {fields.map(renderField)}
      </div>
    </div>
  )
}
