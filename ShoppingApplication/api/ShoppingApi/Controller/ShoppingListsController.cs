using Microsoft.AspNetCore.Mvc;
using ShoppingApi.Dtos;
using ShoppingApi.Repositories;

namespace ShoppingApi.Controllers;

[ApiController]
[Route("api/lists")]
public class ShoppingListsController : ControllerBase
{
    private readonly ShoppingListRepository _repo;

    public ShoppingListsController(ShoppingListRepository repo)
    {
        _repo = repo;
    }

    // =====================================================
    // GET /api/lists
    // =====================================================
    [HttpGet]
    public async Task<IActionResult> GetLists()
    {
        var lists = await _repo.GetListsAsync();

        return Ok(lists.Select(l => new
        {
            id = l.Id,
            name = l.Name,
            createdAt = l.CreatedAt,
            openCount = l.OpenCount,
            totalCount = l.TotalCount
        }));
    }

    // =====================================================
    // GET /api/lists/{id}
    // =====================================================
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetList(int id)
    {
        var list = await _repo.GetListAsync(id);
        return list is null ? NotFound() : Ok(list);
    }

    // =====================================================
    // POST /api/lists
    // =====================================================
    [HttpPost]
    public async Task<IActionResult> CreateList([FromBody] CreateListRequest req)
    {
        if (req is null || string.IsNullOrWhiteSpace(req.Name))
            return BadRequest("Name is required.");

        var id = await _repo.CreateListAsync(req.Name.Trim());
        var created = await _repo.GetListAsync(id);

        return CreatedAtAction(nameof(GetList), new { id }, created);
    }

    // =====================================================
    // PUT /api/lists/{id}
    // =====================================================
    [HttpPut("{id:int}")]
    public async Task<IActionResult> RenameList(int id, [FromBody] RenameListRequest req)
    {
        if (req is null || string.IsNullOrWhiteSpace(req.Name))
            return BadRequest("Name is required.");

        var ok = await _repo.RenameListAsync(id, req.Name.Trim());
        return ok ? NoContent() : NotFound();
    }

    // =====================================================
    // DELETE /api/lists/{id}
    // =====================================================
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteList(int id)
    {
        var ok = await _repo.DeleteListAsync(id);
        return ok ? NoContent() : NotFound();
    }

    // =====================================================
    // POST /api/lists/{id}/items
    // =====================================================
    [HttpPost("{id:int}/items")]
    public async Task<IActionResult> AddItem(int id, [FromBody] AddItemRequest req)
    {
        if (req is null || string.IsNullOrWhiteSpace(req.Name))
            return BadRequest("Name is required.");

        var itemId = await _repo.AddItemAsync(
            id,
            req.Name.Trim(),
            string.IsNullOrWhiteSpace(req.Qty) ? null : req.Qty.Trim()
        );

        if (itemId is null)
            return NotFound("List not found.");

        var updated = await _repo.GetListAsync(id);
        return Ok(updated);
    }

    // =====================================================
    // PATCH /api/lists/{id}/items/{itemId}/toggle
    // =====================================================
    [HttpPatch("{id:int}/items/{itemId:int}/toggle")]
    public async Task<IActionResult> ToggleDone(int id, int itemId)
    {
        var next = await _repo.ToggleItemDoneAsync(id, itemId);
        return next is null ? NotFound() : Ok(new { isDone = next.Value });
    }

    // =====================================================
    // DELETE /api/lists/{id}/items/{itemId}
    // =====================================================
    [HttpDelete("{id:int}/items/{itemId:int}")]
    public async Task<IActionResult> DeleteItem(int id, int itemId)
    {
        var ok = await _repo.DeleteItemAsync(id, itemId);
        return ok ? NoContent() : NotFound();
    }

    // =====================================================
    // DELETE /api/lists/{id}/items/done
    // =====================================================
    [HttpDelete("{id:int}/items/done")]
    public async Task<IActionResult> ClearDone(int id)
    {
        var removed = await _repo.ClearDoneAsync(id);
        return Ok(new { removed });
    }
}