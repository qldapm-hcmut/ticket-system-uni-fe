import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query';
import { isApiError } from './apiError';
import { toast } from './toast';

/** Có nên retry lỗi này không: chỉ retry lỗi mạng / 5xx. */
function isRetriable(error) {
  if (isApiError(error) && typeof error.status === 'number') {
    return error.status >= 500;
  }
  return true; // lỗi mạng (không có status)
}

/**
 * QueryClient + xử lý lỗi tập trung (A28).
 * - Query: chỉ toast với lỗi bất ngờ (mạng/5xx); lỗi nghiệp vụ 4xx để màn hình tự hiển thị inline.
 * - Mutation: mặc định toast theo error.code; tắt bằng meta.skipGlobalError = true.
 */
export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      if (isRetriable(error)) toast.apiError(error);
    },
  }),
  mutationCache: new MutationCache({
    onError: (error, _vars, _ctx, mutation) => {
      if (mutation.meta?.skipGlobalError) return;
      toast.apiError(error);
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => (isRetriable(error) ? failureCount < 1 : false),
    },
    mutations: {
      retry: false,
    },
  },
});
