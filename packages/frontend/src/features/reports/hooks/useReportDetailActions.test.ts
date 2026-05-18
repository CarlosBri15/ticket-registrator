import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock('@ticket-registrator/shared', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@ticket-registrator/shared')>();
  return {
    ...actual,
    useSubmitReportMutation: vi.fn(),
    useDeleteReportMutation: vi.fn(),
    useUpdateReportStatusMutation: vi.fn(),
  };
});

import {
  useSubmitReportMutation,
  useDeleteReportMutation,
  useUpdateReportStatusMutation,
  ReportStatus,
} from '@ticket-registrator/shared';
import { useReportDetailActions } from './useReportDetailActions';

const setupMutations = () => {
  const submitMutate = vi.fn();
  const deleteMutate = vi.fn();
  const updateStatusMutate = vi.fn();
  let submitOnSuccess: (() => void) | undefined;
  let deleteOnSuccess: (() => void) | undefined;
  let updateOnSuccess: (() => void) | undefined;

  (useSubmitReportMutation as ReturnType<typeof vi.fn>).mockImplementation((opts: any) => {
    submitOnSuccess = opts?.onSuccess;
    return { mutate: submitMutate, isPending: false };
  });
  (useDeleteReportMutation as ReturnType<typeof vi.fn>).mockImplementation((opts: any) => {
    deleteOnSuccess = opts?.onSuccess;
    return { mutate: deleteMutate, isPending: false };
  });
  (useUpdateReportStatusMutation as ReturnType<typeof vi.fn>).mockImplementation((opts: any) => {
    updateOnSuccess = opts?.onSuccess;
    return { mutate: updateStatusMutate, isPending: false };
  });

  return {
    submitMutate,
    deleteMutate,
    updateStatusMutate,
    triggerSubmitSuccess: () => submitOnSuccess?.(),
    triggerDeleteSuccess: () => deleteOnSuccess?.(),
    triggerUpdateSuccess: () => updateOnSuccess?.(),
  };
};

describe('useReportDetailActions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initialises all modal flags to false', () => {
    setupMutations();
    const { result } = renderHook(() => useReportDetailActions('r1'));
    expect(result.current.submitConfirm).toBe(false);
    expect(result.current.deleteConfirm).toBe(false);
    expect(result.current.finishReviewConfirm).toBe(false);
  });

  it('exposes pending flags from mutations', () => {
    (useSubmitReportMutation as ReturnType<typeof vi.fn>).mockReturnValue({ mutate: vi.fn(), isPending: true });
    (useDeleteReportMutation as ReturnType<typeof vi.fn>).mockReturnValue({ mutate: vi.fn(), isPending: true });
    (useUpdateReportStatusMutation as ReturnType<typeof vi.fn>).mockReturnValue({ mutate: vi.fn(), isPending: true });

    const { result } = renderHook(() => useReportDetailActions('r1'));
    expect(result.current.isSubmitting).toBe(true);
    expect(result.current.isDeleting).toBe(true);
    expect(result.current.isFinishingReview).toBe(true);
  });

  it('toggles modal flags via setters', () => {
    setupMutations();
    const { result } = renderHook(() => useReportDetailActions('r1'));

    act(() => result.current.setSubmitConfirm(true));
    expect(result.current.submitConfirm).toBe(true);

    act(() => result.current.setDeleteConfirm(true));
    expect(result.current.deleteConfirm).toBe(true);

    act(() => result.current.setFinishReviewConfirm(true));
    expect(result.current.finishReviewConfirm).toBe(true);
  });

  it('handleSubmit fires submit mutation with the reportId', () => {
    const { submitMutate } = setupMutations();
    const { result } = renderHook(() => useReportDetailActions('r1'));
    act(() => result.current.handleSubmit());
    expect(submitMutate).toHaveBeenCalledWith('r1');
  });

  it('handleDelete fires delete mutation with the reportId', () => {
    const { deleteMutate } = setupMutations();
    const { result } = renderHook(() => useReportDetailActions('r2'));
    act(() => result.current.handleDelete());
    expect(deleteMutate).toHaveBeenCalledWith('r2');
  });

  it('handleFinishReview fires updateStatus with APPROVED — backend will recompute amounts from item statuses', () => {
    const { updateStatusMutate } = setupMutations();
    const { result } = renderHook(() => useReportDetailActions('r3'));
    act(() => result.current.handleFinishReview());
    expect(updateStatusMutate).toHaveBeenCalledWith({ id: 'r3', status: ReportStatus.APPROVED });
  });

  it('closes submit dialog on submit success', () => {
    const { triggerSubmitSuccess } = setupMutations();
    const { result } = renderHook(() => useReportDetailActions('r1'));
    act(() => result.current.setSubmitConfirm(true));
    expect(result.current.submitConfirm).toBe(true);
    act(() => triggerSubmitSuccess());
    expect(result.current.submitConfirm).toBe(false);
  });

  it('closes finish-review dialog on update success', () => {
    const { triggerUpdateSuccess } = setupMutations();
    const { result } = renderHook(() => useReportDetailActions('r1'));
    act(() => result.current.setFinishReviewConfirm(true));
    expect(result.current.finishReviewConfirm).toBe(true);
    act(() => triggerUpdateSuccess());
    expect(result.current.finishReviewConfirm).toBe(false);
  });

  it('navigates to /reports on delete success', () => {
    const { triggerDeleteSuccess } = setupMutations();
    renderHook(() => useReportDetailActions('r1'));
    act(() => triggerDeleteSuccess());
    expect(mockNavigate).toHaveBeenCalledWith('/reports');
  });
});
