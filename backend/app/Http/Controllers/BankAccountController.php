<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\Paginates;
use App\Http\Requests\StoreBankAccountRequest;
use App\Http\Requests\UpdateBankAccountRequest;
use App\Http\Resources\BankAccountResource;
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
        $paginator = $this->service->list($this->perPage());

        return response()->json(
            $this->paginated($paginator, BankAccountResource::collection($paginator->items())->resolve())
        );
    }

    public function store(StoreBankAccountRequest $request): JsonResponse
    {
        $bankAccount = $this->service->create($request->validated());

        return BankAccountResource::make($bankAccount)
            ->additional(['message' => 'Bank account created successfully.'])
            ->response()
            ->setStatusCode(201);
    }

    public function show(int $id): JsonResponse
    {
        return BankAccountResource::make($this->service->find($id))->response();
    }

    public function update(UpdateBankAccountRequest $request, int $id): JsonResponse
    {
        $bankAccount = $this->service->update($id, $request->validated());

        return BankAccountResource::make($bankAccount)
            ->additional(['message' => 'Bank account updated successfully.'])
            ->response();
    }

    public function destroy(int $id): JsonResponse
    {
        $this->service->delete($id);

        return response()->json(null, 204);
    }
}
