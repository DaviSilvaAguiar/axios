import MyExpenseReportDetailPage from "@/features/expense-report/components/MyExpenseReportDetailPage";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return <MyExpenseReportDetailPage params={params} />;
}
