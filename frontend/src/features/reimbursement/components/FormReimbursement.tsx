"use client";

import { useEffect, useRef, useState } from "react";
import { Controller, useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash, X, Receipt, Paperclip, CaretDown, CaretUp } from "@phosphor-icons/react";
import { AnimatePresence, motion } from "framer-motion";
import Button from "@/ui/Button";
import Input from "@/ui/Input";
import InputMonetario from "@/ui/InputMonetario";
import DatePicker from "@/ui/DatePicker";
import Combobox from "@/ui/Combobox";
import Checkbox from "@/ui/Checkbox";
import Modal from "@/ui/Modal";
import EmptyState from "@/ui/EmptyState";
import { useAuth } from "@/contexts/AuthContext";
import { useConfigs } from "@/contexts/ConfigContext";
import CampoLocalizacao from "@/features/geolocalizacao/components/CampoLocalizacao";
import SecaoFornecedor from "@/features/fornecedor/components/SecaoFornecedor";
import { listarCentrosCustoApi, listarCategoriasDespesaApi } from "../rcm.api";
import { listarUsuariosApi } from "@/features/usuario/usuario.api";
import {
  storeRcmWithDespesasFormSchema,
  type CentroDeCusto,
  type CategoriaDespesa,
  type Rcm,
  type StoreRcmWithDespesasFormData,
} from "../rcm.types";
import type { Usuario } from "@/features/auth/auth.types";
import { maskBanco, maskAgencia, maskConta, maskCpfCnpj } from "@/lib/masks";
import { EMAIL_REGEX } from "@/lib/validators";
import {
  type TipoChavePix,
  TIPO_CHAVE_PIX_OPTIONS,
  TIPO_CHAVE_PIX_PLACEHOLDER,
  aplicarMascaraChavePix,
  inferirTipoChavePix,
  isTipoChavePix,
} from "@/lib/pix";
import { toast } from "@/lib/toast";

type FormData = StoreRcmWithDespesasFormData;

export type AnexoParaAdicionar = { idDespesa: number; file: File };
export type AnexoParaDeletar = { idDespesa: number; idAnexo: number };

interface Props {
  rcmInicial?: Rcm;
  onSalvar: (
    dados: FormData,
    deletarDespesaIds: number[],
    deletarAnexos: AnexoParaDeletar[],
    adicionarAnexos: AnexoParaAdicionar[]
  ) => Promise<void>;
  onFechar: () => void;
  pageMode?: boolean;
}

