using System.Text.Json;
using Microsoft.Extensions.Options;
using OpenAI.Chat;
using ShoppingApi.Dtos;

namespace ShoppingApi.Services;

/// <summary>
/// Calls an OpenAI chat model with a hardcoded prompt + the user's selected stores and items.
/// </summary>
public class AiShoppingService
{
    private readonly ChatClient _chat;
    private readonly AiOptions _options;

    public AiShoppingService(ChatClient chat, IOptions<AiOptions> options)
    {
        _chat = chat;
        _options = options.Value;
    }

    public async Task<JsonDocument> GenerateAsync(AiGenerateRequest req)
    {
        // System prompt: strict output rules for stable parsing
        const string systemPrompt = """
Du er en indkøbsassistent.

VIGTIGT:
- Svar KUN som valid JSON.
- Ingen markdown.
- Ingen tekst udenfor JSON.
""";

        // User prompt includes your hardcoded instruction + the data payload
        var payload = new
        {
            instruction = _options.Prompt,
            data = new
            {
                stores = req.Stores,
                items = req.Items
                    .Where(i => i is not null)
                    .Where(i => i.IsDone != true)
                    .Select(i => new
                    {
                        name = (i.Name ?? string.Empty).Trim(),
                        quantity = ParseQtyToInt(i.Qty)
                    })
                    .Where(i => i.name.Length > 0)
                    .ToList()
            }
        };

        var userPrompt = JsonSerializer.Serialize(payload);

        ChatCompletion completion = await _chat.CompleteChatAsync(new ChatMessage[]
        {
            new SystemChatMessage(systemPrompt),
            new UserChatMessage(userPrompt)
        });

        var text = completion.Content[0].Text;
        return JsonDocument.Parse(text);
    }

    private static int ParseQtyToInt(string? qty)
    {
        // Your UI uses string qty. We convert to int for AI.
        if (string.IsNullOrWhiteSpace(qty)) return 1;

        qty = qty.Trim();
        if (int.TryParse(qty, out var n) && n > 0) return n;

        // e.g. "2 stk" -> "2"
        var digits = new string(qty.Where(char.IsDigit).ToArray());
        if (int.TryParse(digits, out n) && n > 0) return n;

        return 1;
    }
}
