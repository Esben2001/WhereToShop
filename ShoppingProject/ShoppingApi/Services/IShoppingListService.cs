using ShoppingApi.Dtos;

namespace ShoppingApi.Services;

public interface IShoppingListService
{
    Task<IEnumerable<object>> GetListsAsync();
    Task<ShoppingListDto?> GetListAsync(int id);

    Task<ShoppingListDto?> CreateListAsync(CreateListRequest req);
    Task<bool> RenameListAsync(int id, RenameListRequest req);
    Task<bool> DeleteListAsync(int id);

    Task<ShoppingListDto?> AddItemAsync(int id, AddItemRequest req);
    Task<bool?> ToggleDoneAsync(int id, int itemId);
    Task<bool> DeleteItemAsync(int id, int itemId);
    Task<int> ClearDoneAsync(int id);
}