export default function FormRcm({ rcmInicial, onSalvar, onFechar, pageMode = false }: Props) {
  const { usuario } = useAuth();
  const { isHabilitada } = useConfigs();
  const geolocalizacaoHabilitada = isHabilitada("habilitar_geolocalizacao_despesa_rcm");
  const [centrosCusto, setCentrosCusto] = useState<CentroDeCusto[]>([]);
  const [categorias, setCategorias] = useState<CategoriaDespesa[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [deletarIds, setDeletarIds] = useState<number[]>([]);
  const [anexosParaDeletar, setAnexosParaDeletar] = useState<AnexoParaDeletar[]>([]);
  const [anexosParaAdicionar, setAnexosParaAdicionar] = useState<AnexoParaAdicionar[]>([]);

  const [colaboradorCadastrado, setColaboradorCadastrado] = useState<boolean>(
    !!rcmInicial?.id_usuario_requisitante,
  );
  const [showBancarios, setShowBancarios] = useState(false);
  const [tipoChavePix, setTipoChavePix] = useState<TipoChavePix | null>(
    rcmInicial?.chave_pix ? inferirTipoChavePix(rcmInicial.chave_pix) : null,
  );
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    setError,
    clearErrors,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<FormData>({
    resolver: zodResolver(storeRcmWithDespesasFormSchema),
    defaultValues: rcmInicial
      ? {
        titulo: rcmInicial.titulo,
        id_centro_custo: rcmInicial.id_centro_custo ? String(rcmInicial.id_centro_custo) : "",
        nome_solicitante: rcmInicial.nome_solicitante ?? "",
        cpf_cnpj_solicitante: rcmInicial.cpf_cnpj_solicitante ?? "",
        setor_requisitante: rcmInicial.setor_requisitante ?? "",
        id_usuario_requisitante: rcmInicial.id_usuario_requisitante
          ? String(rcmInicial.id_usuario_requisitante)
          : "",
        obs: rcmInicial.obs ?? "",
        data_inicio_periodo: rcmInicial.data_inicio_periodo.split("T")[0],
        data_fim_periodo: rcmInicial.data_fim_periodo.split("T")[0],
        banco: rcmInicial.banco ?? "",
        agencia: rcmInicial.agencia ?? "",
        numero_banco: rcmInicial.numero_banco ?? "",
        chave_pix: rcmInicial.chave_pix ?? "",
        despesas: rcmInicial.despesas?.map((d) => ({
          despesaId: d.id,
          data_despesa: d.data_despesa.split("T")[0],
          valor: d.valor,
          id_centro_custo: String(d.id_centro_custo),
          descricao: d.descricao,
          id_categoria_despesa: d.id_categoria_despesa ? String(d.id_categoria_despesa) : "",
          latitude:  d.latitude  != null ? Number(d.latitude)  : null,
          longitude: d.longitude != null ? Number(d.longitude) : null,
          endereco:  d.endereco ?? null,
          descricao_fornecedor: d.descricao_fornecedor ?? "",
          cpf_cnpj_fornecedor:  d.cpf_cnpj_fornecedor  ?? "",
          id_fornecedor:        d.id_fornecedor ? String(d.id_fornecedor) : "",
        })) ?? [],
      }
      : {
        titulo: pageMode
          ? `Obra - ${new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" })}`
          : "",
        id_centro_custo: "",
        nome_solicitante: usuario?.nome ?? "",
        cpf_cnpj_solicitante: usuario?.cpf_cnpj ?? "",
        setor_requisitante: "",
        id_usuario_requisitante: "",
        obs: "",
        data_inicio_periodo: "",
        data_fim_periodo: "",
        banco: "",
        agencia: "",
        numero_banco: "",
        chave_pix: "",
        despesas: [],
      },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "despesas" });

  useEffect(() => {
    listarCentrosCustoApi(1, 1000).then((r) => setCentrosCusto(r.data)).catch(() => { });
    listarCategoriasDespesaApi(1, 1000).then((r) => setCategorias(r.data.filter((c) => c.ativo))).catch(() => { });
    listarUsuariosApi(1, 200).then((r) => setUsuarios(r.data.filter((u) => u.ativo))).catch(() => { });
  }, []);

  const idUsuarioRequisitante = watch("id_usuario_requisitante");

  function handleSelecionarColaborador(idStr: string) {
    setValue("id_usuario_requisitante", idStr, { shouldValidate: true });
    const u = usuarios.find((x) => String(x.id) === idStr);
    if (u) {
      setValue("nome_solicitante", u.nome, { shouldValidate: true });
      setValue("cpf_cnpj_solicitante", u.cpf_cnpj ?? "", { shouldValidate: true });
    }
  }

  function handleToggleColaborador(flag: boolean) {
    setColaboradorCadastrado(flag);
    if (!flag) {
      setValue("id_usuario_requisitante", "", { shouldValidate: true });
    }
  }

  function handleRemoveDespesa(idx: number) {
    const despesaId = fields[idx].despesaId;
    if (despesaId) {
      setDeletarIds((prev) => [...prev, despesaId]);
      setAnexosParaDeletar((prev) => prev.filter((a) => a.idDespesa !== despesaId));
      setAnexosParaAdicionar((prev) => prev.filter((a) => a.idDespesa !== despesaId));
    }
    remove(idx);
  }

  function adicionarDespesa() {
    append({
      data_despesa: "",
      valor: "",
      id_centro_custo: "",
      descricao: "",
      id_categoria_despesa: "",
      latitude:  null,
      longitude: null,
      endereco:  null,
      descricao_fornecedor: "",
      cpf_cnpj_fornecedor:  "",
      id_fornecedor:        "",
    });
  }

  function marcarDeletarAnexo(despesaId: number, idAnexo: number) {
    setAnexosParaDeletar((prev) => [...prev, { idDespesa: despesaId, idAnexo }]);
  }

  function desfazerDeletarAnexo(idAnexo: number) {
    setAnexosParaDeletar((prev) => prev.filter((a) => a.idAnexo !== idAnexo));
  }

  function marcarAdicionarAnexo(despesaId: number, file: File) {
    setAnexosParaAdicionar((prev) => [...prev, { idDespesa: despesaId, file }]);
  }

  function cancelarAdicionarAnexo(despesaId: number, file: File) {
    setAnexosParaAdicionar((prev) => prev.filter((a) => !(a.idDespesa === despesaId && a.file === file)));
  }

  const centrosCustoOptions = centrosCusto.map((cc) => ({
    value: String(cc.id),
    label: cc.descricao,
  }));

  const categoriasOptions = categorias.map((cat) => ({
    value: String(cat.id),
    label: cat.descricao,
  }));

  const despesasWatch = watch("despesas");
  const totalGastos = despesasWatch.reduce((acc, d) => acc + (parseFloat(d.valor) || 0), 0);
  const fmtTotalGastos = totalGastos.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const inner = (
    <>
      <div className="px-4 py-4 sm:px-6 sm:py-5">
        {/* Header — apenas modo modal */}
        {!pageMode && (
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-feature-title text-app-text">
              {rcmInicial ? "Editar Solicitação" : "Nova Solicitação de Reembolso"}
            </h1>
            <button
              onClick={onFechar}
              className="rounded-full p-2 text-app-text-muted hover:bg-app-hover"
            >
              <X size={20} />
            </button>
          </div>
        )}

        <form
          onSubmit={handleSubmit(
            async (dados) => {
              await onSalvar(dados, deletarIds, anexosParaDeletar, anexosParaAdicionar);
            },
            (errs) => {
              const msg =
                errs.despesas?.root?.message ??
                (errs.despesas as { message?: string } | undefined)?.message;
              toast.error(msg ?? "Verifique os campos do formulário.");
            },
          )}
          className="space-y-4"
        >
          {/* Dados da Solicitação */}
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.05 }}
            className="rounded-2xl border border-app-border bg-app-surface-raised/40 p-4 sm:p-5 space-y-4"
          >
            <h2 className="text-caption font-semibold text-app-text-muted uppercase tracking-wide">
              Dados da Solicitação
            </h2>

            <Input
              label="Título"
              placeholder="Ex: Viagem São Paulo — Agosto 2025"
              error={errors.titulo?.message}
              {...register("titulo")}
              maxLength={255}
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-caption font-semibold text-app-text-muted">
                Centro de Custo
              </label>
              <Controller
                name="id_centro_custo"
                control={control}
                render={({ field }) => (
                  <Combobox
                    options={centrosCustoOptions}
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    placeholder="Selecione…"
                    emptyMessage="Nenhum centro de custo."
                    className="w-full"
                  />
                )}
              />
              {errors.id_centro_custo && (
                <p className="mt-0.5 text-small text-red-600">
                  {errors.id_centro_custo.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Controller
                name="data_inicio_periodo"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    size="sm"
                    label="Período — Início"
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    error={errors.data_inicio_periodo?.message}
                  />
                )}
              />
              <Controller
                name="data_fim_periodo"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    size="sm"
                    label="Período — Fim"
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    error={errors.data_fim_periodo?.message}
                  />
                )}
              />
            </div>

            {/* Dados bancários colapsáveis */}
            <div>
              <button
                type="button"
                onClick={() => setShowBancarios((v) => !v)}
                className="flex items-center gap-2 text-caption font-semibold text-brand cursor-pointer"
              >
                {showBancarios ? <CaretUp size={14} /> : <CaretDown size={14} />}
                Dados bancários para pagamento
              </button>

              <AnimatePresence>
                {showBancarios && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-4 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <Controller
                          name="banco"
                          control={control}
                          render={({ field }) => (
                            <Input
                              label="Banco"
                              placeholder="Ex: 341"
                              value={field.value ?? ""}
                              onChange={(e) => field.onChange(maskBanco(e.target.value))}
                              onBlur={field.onBlur}
                              error={errors.banco?.message}
                            />
                          )}
                        />
                        <Controller
                          name="agencia"
                          control={control}
                          render={({ field }) => (
                            <Input
                              label="Agência"
                              placeholder="Ex: 0001-0"
                              value={field.value ?? ""}
                              onChange={(e) => field.onChange(maskAgencia(e.target.value))}
                              onBlur={field.onBlur}
                              error={errors.agencia?.message}
                            />
                          )}
                        />
                        <Controller
                          name="numero_banco"
                          control={control}
                          render={({ field }) => (
                            <Input
                              label="Conta"
                              placeholder="Ex: 12345-6"
                              value={field.value ?? ""}
                              onChange={(e) => field.onChange(maskConta(e.target.value))}
                              onBlur={field.onBlur}
                              error={errors.numero_banco?.message}
                            />
                          )}
                        />
                      </div>

                      {/* Chave PIX — tipo + valor */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-caption font-semibold text-app-text-muted">Chave Pix</label>
                        <div className="grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-2">
                          <Combobox
                            options={TIPO_CHAVE_PIX_OPTIONS}
                            value={tipoChavePix ?? ""}
                            onChange={(v) => {
                              setTipoChavePix(isTipoChavePix(v) ? v : null);
                              setValue("chave_pix", "", { shouldValidate: false });
                              clearErrors("chave_pix");
                            }}
                            placeholder="Selecione o tipo"
                          />
                          <Controller
                            name="chave_pix"
                            control={control}
                            render={({ field }) => (
                              <div className="relative flex-1">
                                <input
                                  className={`h-10 w-full rounded-xl px-3 text-body-sm border text-app-text placeholder:text-app-text-subtle outline-none transition-colors duration-200 ${
                                    tipoChavePix
                                      ? "bg-app-surface border-app-border focus:border-brand"
                                      : "bg-app-surface/50 border-app-border cursor-not-allowed text-app-text-muted"
                                  } ${field.value ? "pr-8" : ""}`}
                                  placeholder={tipoChavePix ? TIPO_CHAVE_PIX_PLACEHOLDER[tipoChavePix] : "Selecione o tipo primeiro"}
                                  disabled={!tipoChavePix}
                                  value={field.value ?? ""}
                                  onChange={(e) => tipoChavePix && field.onChange(aplicarMascaraChavePix(e.target.value, tipoChavePix))}
                                  onBlur={() => {
                                    field.onBlur();
                                    if (tipoChavePix === "email" && field.value) {
                                      if (!EMAIL_REGEX.test(field.value)) {
                                        setError("chave_pix", { message: "Informe um e-mail válido" });
                                      } else {
                                        clearErrors("chave_pix");
                                      }
                                    }
                                  }}
                                />
                                {field.value && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      field.onChange("");
                                      setTipoChavePix(null);
                                      clearErrors("chave_pix");
                                    }}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-app-text-muted hover:bg-app-hover hover:text-app-text"
                                  >
                                    <X size={12} weight="bold" />
                                  </button>
                                )}
                              </div>
                            )}
                          />
                        </div>
                        {errors.chave_pix && (
                          <p className="text-small text-red-500">{errors.chave_pix.message}</p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.section>

          {/* Requisitante */}
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.09 }}
            className="rounded-2xl border border-app-border bg-app-surface-raised/40 p-4 sm:p-5 space-y-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-caption font-semibold text-app-text-muted uppercase tracking-wide">
                Requisitante
              </h2>
              <Checkbox
                checked={colaboradorCadastrado}
                onChange={handleToggleColaborador}
                label="Colaborador Cadastrado"
                className={`rounded-full px-3 py-1.5 border transition-all duration-200 ${
                  colaboradorCadastrado
                    ? "bg-brand/8 border-brand/20"
                    : "bg-app-surface-raised border-app-border"
                }`}
              />
            </div>

            {colaboradorCadastrado ? (
              <div className="flex flex-col gap-1.5">
                <label className="text-caption font-semibold text-app-text-muted">
                  Colaborador
                </label>
                <Combobox
                  options={usuarios.map((u) => ({ value: String(u.id), label: u.nome }))}
                  value={idUsuarioRequisitante ?? ""}
                  onChange={handleSelecionarColaborador}
                  placeholder="Selecione o colaborador"
                  emptyMessage="Nenhum colaborador cadastrado."
                  className="w-full"
                />
                {errors.nome_solicitante && (
                  <p className="mt-0.5 text-small text-red-600">
                    Selecione um colaborador.
                  </p>
                )}

                <Input
                  label="Setor"
                  placeholder="Ex: Administrativo"
                  error={errors.setor_requisitante?.message}
                  className="mt-2"
                  {...register("setor_requisitante")}
                />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="Nome"
                    placeholder="Nome completo"
                    error={errors.nome_solicitante?.message}
                    {...register("nome_solicitante")}
                  />
                  <Input
                    label="Setor"
                    placeholder="Ex: Administrativo"
                    error={errors.setor_requisitante?.message}
                    {...register("setor_requisitante")}
                  />
                </div>

                <Controller
                  name="cpf_cnpj_solicitante"
                  control={control}
                  render={({ field }) => (
                    <Input
                      label="CPF / CNPJ"
                      placeholder="000.000.000-00"
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(maskCpfCnpj(e.target.value))}
                      onBlur={field.onBlur}
                      error={errors.cpf_cnpj_solicitante?.message}
                    />
                  )}
                />
              </>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-caption font-semibold text-app-text-muted">
                Observações
              </label>
              <textarea
                placeholder="Informações adicionais (opcional)"
                rows={3}
                className="w-full rounded-xl border border-app-border bg-app-surface px-3 py-2.5 text-body-sm text-app-text placeholder:text-app-text-subtle resize-none focus:border-brand focus:outline-none"
                {...register("obs")}
              />
            </div>
          </motion.section>

          {/* Despesas */}
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.13 }}
            className="rounded-2xl border border-app-border bg-app-surface-raised/40 p-4 sm:p-5 space-y-3"
          >
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-caption font-semibold text-app-text-muted uppercase tracking-wide">
                Itens de Despesa
              </h2>
              <Button type="button" variant="light" size="sm" onClick={adicionarDespesa}>
                <Plus size={14} /> Adicionar
              </Button>
            </div>

            {fields.length === 0 && (
              <EmptyState
                size="sm"
                icon={Receipt}
                title="Nenhuma despesa adicionada"
                iconBackground
              />
            )}

            <AnimatePresence>
              {fields.map((field, idx) => {
                const despesaId = field.despesaId;
                const despesaOriginal = despesaId
                  ? rcmInicial?.despesas?.find((d) => d.id === despesaId)
                  : undefined;

                const filesLocais = !despesaId
                  ? ((watch(`despesas.${idx}.anexo`) as File[] | undefined) ?? [])
                  : [];
                const pendingAdd = despesaId
                  ? anexosParaAdicionar.filter((a) => a.idDespesa === despesaId)
                  : [];

                return (
                  <motion.div
                    key={field.id}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    transition={{ duration: 0.18 }}
                    className="rounded-xl border border-app-border-subtle bg-app-surface-raised/30 p-4 sm:p-5 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-caption font-semibold text-app-text-muted">
                        Despesa {idx + 1}
                      </p>
                      <button
                        type="button"
                        onClick={() => handleRemoveDespesa(idx)}
                        className="rounded-full p-1 text-app-text-subtle hover:text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Trash size={16} />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Controller
                        name={`despesas.${idx}.data_despesa`}
                        control={control}
                        render={({ field: f }) => (
                          <DatePicker
                            size="sm"
                            label="Data"
                            value={f.value ?? ""}
                            onChange={f.onChange}
                            onBlur={f.onBlur}
                            error={errors.despesas?.[idx]?.data_despesa?.message}
                          />
                        )}
                      />
                      <Controller
                        name={`despesas.${idx}.valor`}
                        control={control}
                        render={({ field: f }) => (
                          <InputMonetario
                            label="Valor"
                            value={f.value ?? ""}
                            onChange={f.onChange}
                            onBlur={f.onBlur}
                            error={errors.despesas?.[idx]?.valor?.message}
                          />
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-caption font-semibold text-app-text-muted">
                          Categoria
                        </label>
                        <Controller
                          name={`despesas.${idx}.id_categoria_despesa`}
                          control={control}
                          render={({ field: f }) => (
                            <Combobox
                              options={categoriasOptions}
                              value={f.value ?? ""}
                              onChange={f.onChange}
                              placeholder="Selecione…"
                              emptyMessage="Nenhuma categoria."
                              className="w-full"
                            />
                          )}
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-caption font-semibold text-app-text-muted">
                          Centro de Custo
                        </label>
                        <Controller
                          name={`despesas.${idx}.id_centro_custo`}
                          control={control}
                          render={({ field: f }) => (
                            <Combobox
                              options={centrosCustoOptions}
                              value={f.value}
                              onChange={f.onChange}
                              placeholder="Selecione…"
                              emptyMessage="Nenhum centro de custo."
                              className="w-full"
                            />
                          )}
                        />
                        {errors.despesas?.[idx]?.id_centro_custo && (
                          <p className="mt-0.5 text-small text-red-600">
                            {errors.despesas[idx]?.id_centro_custo?.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <Input
                      label="Descrição"
                      placeholder="Descreva a despesa"
                      error={errors.despesas?.[idx]?.descricao?.message}
                      {...register(`despesas.${idx}.descricao`)}
                      maxLength={255}
                    />

                    <SecaoFornecedor
                      idFornecedor={watch(`despesas.${idx}.id_fornecedor`) ?? ""}
                      descricaoFornecedor={watch(`despesas.${idx}.descricao_fornecedor`) ?? ""}
                      cpfCnpjFornecedor={watch(`despesas.${idx}.cpf_cnpj_fornecedor`) ?? ""}
                      onChange={(campos) => {
                        setValue(`despesas.${idx}.id_fornecedor`, campos.id_fornecedor, { shouldDirty: true });
                        setValue(`despesas.${idx}.descricao_fornecedor`, campos.descricao_fornecedor, { shouldDirty: true });
                        setValue(`despesas.${idx}.cpf_cnpj_fornecedor`, campos.cpf_cnpj_fornecedor, { shouldDirty: true });
                      }}
                    />

                    {geolocalizacaoHabilitada && (
                      <Controller
                        name={`despesas.${idx}.latitude`}
                        control={control}
                        render={() => {
                          const lat = watch(`despesas.${idx}.latitude`);
                          const lon = watch(`despesas.${idx}.longitude`);
                          const end = watch(`despesas.${idx}.endereco`);
                          const valor =
                            lat != null && lon != null
                              ? { latitude: Number(lat), longitude: Number(lon), endereco: end ?? null }
                              : null;
                          return (
                            <CampoLocalizacao
                              label="Local da despesa"
                              valor={valor}
                              onChange={(loc) => {
                                setValue(`despesas.${idx}.latitude`,  loc?.latitude  ?? null, { shouldDirty: true });
                                setValue(`despesas.${idx}.longitude`, loc?.longitude ?? null, { shouldDirty: true });
                                setValue(`despesas.${idx}.endereco`,  loc?.endereco  ?? null, { shouldDirty: true });
                              }}
                            />
                          );
                        }}
                      />
                    )}

                    {/* Anexos múltiplos */}
                    <div className="space-y-2">
                      <label className="text-caption font-semibold text-app-text-muted">
                        Anexos
                      </label>

                      {/* Anexos já salvos (despesa existente) */}
                      {(despesaOriginal?.anexos ?? []).map((anexo) => {
                        const marcado = anexosParaDeletar.some((a) => a.idAnexo === anexo.id);
                        return (
                          <div
                            key={anexo.id}
                            className="flex items-center gap-2 rounded-lg border border-app-border-subtle bg-app-surface/60 px-3 py-2"
                          >
                            <Paperclip size={14} className={marcado ? "text-red-400 shrink-0" : "text-app-text-subtle shrink-0"} />
                            <span className={`flex-1 truncate text-small ${marcado ? "line-through text-red-400" : "text-app-text-muted"}`}>
                              {anexo.caminho.split("/").pop()}
                            </span>
                            {marcado ? (
                              <button
                                type="button"
                                onClick={() => desfazerDeletarAnexo(anexo.id)}
                                className="text-small text-app-text-muted hover:text-brand transition-colors shrink-0"
                              >
                                Desfazer
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => marcarDeletarAnexo(despesaId!, anexo.id)}
                                className="text-app-text-subtle hover:text-red-600 transition-colors"
                              >
                                <X size={14} />
                              </button>
                            )}
                          </div>
                        );
                      })}

                      {/* Novos arquivos pendentes */}
                      {despesaId
                        ? pendingAdd.map((a, i) => (
                          <div
                            key={`p${i}`}
                            className="flex items-center gap-2 rounded-lg border border-app-border-subtle bg-app-surface px-3 py-2"
                          >
                            <Paperclip size={14} className="text-app-text-muted shrink-0" />
                            <span className="flex-1 truncate text-small text-app-text">{a.file.name}</span>
                            <button
                              type="button"
                              onClick={() => cancelarAdicionarAnexo(despesaId, a.file)}
                              className="text-app-text-subtle hover:text-red-600 transition-colors"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))
                        : filesLocais.map((file, fi) => (
                          <div
                            key={fi}
                            className="flex items-center gap-2 rounded-lg border border-app-border-subtle bg-app-surface px-3 py-2"
                          >
                            <Paperclip size={14} className="text-app-text-muted shrink-0" />
                            <span className="flex-1 truncate text-small text-app-text">{file.name}</span>
                            <button
                              type="button"
                              onClick={() => {
                                const atual = (watch(`despesas.${idx}.anexo`) as File[] | undefined) ?? [];
                                setValue(`despesas.${idx}.anexo`, atual.filter((_, i2) => i2 !== fi) as unknown as undefined);
                              }}
                              className="text-app-text-subtle hover:text-red-600 transition-colors"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}

                      <button
                        type="button"
                        onClick={() => fileInputRefs.current[idx]?.click()}
                        className="flex items-center gap-1.5 text-caption font-semibold text-brand hover:opacity-80 transition-opacity"
                      >
                        <Plus size={14} />
                        Adicionar anexo
                      </button>

                      <input
                        ref={(el) => { fileInputRefs.current[idx] = el; }}
                        type="file"
                        accept=".jpg,.jpeg,.png,.pdf"
                        multiple
                        className="hidden"
                        onChange={(e) => {
                          const novos = Array.from(e.target.files ?? []);
                          if (despesaId) {
                            novos.forEach((f) => marcarAdicionarAnexo(despesaId, f));
                          } else {
                            const existentes = (watch(`despesas.${idx}.anexo`) as File[] | undefined) ?? [];
                            setValue(`despesas.${idx}.anexo`, [...existentes, ...novos] as unknown as undefined);
                          }
                          e.target.value = "";
                        }}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.section>

          {/* Total + Rodapé */}
          <div className="space-y-3 pt-1">
            <div className="rounded-2xl border border-app-border bg-app-surface-raised/40 px-5 py-4 flex items-center justify-between">
              <span className="text-body-sm text-app-text-muted">Total lançado</span>
              <span className="text-feature-title font-bold text-app-text tabular-nums">{fmtTotalGastos}</span>
            </div>

            <div className="flex gap-3">
              <Button type="button" variant="light" fullWidth onClick={onFechar}>
                Cancelar
              </Button>
              <Button type="submit" variant="dark" fullWidth disabled={isSubmitting}>
                {isSubmitting ? "Salvando…" : "Salvar Solicitação"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </>
  );

  if (pageMode) return inner;
  return <Modal open onClose={onFechar} isDirty={isDirty}>{inner}</Modal>;
}
