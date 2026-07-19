import FundStatement from "@/features/fund/components/FundStatement";

export default async function FundDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <FundStatement fundId={Number(id)} />;
}
