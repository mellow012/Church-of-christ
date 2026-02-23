import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getMemberById } from '@/lib/queries';
import { getFullName } from '@/lib/utils';
import { MemberDetailView } from '@/components/member-details/MemberDetailView';

// Next.js 15: params is now a Promise — must be awaited before use
type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const member = await getMemberById(id);
  if (!member) return { title: 'Member Not Found' };
  return { title: getFullName(member) };
}

export default async function MemberDetailPage({ params }: Props) {
  const { id } = await params;
  const member = await getMemberById(id);
  if (!member) notFound();

  return <MemberDetailView member={member} />;
}