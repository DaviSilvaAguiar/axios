<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\ReimbursementAttachment;
use App\Models\ReimbursementItem;
use App\Models\Reimbursement;
use Illuminate\Support\Carbon;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReimbursementItemService
{
    private function ensureReimbursementEditable(int $idReimbursement): Reimbursement
    {
        $reimbursement = Reimbursement::findOrFail($idReimbursement);

        if ($reimbursement->status !== Reimbursement::STATUS_REQUESTED) {
            abort(409, 'Only reimbursements with status "Draft" can have their items changed.');
        }

        return $reimbursement;
    }

    private function ensureDateWithinPeriod(Reimbursement $reimbursement, string $date): void
    {
        $itemDate = Carbon::parse($date)->startOfDay();
        $start    = $reimbursement->period_start_date->copy()->startOfDay();
        $end      = $reimbursement->period_end_date->copy()->startOfDay();

        if ($itemDate->lt($start) || $itemDate->gt($end)) {
            abort(422, 'The expense date must be within the reimbursement period.');
        }
    }

    public function create(int $idReimbursement, array $data, array $attachments = []): ReimbursementItem
    {
        $reimbursement = $this->ensureReimbursementEditable($idReimbursement);
        $this->ensureDateWithinPeriod($reimbursement, $data['expense_date']);

        $item = ReimbursementItem::create([
            'reimbursement_id'               => $idReimbursement,
            'cost_center_id'      => $data['cost_center_id'],
            'description'            => $data['description'],
            'amount'                => $data['amount'],
            'expense_date'         => $data['expense_date'],
            'expense_category_id' => $data['expense_category_id'] ?? null,
            'latitude'             => $data['latitude']  ?? null,
            'longitude'            => $data['longitude'] ?? null,
            'address'             => $data['address']  ?? null,
            'supplier_description' => $data['supplier_description'] ?? null,
            'supplier_tax_id'  => $data['supplier_tax_id']  ?? null,
            'supplier_id'        => $data['supplier_id']        ?? null,
        ]);

        foreach ($attachments as $file) {
            $path = $file->store("reimbursement-attachments/{$idReimbursement}", 'public');
            ReimbursementAttachment::create([
                'reimbursement_item_id' => $item->id,
                'path'        => $path,
            ]);
        }

        return $item->load(['costCenter', 'expenseCategory', 'attachments']);
    }

    public function serveAttachment(int $idReimbursement, int $itemId): StreamedResponse
    {
        $item = ReimbursementItem::where('reimbursement_id', $idReimbursement)->findOrFail($itemId);
        $attachment = $item->attachments()->firstOrFail();

        return Storage::disk('public')->response($attachment->path);
    }

    public function addAttachment(int $idReimbursement, int $itemId, UploadedFile $file): ReimbursementAttachment
    {
        $this->ensureReimbursementEditable($idReimbursement);
        $item = ReimbursementItem::where('reimbursement_id', $idReimbursement)->findOrFail($itemId);

        $path = $file->store("reimbursement-attachments/{$idReimbursement}", 'public');

        return ReimbursementAttachment::create([
            'reimbursement_item_id' => $item->id,
            'path'        => $path,
        ]);
    }

    public function deleteSpecificAttachment(int $idReimbursement, int $itemId, int $attachmentId): void
    {
        $this->ensureReimbursementEditable($idReimbursement);
        $item = ReimbursementItem::where('reimbursement_id', $idReimbursement)->findOrFail($itemId);
        $attachment = $item->attachments()->findOrFail($attachmentId);

        Storage::disk('public')->delete($attachment->path);
        $attachment->delete();
    }

    public function serveSpecificAttachment(int $idReimbursement, int $itemId, int $attachmentId): StreamedResponse
    {
        $item = ReimbursementItem::where('reimbursement_id', $idReimbursement)->findOrFail($itemId);
        $attachment = $item->attachments()->findOrFail($attachmentId);

        return Storage::disk('public')->response($attachment->path);
    }

    public function delete(int $idReimbursement, int $id): void
    {
        $this->ensureReimbursementEditable($idReimbursement);
        $item = ReimbursementItem::where('reimbursement_id', $idReimbursement)->findOrFail($id);

        foreach ($item->attachments as $attachment) {
            Storage::disk('public')->delete($attachment->path);
        }

        $item->delete();
    }

    public function update(int $idReimbursement, int $itemId, array $data): ReimbursementItem
    {
        $reimbursement = $this->ensureReimbursementEditable($idReimbursement);
        $this->ensureDateWithinPeriod($reimbursement, $data['expense_date']);
        $item = ReimbursementItem::where('reimbursement_id', $idReimbursement)->findOrFail($itemId);

        $item->update([
            'expense_date'         => $data['expense_date'],
            'amount'                => $data['amount'],
            'cost_center_id'      => $data['cost_center_id'],
            'description'            => $data['description'],
            'expense_category_id' => $data['expense_category_id'] ?? null,
            'latitude'             => $data['latitude']  ?? null,
            'longitude'            => $data['longitude'] ?? null,
            'address'             => $data['address']  ?? null,
            'supplier_description' => $data['supplier_description'] ?? null,
            'supplier_tax_id'  => $data['supplier_tax_id']  ?? null,
            'supplier_id'        => $data['supplier_id']        ?? null,
        ]);

        return $item->load(['costCenter', 'expenseCategory', 'attachments']);
    }

    public function deleteAttachment(int $idReimbursement, int $itemId): void
    {
        $this->ensureReimbursementEditable($idReimbursement);
        $item = ReimbursementItem::where('reimbursement_id', $idReimbursement)->findOrFail($itemId);

        foreach ($item->attachments as $attachment) {
            Storage::disk('public')->delete($attachment->path);
            $attachment->delete();
        }
    }

    public function replaceAttachment(int $idReimbursement, int $itemId, UploadedFile $file): ReimbursementAttachment
    {
        $this->ensureReimbursementEditable($idReimbursement);
        $item = ReimbursementItem::where('reimbursement_id', $idReimbursement)->findOrFail($itemId);

        foreach ($item->attachments as $existingAttachment) {
            Storage::disk('public')->delete($existingAttachment->path);
            $existingAttachment->delete();
        }

        $path = $file->store("reimbursement-attachments/{$idReimbursement}", 'public');

        return ReimbursementAttachment::create([
            'reimbursement_item_id' => $item->id,
            'path'        => $path,
        ]);
    }
}
