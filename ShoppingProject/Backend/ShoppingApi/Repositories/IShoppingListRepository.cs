using ShoppingApi.Dtos;

namespace ShoppingApi.Repositories;

public interface IShoppingListRepository
{
    Task<IEnumerable<(int Id, string Name, DateTime CreatedAt, int OpenCount, int TotalCount)>> GetListsAsync();
    Task<ShoppingListDto?> GetListAsync(int listId);

    Task<int> CreateListAsync(string name);
    Task<bool> RenameListAsync(int listId, string name);
    Task<bool> DeleteListAsync(int listId);

    Task<int?> AddItemAsync(int listId, string name, string? qty);
    Task<bool?> ToggleItemDoneAsync(int listId, int itemId);
    Task<bool> DeleteItemAsync(int listId, int itemId);
}