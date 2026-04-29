import {
  STATUS_OPTIONS,
  ACTIVE_STATUSES,
  PENDING_STATUSES,
  COMPLETED_STATUSES,
  isCurrentReport,
} from './statuses';

describe('STATUS_OPTIONS', () => {
  it('contains ALL and the six lifecycle values', () => {
    expect(STATUS_OPTIONS).toContain('ALL');
    expect(STATUS_OPTIONS).toContain('CREATED');
    expect(STATUS_OPTIONS).toContain('DRAFT');
    expect(STATUS_OPTIONS).toContain('PENDING');
    expect(STATUS_OPTIONS).toContain('SUBMITTED');
    expect(STATUS_OPTIONS).toContain('APPROVED');
    expect(STATUS_OPTIONS).toContain('DECLINED');
    expect(STATUS_OPTIONS).toHaveLength(7);
  });
});

describe('ACTIVE_STATUSES', () => {
  it('includes in-progress statuses', () => {
    expect(ACTIVE_STATUSES.has('CREATED')).toBe(true);
    expect(ACTIVE_STATUSES.has('DRAFT')).toBe(true);
    expect(ACTIVE_STATUSES.has('PENDING')).toBe(true);
    expect(ACTIVE_STATUSES.has('SUBMITTED')).toBe(true);
  });

  it('does not include terminal statuses', () => {
    expect(ACTIVE_STATUSES.has('APPROVED')).toBe(false);
    expect(ACTIVE_STATUSES.has('DECLINED')).toBe(false);
  });
});

describe('PENDING_STATUSES', () => {
  it('includes pre-submission statuses', () => {
    expect(PENDING_STATUSES.has('CREATED')).toBe(true);
    expect(PENDING_STATUSES.has('DRAFT')).toBe(true);
  });

  it('does not include submitted/approved statuses', () => {
    expect(PENDING_STATUSES.has('SUBMITTED')).toBe(false);
    expect(PENDING_STATUSES.has('APPROVED')).toBe(false);
  });
});

describe('COMPLETED_STATUSES', () => {
  it('includes terminal statuses', () => {
    expect(COMPLETED_STATUSES.has('APPROVED')).toBe(true);
    expect(COMPLETED_STATUSES.has('PAID')).toBe(true);
    expect(COMPLETED_STATUSES.has('REJECTED')).toBe(true);
    expect(COMPLETED_STATUSES.has('DECLINED')).toBe(true);
  });

  it('does not include active statuses', () => {
    expect(COMPLETED_STATUSES.has('CREATED')).toBe(false);
    expect(COMPLETED_STATUSES.has('SUBMITTED')).toBe(false);
  });
});

describe('isCurrentReport', () => {
  const fmt = (d: Date) => d.toISOString().split('T')[0];

  it('returns true when today is within the range', () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    expect(isCurrentReport({ start_date: fmt(yesterday), end_date: fmt(tomorrow) })).toBe(true);
  });

  it('returns false when today is before start_date', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date();
    dayAfter.setDate(dayAfter.getDate() + 2);

    expect(isCurrentReport({ start_date: fmt(tomorrow), end_date: fmt(dayAfter) })).toBe(false);
  });

  it('returns false when today is after end_date', () => {
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    expect(isCurrentReport({ start_date: fmt(twoDaysAgo), end_date: fmt(yesterday) })).toBe(false);
  });

  it('returns true when start_date equals today', () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    expect(isCurrentReport({ start_date: fmt(today), end_date: fmt(tomorrow) })).toBe(true);
  });

  it('returns true when end_date equals today', () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    expect(isCurrentReport({ start_date: fmt(yesterday), end_date: fmt(today) })).toBe(true);
  });
});
