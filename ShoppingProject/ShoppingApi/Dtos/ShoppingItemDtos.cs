namespace ShoppingApi.Dtos;

public record ShoppingItemDto(
    int Id,
    string Name,
    string? Qty,
    bool IsDone,
    DateTime CreatedAt
);

public record AddItemRequest(string Name, string? Qty);