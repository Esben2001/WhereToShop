using Microsoft.AspNetCore.Mvc;
using ShoppingApi.Dtos;
using ShoppingApi.Services;

namespace ShoppingApi.Controllers;

[ApiController]
[Route("api/lists")]
public class ShoppingListsController : ControllerBase
{
    private readonly IShoppingListService _service;

    public ShoppingListsController(IShoppingListService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<IActionResult> GetLists()
    {
        return Ok(await _service.GetListsAsync());
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetList(int id)
    {
        var list = await _service.GetListAsync(id);
        return list is null ? NotFound("List not found.") : Ok(list);
    }

    [HttpPost]
    public async Task<IActionResult> CreateList([FromBody] CreateListRequest req)
    {
        var created = await _service.CreateListAsync(req);
        if (created is null) return BadRequest("Invalid list name.");
        // REST best practice: return 201 Created with location header pointing to the new resource
        // F.eks Location: /api/lists/5
        return CreatedAtAction(nameof(GetList), new { id = created.Id }, created); 
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> RenameList(int id, [FromBody] RenameListRequest req)
    {
        var renamed = await _service.RenameListAsync(id, req);
        return renamed ? NoContent() : BadRequest("Invalid name or list not found.");
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteList(int id)
    {
        var deleted = await _service.DeleteListAsync(id);
        return deleted ? NoContent() : NotFound("List not found.");
    }

    [HttpPost("{id:int}/items")]
    public async Task<IActionResult> AddItem(int id, [FromBody] AddItemRequest req)
    {
        var updated = await _service.AddItemAsync(id, req);
        return updated is null ? BadRequest("Invalid item or list not found.") : Ok(updated);
    }

    [HttpPatch("{id:int}/items/{itemId:int}/toggle")]
    public async Task<IActionResult> ToggleDone(int id, int itemId)
    {
        var next = await _service.ToggleDoneAsync(id, itemId);
        return next is null ? NotFound() : Ok(new { isDone = next.Value });
    }

    [HttpDelete("{id:int}/items/{itemId:int}")]
    public async Task<IActionResult> DeleteItem(int id, int itemId)
    {
        var deleted = await _service.DeleteItemAsync(id, itemId);
        return deleted ? NoContent() : NotFound("Item not found.");
    }
}