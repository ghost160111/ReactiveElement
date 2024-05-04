const clamp = (value: number, min?: number, max?: number): number | undefined => {
  if (min && value < min) {
    return min;
  }

  if (max && value > max) {
    return max;
  }

  if (min && max && min <= value && value <= max) {
    return value;
  }
}

// Defining properties and methods
Math["clamp"] = clamp;
