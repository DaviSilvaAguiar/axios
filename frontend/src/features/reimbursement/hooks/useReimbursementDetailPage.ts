import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@/lib/toast";
import { queryKeys } from "@/lib/queryKeys";
import {
  deleteReimbursementApi,
  updateReimbursementApi,
  deleteReimbursementItemApi,
  getAnexoEspecificoReimbursementApi,
} from "../reimbursement.api";
import { useReimbursement } from "../reimbursement.hooks";
import { persistReimbursementItems } from "../reimbursement.persist";
import type { StoreReimbursementWithDespesasFormData } from "../reimbursement.types";
import type { AttachmentToAdd, AttachmentToDelete } from "../components/FormReimbursement";

export function useReimbursementDetailPage(id: string) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: reimbursement, isLoading: loading, isError } = useReimbursement(Number(id));
  const [showForm, setShowForm] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [deletingItem, setDeletingItem] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showMenu) return;
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showMenu]);

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteReimbursementApi(Number(id));
      toast.success("Reimbursement deleted successfully.");
      router.push("/my-reimbursements");
    } catch {
      toast.error("Error deleting the reimbursement.");
      setDeleting(false);
      setShowConfirmDelete(false);
    }
  }

  async function handleDeleteItem() {
    if (!reimbursement || itemToDelete === null) return;
    setDeletingItem(true);
    try {
      await deleteReimbursementItemApi(reimbursement.id, itemToDelete);
      toast.success("Item deleted.");
      setItemToDelete(null);
      await queryClient.invalidateQueries({ queryKey: queryKeys.reimbursements.detail(reimbursement.id) });
    } catch {
      toast.error("Error deleting the item.");
    } finally {
      setDeletingItem(false);
    }
  }

  async function handleSaveEdit(
    data: StoreReimbursementWithDespesasFormData,
    deleteItemIds: number[],
    deleteAttachments: AttachmentToDelete[],
    addAttachments: AttachmentToAdd[]
  ) {
    if (!reimbursement) return;
    try {
      const { items, ...header } = data;

      await updateReimbursementApi(reimbursement.id, header);
      await persistReimbursementItems(reimbursement.id, items, deleteItemIds, deleteAttachments, addAttachments);

      toast.success("Reimbursement updated successfully!");
      setShowForm(false);
      await queryClient.invalidateQueries({ queryKey: queryKeys.reimbursements.detail(reimbursement.id) });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error saving.");
    }
  }

  async function openAttachment(reimbursementId: number, itemId: number, attachmentId: number) {
    try {
      const blob = await getAnexoEspecificoReimbursementApi(reimbursementId, itemId, attachmentId);
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch {
      toast.error("Could not open the attachment.");
    }
  }

  return {
    router,
    reimbursement,
    loading,
    isError,
    showForm,
    setShowForm,
    showConfirmDelete,
    setShowConfirmDelete,
    deleting,
    showMenu,
    setShowMenu,
    itemToDelete,
    setItemToDelete,
    deletingItem,
    menuRef,
    handleDelete,
    handleDeleteItem,
    handleSaveEdit,
    openAttachment,
  };
}
