namespace ShoppingApi.Dtos;

/// <summary>
/// Payload sent from frontend when user clicks "AI generering".
/// </summary>
public record AiGenerateRequest(
    List<string> Stores,
    List<AiGenerateItemRequest> Items
);

/// <summary>
/// Item shape coming from the frontend.
/// </summary>
public record AiGenerateItemRequest(
    int? Id,
    string Name,
    string? Qty,
    bool? IsDone
);