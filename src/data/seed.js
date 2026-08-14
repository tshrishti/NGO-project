// UI constants (skills catalog, categories, urgency, map center).
// Demo data itself is seeded server-side in server/db.js.

export const SKILLS = [
  'First Aid', 'Nursing', 'Cooking', 'Food Distribution', 'Driving',
  'Construction', 'Teaching', 'Childcare', 'Counseling', 'Logistics',
  'Translation', 'IT Support',
]

export const CATEGORIES = ['food', 'medical', 'shelter', 'education']
export const URGENCIES = ['low', 'medium', 'high']

// Emoji per category — used for quick visual scanning across the app.
export const CATEGORY_ICONS = {
  food: '🍲',
  medical: '⚕️',
  shelter: '🏠',
  education: '📚',
}

export const CATEGORY_SKILLS = {
  food: ['Cooking', 'Food Distribution', 'Driving', 'Logistics'],
  medical: ['First Aid', 'Nursing', 'Driving', 'Counseling'],
  shelter: ['Construction', 'Logistics', 'Driving'],
  education: ['Teaching', 'Childcare', 'Translation', 'IT Support'],
}

// Default map view (Bengaluru) — matches the server seed center.
export const MAP_CENTER = { lat: 12.9716, lng: 77.5946 }
