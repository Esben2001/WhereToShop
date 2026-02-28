using Dapper;
using ShoppingApi.Data;
using ShoppingApi.Dtos;

namespace ShoppingApi.Repositories;

public class ShoppingListRepository : IShoppingListRepository
{
    private readonly Database _db;
    public ShoppingListRepository(Database db) => _db = db;

    // =====================================================
    // LIST OVERVIEW (summary)
    // =====================================================
    public async Task<IEnumerable<(int Id, string Name, DateTime CreatedAt, int OpenCount, int TotalCount)>> GetListsAsync()
    {
        const string sql = @"SELECT l.Id, l.Name, l.CreatedAt, SUM(CASE WHEN i.IsDone = 0 THEN 1 ELSE 0 END) AS OpenCount, 
        COUNT(i.Id) AS TotalCount 
        FROM dbo.ShoppingLists l LEFT JOIN dbo.ShoppingItems i ON i.ListId = l.Id
        GROUP BY l.Id, l.Name, l.CreatedAt
        ORDER BY l.CreatedAt DESC;";

        using var conn = _db.CreateConnection();
        return await conn.QueryAsync<(int, string, DateTime, int, int)>(sql);
    }

    // =====================================================
    // GET SINGLE LIST (WITH ITEMS)
    // =====================================================
    public async Task<ShoppingListDto?> GetListAsync(int listId)
    {
        const string listSql = @"SELECT Id, Name, CreatedAt
        FROM dbo.ShoppingLists
        WHERE Id = @listId;";

        const string itemsSql = @"
        SELECT Id, Name, Qty, IsDone, CreatedAt
        FROM dbo.ShoppingItems
        WHERE ListId = @listId
        ORDER BY CreatedAt DESC;";

        using var conn = _db.CreateConnection();

        var list = await conn.QuerySingleOrDefaultAsync<(int Id, string Name, DateTime CreatedAt)>(
            listSql, new { listId });

        if (list.Id == 0) return null;

        var items = (await conn.QueryAsync<(int Id, string Name, string? Qty, bool IsDone, DateTime CreatedAt)>(
                itemsSql, new { listId }))
            .Select(i => new ShoppingItemDto(i.Id, i.Name, i.Qty, i.IsDone, i.CreatedAt))
            .ToList();

        return new ShoppingListDto(list.Id, list.Name, list.CreatedAt, items);
    }

    // =====================================================
    // CREATE LIST
    // =====================================================
    public async Task<int> CreateListAsync(string name)
    {
        const string sql = @"
        INSERT INTO dbo.ShoppingLists (Name)
        OUTPUT INSERTED.Id
        VALUES (@name);";

        using var conn = _db.CreateConnection();
        return await conn.ExecuteScalarAsync<int>(sql, new { name });
    }

    // =====================================================
    // RENAME LIST
    // =====================================================
    public async Task<bool> RenameListAsync(int listId, string name)
    {
        const string sql = @"
        UPDATE dbo.ShoppingLists
        SET Name = @name
        WHERE Id = @listId;";

        using var conn = _db.CreateConnection();
        var rows = await conn.ExecuteAsync(sql, new { listId, name });
        return rows > 0;
    }

    // =====================================================
    // DELETE LIST
    // =====================================================
    public async Task<bool> DeleteListAsync(int listId)
    {
        const string sql = @"
        DELETE FROM dbo.ShoppingLists
        WHERE Id = @listId;";

        using var conn = _db.CreateConnection();
        var rows = await conn.ExecuteAsync(sql, new { listId });
        return rows > 0;
    }

    // =====================================================
    // ADD ITEM
    // =====================================================
    public async Task<int?> AddItemAsync(int listId, string name, string? qty)
    {
        const string existsSql = @"SELECT COUNT(1) FROM dbo.ShoppingLists WHERE Id = @listId;";
        using var conn = _db.CreateConnection();

        var exists = await conn.ExecuteScalarAsync<int>(existsSql, new { listId });
        if (exists == 0) return null;

        const string insert = @"
        INSERT INTO dbo.ShoppingItems (ListId, Name, Qty)
        OUTPUT INSERTED.Id
        VALUES (@listId, @name, @qty);";

        return await conn.ExecuteScalarAsync<int>(insert, new { listId, name, qty });
    }

    // =====================================================
    // TOGGLE ITEM
    // =====================================================
    public async Task<bool?> ToggleItemDoneAsync(int listId, int itemId)
    {
        using var conn = _db.CreateConnection();

        const string getSql = @"
        SELECT IsDone
        FROM dbo.ShoppingItems
        WHERE Id = @itemId AND ListId = @listId;";

        var current = await conn.ExecuteScalarAsync<bool?>(getSql, new { listId, itemId });
        if (current is null) return null;

        var next = !current.Value;

        const string upd = @"
        UPDATE dbo.ShoppingItems
        SET IsDone = @next
        WHERE Id = @itemId AND ListId = @listId;";

        await conn.ExecuteAsync(upd, new { next, listId, itemId });

        return next;
    }

    // =====================================================
    // DELETE ITEM
    // =====================================================
    public async Task<bool> DeleteItemAsync(int listId, int itemId)
    {
        const string sql = @"
        DELETE FROM dbo.ShoppingItems
        WHERE Id = @itemId AND ListId = @listId;";

        using var conn = _db.CreateConnection();
        var rows = await conn.ExecuteAsync(sql, new { listId, itemId });
        return rows > 0;
    }
}