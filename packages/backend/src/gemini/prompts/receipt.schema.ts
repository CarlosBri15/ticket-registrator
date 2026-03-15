import { SchemaType, type ObjectSchema } from '@google/generative-ai';

export const receiptSchema = {
  type: SchemaType.OBJECT,
  properties: {
    establishment: { type: SchemaType.STRING },

    address: {
      type: SchemaType.OBJECT,
      properties: {
        street: { type: SchemaType.STRING },
        number: { type: SchemaType.STRING },
        zip_code: { type: SchemaType.STRING },
        city: { type: SchemaType.STRING },
        formatted_address: { type: SchemaType.STRING },
      },
      required: ['street', 'number', 'zip_code', 'city', 'formatted_address'],
    },

    date: { type: SchemaType.STRING },
    time: { type: SchemaType.STRING },
    payment_method: { type: SchemaType.STRING },

    card_last_4: {
      type: SchemaType.STRING,
      nullable: true,
    },

    items: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          description: { type: SchemaType.STRING },
          price: { type: SchemaType.NUMBER },
        },
        required: ['description', 'price'],
      },
    },

    total: { type: SchemaType.NUMBER },
  },

  required: [
    'establishment',
    'address',
    'date',
    'time',
    'payment_method',
    'items',
    'total',
  ],
} satisfies ObjectSchema;
