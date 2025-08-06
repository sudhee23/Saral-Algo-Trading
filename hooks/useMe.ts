import useSWR from 'swr';

interface User {
  id?: string;
  email?: string;
  name?: string;
  // add other fields if your user table has them
}

async function fetcher(url: string): Promise<{ user: User | null }> {
  const res = await fetch(url, {
    credentials: 'include', // important: send cookies!
  });
  if (!res.ok) {
    return { user: null }; // treat as logged out
  }
  if (res.status != 200) {
    // Treat as not logged in, without error
    return { user: null };
  }
  if (res && res.status === 200)
    return res.json();
  return { user: null };
}

export function useMe() {
  const { data, error, isLoading } = useSWR('/api/auth/me', fetcher);

  return {
    user: data?.user ?? null,
    isLoading,
    isError: !!error,
  };
}
