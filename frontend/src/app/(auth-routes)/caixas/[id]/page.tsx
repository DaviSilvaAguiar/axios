import ExtratoCaixa from "@/features/caixa-conta/components/ExtratoCaixa";

export default async function CaixaDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ExtratoCaixa idCaixa={Number(id)} />;
}
