<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\Paginates;
use App\Http\Requests\StoreBankAccountRequest;
use App\Http\Requests\UpdateBankAccountRequest;
use App\Services\BankAccountService;
use Illuminate\Http\JsonResponse;

class BankAccountController extends Controller
{
    use Paginates;

    public function __construct(
        private readonly BankAccountService $service,
    ) {}

    public function index(): JsonResponse
    {
        return response()->json(
            $this->paginated($this->service->list($this->perPage()))
        );
    }

    public function store(StoreBankAccountRequest $request): JsonResponse
    {
        $data = $request->validated();

        $bankAccount = $this->service->create($data);

        return response()->json([
            'message'        => 'Bank account created successfully.',
            'bank_account'  => $bankAccount,
        ], 201);
    }

    public function show(int $id): JsonResponse
    {
        return response()->json([
            'bank_account' => $this->service->find($id),
        ]);
    }

    public function update(UpdateBankAccountRequest $request, int $id): JsonResponse
    {
        $data = $request->validated();

        $bankAccount = $this->service->update($id, $data);

        return response()->json([
            'message'        => 'Bank account updated successfully.',
            'bank_account'  => $bankAccount,
        ]);
    }

    public function destroy(int $id): JsonResponse
    {
        $this->service->delete($id);

        return response()->json([
            'message' => 'Bank account deleted successfully.',
        ]);
    }
}
