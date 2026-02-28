using ShoppingApi.Dtos;
using ShoppingApi.Repositories;

namespace ShoppingApi.Services;

public class ShoppingListService : IShoppingListService
{
    private readonly IShoppingListRepository _repo;

    public ShoppingListService(IShoppingListRepository repo)
    {
        _repo = repo;
    }

    public async Task<IEnumerable<object>> GetListsAsync()
    {
        var lists = await _repo.GetListsAsync();
        return lists.Select(l => new
        {
            id = l.Id,
            name = l.Name,
            createdAt = l.CreatedAt,
            openCount = l.OpenCount,
            totalCount = l.TotalCount
        });
    }

    public Task<ShoppingListDto?> GetListAsync(int id)
    {
        return _repo.GetListAsync(id);
    }

    public async Task<ShoppingListDto?> CreateListAsync(CreateListRequest req)
    {
        var name = (req?.Name ?? "").Trim();

        // Business rule: navn skal være 1..120
        if (name.Length is < 1 or > 120) return null;

        var id = await _repo.CreateListAsync(name);
        return await _repo.GetListAsync(id);
    }

    public async Task<bool> RenameListAsync(int id, RenameListRequest req)
    {
        var name = (req?.Name ?? "").Trim();
        if (name.Length is < 1 or > 120) return false;

        return await _repo.RenameListAsync(id, name);
    }

    public Task<bool> DeleteListAsync(int id)
    {
        return _repo.DeleteListAsync(id);
    }

    public async Task<ShoppingListDto?> AddItemAsync(int id, AddItemRequest req)
    {
        var name = (req?.Name ?? "").Trim();
        var qty = string.IsNullOrWhiteSpace(req?.Qty) ? null : req!.Qty.Trim();

        // Business rules
        if (name.Length is < 1 or > 200) return null;
        if (qty is not null && qty.Length > 40) return null;

        var itemId = await _repo.AddItemAsync(id, name, qty);
        if (itemId is null) return null;

        return await _repo.GetListAsync(id);
    }

    public Task<bool?> ToggleDoneAsync(int id, int itemId)
    {
        return _repo.ToggleItemDoneAsync(id, itemId);
    }

    public Task<bool> DeleteItemAsync(int id, int itemId)
    {
        return _repo.DeleteItemAsync(id, itemId);
    }
}