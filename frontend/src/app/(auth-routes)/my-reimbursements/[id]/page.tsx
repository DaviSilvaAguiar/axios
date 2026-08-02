import MyReimbursementDetailPage from "@/features/reimbursement/components/MyReimbursementDetailPage";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return <MyReimbursementDetailPage params={params} />;
}
