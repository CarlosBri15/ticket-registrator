import { mapTicketToITicket } from './ticket.mapper';
import {
  TicketStatus,
  TicketLifecycle,
  ItemStatus,
} from '@ticket-registrator/shared';

describe('mapTicketToITicket', () => {
  const now = new Date('2024-05-10T09:00:00.000Z');

  const baseTicket = {
    id: 'ticket-1',
    reportId: 'report-1',
    status: TicketStatus.PENDING,
    lifecycle: TicketLifecycle.DRAFT,
    version: 1,
    cgsBucketLink: 'receipt.jpg',
    paymentType: 'credit_card',
    date: now,
    locationName: 'Coffee Shop',
    locationAddress: '123 Main St',
    amount: 10.5,
    currency: 'USD',
    convertedAmount: 9.8,
    convertedCurrency: 'EUR',
    cgsBucketLinkJustification: null,
    lastFourDigits: '1234',
    imageId: 'image-1',
    llmApprovedPercentage: null,
    llmRecommendation: null,
    llmSuggestedAmount: null,
    llmSuggestedCurrency: null,
    approvedAmount: 0,
    flag: false,
    llmComment: null,
    deletedAt: null,
    createdAt: now,
    updatedAt: now,
  };

  it('should map all scalar fields correctly', () => {
    const result = mapTicketToITicket({ ...baseTicket, items: [] } as any);

    expect(result.id).toBe('ticket-1');
    expect(result.report_id).toBe('report-1');
    expect(result.status).toBe(TicketStatus.PENDING);
    expect(result.lifecycle).toBe(TicketLifecycle.DRAFT);
    expect(result.version).toBe(1);
    expect(result.cgs_bucket_link).toBe('receipt.jpg');
    expect(result.payment_type).toBe('credit_card');
    expect(result.location_name).toBe('Coffee Shop');
    expect(result.location_address).toBe('123 Main St');
    expect(result.amount).toBe(10.5);
    expect(result.currency).toBe('USD');
    expect(result.converted_amount).toBe(9.8);
    expect(result.converted_currency).toBe('EUR');
    expect(result.last_four_digits).toBe('1234');
  });

  it('should convert date to ISO string', () => {
    const result = mapTicketToITicket({ ...baseTicket, items: [] } as any);
    expect(result.date).toBe(now.toISOString());
  });

  it('should return null for date when it is null', () => {
    const result = mapTicketToITicket({
      ...baseTicket,
      date: null,
      items: [],
    } as any);
    expect(result.date).toBeNull();
  });

  it('should map llm_comment correctly', () => {
    const result = mapTicketToITicket({
      ...baseTicket,
      llmComment: 'No se pudo detectar el importe total',
      items: [],
    } as any);
    expect(result.llm_comment).toBe('No se pudo detectar el importe total');
  });

  it('should return null for llm_comment when llmComment is null', () => {
    const result = mapTicketToITicket({
      ...baseTicket,
      llmComment: null,
      items: [],
    } as any);
    expect(result.llm_comment).toBeNull();
  });

  it('should convert createdAt to ISO string', () => {
    const result = mapTicketToITicket({ ...baseTicket, items: [] } as any);
    expect(result.createdAt).toBe(now.toISOString());
  });

  it('should convert updatedAt to ISO string', () => {
    const result = mapTicketToITicket({ ...baseTicket, items: [] } as any);
    expect(result.updatedAt).toBe(now.toISOString());
  });

  it('should map items correctly', () => {
    const items = [
      {
        id: 'item-1',
        ticketId: 'ticket-1',
        name: 'Coffee',
        amount: 4.5,
        currency: 'USD',
        status: ItemStatus.PENDING,
        categoryId: 'cat-1',
        category: { id: 'cat-1', name: 'Travel' },
        createdAt: now,
        updatedAt: now,
      },
    ];

    const result = mapTicketToITicket({ ...baseTicket, items } as any);

    expect(result.items).toHaveLength(1);
    expect(result.items![0]).toEqual({
      id: 'item-1',
      name: 'Coffee',
      amount: 4.5,
      currency: 'USD',
      status: ItemStatus.PENDING,
      categoryId: 'cat-1',
      categoryName: 'Travel',
    });
  });

  it('should map multiple items correctly', () => {
    const items = [
      {
        id: 'item-1',
        ticketId: 'ticket-1',
        name: 'Coffee',
        amount: 4.5,
        currency: 'USD',
        status: ItemStatus.PENDING,
        categoryId: 'cat-1',
        category: { id: 'cat-1', name: 'Travel' },
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'item-2',
        ticketId: 'ticket-1',
        name: 'Taxi',
        amount: 12.0,
        currency: 'USD',
        status: ItemStatus.APPROVED,
        categoryId: 'cat-2',
        category: { id: 'cat-2', name: 'Taxi' },
        createdAt: now,
        updatedAt: now,
      },
    ];

    const result = mapTicketToITicket({ ...baseTicket, items } as any);

    expect(result.items).toHaveLength(2);
    expect(result.items![1].id).toBe('item-2');
    expect(result.items![1].status).toBe(ItemStatus.APPROVED);
    expect(result.items![1].categoryName).toBe('Taxi');
  });

  it('should not expose internal DB fields (reportId, cgsBucketLink as camelCase)', () => {
    const result = mapTicketToITicket({ ...baseTicket, items: [] } as any);
    expect(result).not.toHaveProperty('reportId');
    expect(result).not.toHaveProperty('cgsBucketLink');
    expect(result).not.toHaveProperty('paymentType');
  });
});
