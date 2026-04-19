import { SchemaType, type ObjectSchema } from '@google/generative-ai';

export const receiptSchema = {
  type: SchemaType.OBJECT,
  properties: {
    // nullable: model must return null when name is not visible on the receipt
    establishment: { type: SchemaType.STRING, nullable: true },

    // nullable: model must return null when address is not visible
    address: {
      type: SchemaType.OBJECT,
      nullable: true,
      properties: {
        street: { type: SchemaType.STRING, nullable: true },
        number: { type: SchemaType.STRING, nullable: true },
        zip_code: { type: SchemaType.STRING, nullable: true },
        city: { type: SchemaType.STRING, nullable: true },
        formatted_address: { type: SchemaType.STRING, nullable: true },
      },
      required: ['street', 'number', 'zip_code', 'city', 'formatted_address'],
    },

    // nullable: model must return null when date/time cannot be read
    date: { type: SchemaType.STRING, nullable: true },
    time: { type: SchemaType.STRING, nullable: true },

    payment_method: { type: SchemaType.STRING, nullable: true },

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
          category: { type: SchemaType.STRING, nullable: true },
        },
        required: ['description', 'price', 'category'],
      },
    },

    total: { type: SchemaType.NUMBER, nullable: true },

    flag: { type: SchemaType.BOOLEAN },
    llm_comment: {
      type: SchemaType.STRING,
      nullable: true,
    },
  },

  required: [
    'establishment',
    'address',
    'date',
    'time',
    'payment_method',
    'items',
    'total',
    'flag',
  ],
} satisfies ObjectSchema;
