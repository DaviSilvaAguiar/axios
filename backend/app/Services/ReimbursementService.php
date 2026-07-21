<?php

declare(strict_types=1);

namespace App\Services;

use App\Exceptions\DomainException;
use App\Models\Reimbursement;
use App\Models\User;
use App\Services\Concerns\ResolvesRequester;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Gate;

class ReimbursementService
{
    use ResolvesRequester;

    public function list(User $user, int $perPage = 10, array $filters = [])
    {
        $query = Reimbursement::with(['user', 'costCenter', 'items.costCenter', 'items.expenseCategory', 'items.attachments', 'exportBatch:id,created_at']);

        if ($user->role === 3) {
            $query->where('user_id', $user->id);
        }

        if (! empty($filters['employee'])) {
            $query->whereHas('user', function ($q) use ($filters) {
                $q->where('name', 'like', '%'.$filters['employee'].'%');
            });
        }

        if (! empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (! empty($filters['startDate'])) {
            $query->whereDate('created_at', '>=', $filters['startDate']);
        }

        if (! empty($filters['endDate'])) {
            $query->whereDate('created_at', '<=', $filters['endDate']);
        }

        return $query->orderByDesc('created_at')->paginate($perPage);
    }

    public function create(array $data, int $userId): Reimbursement
    {
        $data = $this->resolveRequester($data, 'requester_name');

        $reimbursement = Reimbursement::create([
            ...$data,
            'user_id' => $userId,
            'status' => Reimbursement::STATUS_REQUESTED,
        ]);

        return $reimbursement->fresh();
    }

    public function find(int $id): Reimbursement
    {
        $reimbursement = Reimbursement::with(['user', 'costCenter', 'items.costCenter', 'items.expenseCategory', 'items.attachments', 'exportBatch:id,created_at'])->findOrFail($id);

        Gate::authorize('view', $reimbursement);

        return $reimbursement;
    }

    public function update(int $id, array $data): Reimbursement
    {
        $reimbursement = Reimbursement::findOrFail($id);
        Gate::authorize('update', $reimbursement);

        if ($reimbursement->status !== Reimbursement::STATUS_REQUESTED) {
            throw new DomainException('Only reimbursements with status "Draft" can be edited.', 409);
        }

        $data = $this->resolveRequester($data, 'requester_name');
        $reimbursement->update($data);

        return $reimbursement->fresh(['user', 'costCenter', 'items.costCenter', 'items.expenseCategory', 'items.attachments', 'exportBatch:id,created_at']);
    }

    public function updateStatus(int $id, array $data): Reimbursement
    {
        $reimbursement = Reimbursement::findOrFail($id);
        Gate::authorize('updateStatus', $reimbursement);
        $status = (int) $data['status'];

        if ($status === Reimbursement::STATUS_PAYMENT_SCHEDULED && empty($data['scheduled_payment_date'])) {
            throw new DomainException('The scheduled payment date is required when scheduling the payment.');
        }

        if ($status === Reimbursement::STATUS_REJECTED && empty($data['rejection_reason'])) {
            throw new DomainException('The rejection reason is required when rejecting a reimbursement.');
        }

        $reimbursement->update([
            'status' => $status,
            'scheduled_payment_date' => $data['scheduled_payment_date'] ?? $reimbursement->scheduled_payment_date,
            'rejection_reason' => $data['rejection_reason'] ?? $reimbursement->rejection_reason,
        ]);

        return $reimbursement->fresh(['user', 'costCenter', 'items.costCenter', 'items.expenseCategory', 'items.attachments', 'exportBatch:id,created_at']);
    }

    public function delete(int $id): void
    {
        $reimbursement = Reimbursement::findOrFail($id);
        Gate::authorize('delete', $reimbursement);

        if ($reimbursement->status !== Reimbursement::STATUS_REQUESTED) {
            throw new DomainException('Only reimbursements with status "Draft" can be deleted.', 409);
        }

        $reimbursement->delete();
    }

    public function generatePdf(int $id): Response
    {
        $pdfBytes = $this->generatePdfBytes($id);

        return new Response(
            $pdfBytes,
            200,
            [
                'Content-Type' => 'application/pdf',
                'Content-Disposition' => "inline; filename=\"rcm-{$id}.pdf\"",
            ]
        );
    }

    public function generatePdfBytes(int $id): string
    {
        $reimbursement = $this->find($id);

        return Pdf::loadView('pdf.reimbursement', ['reimbursement' => $reimbursement])->output();
    }
}
