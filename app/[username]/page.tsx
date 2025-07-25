'use client';
import { useMe } from '@/hooks/useMe';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
export const runtime = 'edge';


export default function UserPage() {
  const { user, isLoading } = useMe();
  const params = useParams();
  const router = useRouter();
  const routeUsername = params.username;

  // Redirect if logged in user does not match route username
  useEffect(() => {
    if (!isLoading && user && user.email) {
      const userName = user.email.split('@')[0];
      if (userName !== routeUsername) {
        router.replace(`/${userName}`);
      }
    }
  }, [isLoading, user, routeUsername, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="mb-4">Don&apos;t have an account?</p>
        <Link href={`/login?next=/${routeUsername}`}>
          <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Log in here
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">{user.email?.split('@')[0]}</h1>
      <p className="text-gray-600">{user.email}</p>
      {/* Portfolio and other user details here */}
    </div>
  );
}