namespace ShoppingApi.Dtos;

public record ShoppingListDto(
    int Id,
    string Name,
    DateTime CreatedAt,
    List<ShoppingItemDto> Items
);

public record CreateListRequest(string Name);
public record RenameListRequest(string Name);