import { Recipe } from '../types/recipe'

export const sampleRecipes: Recipe[] = [
  {
    id: 'recipe-1',
    title: 'Creamy Mushroom Pasta',
    description: 'A rich and creamy pasta dish with sautéed mushrooms and garlic, perfect for a quick weeknight dinner.',
    imageUrl: 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=400&h=300&fit=crop',
    totalTime: 25,
    prepTime: 10,
    cookTime: 15,
    servings: 4,
    difficulty: 'easy',
    budgetLevel: 'medium',
    dietaryTags: ['vegetarian'],
    requiredIngredients: ['pasta', 'mushrooms', 'cream', 'garlic'],
    ingredients: [
      { name: 'pasta', amount: '12 oz', unit: 'oz' },
      { name: 'mushrooms', amount: '8 oz', unit: 'oz' },
      { name: 'heavy cream', amount: '1 cup', unit: 'cup' },
      { name: 'garlic', amount: '3 cloves', unit: 'cloves' },
      { name: 'butter', amount: '2 tbsp', unit: 'tbsp' },
      { name: 'parmesan cheese', amount: '1/2 cup', unit: 'cup' }
    ],
    instructions: [
      'Cook pasta according to package directions until al dente.',
      'While pasta cooks, slice mushrooms and mince garlic.',
      'In a large skillet, melt butter over medium-high heat.',
      'Add mushrooms and cook until golden brown, about 5 minutes.',
      'Add garlic and cook for 1 minute until fragrant.',
      'Pour in cream and simmer for 3-4 minutes until slightly thickened.',
      'Drain pasta and add to the skillet with mushroom cream sauce.',
      'Toss to combine and add parmesan cheese.',
      'Season with salt and pepper to taste and serve immediately.'
    ],
    nutritionInfo: {
      calories: 485,
      protein: 18,
      carbs: 52,
      fat: 24
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'recipe-2',
    title: 'Chicken Stir Fry',
    description: 'Quick and healthy chicken stir fry with fresh vegetables and a savory sauce.',
    imageUrl: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=300&fit=crop',
    totalTime: 20,
    prepTime: 10,
    cookTime: 10,
    servings: 3,
    difficulty: 'medium',
    budgetLevel: 'medium',
    dietaryTags: ['high-protein', 'gluten-free'],
    requiredIngredients: ['chicken', 'vegetables', 'soy sauce', 'garlic'],
    ingredients: [
      { name: 'chicken breast', amount: '1 lb', unit: 'lb' },
      { name: 'bell peppers', amount: '2', unit: 'pieces' },
      { name: 'broccoli', amount: '2 cups', unit: 'cups' },
      { name: 'soy sauce', amount: '3 tbsp', unit: 'tbsp' },
      { name: 'garlic', amount: '2 cloves', unit: 'cloves' },
      { name: 'vegetable oil', amount: '2 tbsp', unit: 'tbsp' }
    ],
    instructions: [
      'Cut chicken into bite-sized pieces and season with salt and pepper.',
      'Heat oil in a wok or large skillet over high heat.',
      'Add chicken and stir-fry until cooked through, about 5 minutes.',
      'Remove chicken and set aside.',
      'Add vegetables to the same pan and stir-fry for 3-4 minutes.',
      'Add garlic and cook for 30 seconds.',
      'Return chicken to pan and add soy sauce.',
      'Stir everything together and cook for 1 more minute.',
      'Serve immediately over rice or noodles.'
    ],
    nutritionInfo: {
      calories: 320,
      protein: 35,
      carbs: 12,
      fat: 14
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'recipe-3',
    title: 'Tomato Basil Soup',
    description: 'Comforting homemade tomato soup with fresh basil and a touch of cream.',
    imageUrl: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=300&fit=crop',
    totalTime: 35,
    prepTime: 10,
    cookTime: 25,
    servings: 4,
    difficulty: 'easy',
    budgetLevel: 'low',
    dietaryTags: ['vegetarian', 'gluten-free'],
    requiredIngredients: ['tomatoes', 'basil', 'onion', 'cream'],
    ingredients: [
      { name: 'canned tomatoes', amount: '28 oz', unit: 'oz' },
      { name: 'fresh basil', amount: '1/4 cup', unit: 'cup' },
      { name: 'onion', amount: '1 medium', unit: 'piece' },
      { name: 'heavy cream', amount: '1/2 cup', unit: 'cup' },
      { name: 'vegetable broth', amount: '2 cups', unit: 'cups' },
      { name: 'olive oil', amount: '2 tbsp', unit: 'tbsp' }
    ],
    instructions: [
      'Heat olive oil in a large pot over medium heat.',
      'Add diced onion and cook until translucent, about 5 minutes.',
      'Add canned tomatoes and vegetable broth.',
      'Bring to a boil, then reduce heat and simmer for 20 minutes.',
      'Remove from heat and blend until smooth using an immersion blender.',
      'Stir in cream and fresh basil.',
      'Season with salt and pepper to taste.',
      'Serve hot with crusty bread.'
    ],
    nutritionInfo: {
      calories: 180,
      protein: 4,
      carbs: 16,
      fat: 12
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'recipe-4',
    title: 'Quinoa Buddha Bowl',
    description: 'Nutritious and colorful bowl with quinoa, roasted vegetables, and tahini dressing.',
    imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop',
    totalTime: 40,
    prepTime: 15,
    cookTime: 25,
    servings: 2,
    difficulty: 'medium',
    budgetLevel: 'medium',
    dietaryTags: ['vegan', 'gluten-free', 'high-protein'],
    requiredIngredients: ['quinoa', 'sweet potato', 'chickpeas', 'spinach'],
    ingredients: [
      { name: 'quinoa', amount: '1 cup', unit: 'cup' },
      { name: 'sweet potato', amount: '1 large', unit: 'piece' },
      { name: 'chickpeas', amount: '1 can', unit: 'can' },
      { name: 'fresh spinach', amount: '2 cups', unit: 'cups' },
      { name: 'tahini', amount: '3 tbsp', unit: 'tbsp' },
      { name: 'lemon juice', amount: '2 tbsp', unit: 'tbsp' }
    ],
    instructions: [
      'Preheat oven to 400°F (200°C).',
      'Cook quinoa according to package instructions.',
      'Cube sweet potato and roast for 25 minutes until tender.',
      'Drain and rinse chickpeas, then roast for 15 minutes.',
      'Whisk together tahini, lemon juice, and water for dressing.',
      'Arrange quinoa, roasted vegetables, and spinach in bowls.',
      'Drizzle with tahini dressing and serve.'
    ],
    nutritionInfo: {
      calories: 520,
      protein: 20,
      carbs: 78,
      fat: 16
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'recipe-5',
    title: 'Beef Tacos',
    description: 'Flavorful ground beef tacos with fresh toppings and homemade salsa.',
    imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop',
    totalTime: 30,
    prepTime: 15,
    cookTime: 15,
    servings: 4,
    difficulty: 'easy',
    budgetLevel: 'medium',
    dietaryTags: ['high-protein'],
    requiredIngredients: ['ground beef', 'tortillas', 'tomatoes', 'onion'],
    ingredients: [
      { name: 'ground beef', amount: '1 lb', unit: 'lb' },
      { name: 'corn tortillas', amount: '8', unit: 'pieces' },
      { name: 'tomatoes', amount: '2 medium', unit: 'pieces' },
      { name: 'white onion', amount: '1 small', unit: 'piece' },
      { name: 'lettuce', amount: '2 cups', unit: 'cups' },
      { name: 'cheese', amount: '1 cup', unit: 'cup' }
    ],
    instructions: [
      'Brown ground beef in a large skillet over medium-high heat.',
      'Season with cumin, chili powder, salt, and pepper.',
      'Warm tortillas in a dry skillet or microwave.',
      'Dice tomatoes and onion for fresh salsa.',
      'Shred lettuce and grate cheese.',
      'Assemble tacos with beef and desired toppings.',
      'Serve with lime wedges and hot sauce.'
    ],
    nutritionInfo: {
      calories: 380,
      protein: 28,
      carbs: 24,
      fat: 20
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
]

export const commonIngredients = [
  'chicken', 'beef', 'pork', 'fish', 'eggs',
  'pasta', 'rice', 'quinoa', 'bread', 'potatoes',
  'tomatoes', 'onions', 'garlic', 'bell peppers', 'mushrooms',
  'spinach', 'broccoli', 'carrots', 'lettuce', 'cucumber',
  'cheese', 'milk', 'butter', 'cream', 'yogurt',
  'olive oil', 'salt', 'pepper', 'herbs', 'spices'
]