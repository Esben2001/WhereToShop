namespace ShoppingApi.Services;

/// <summary>
/// Configuration for AI integration.
/// Bound from appsettings.json under the "Ai" section.
/// </summary>
public class AiOptions
{
    public string Model { get; set; } = "gpt-4.1-mini";

    /// <summary>
    /// Hardcoded instruction/prompt that YOU control (not the end-user).
    /// </summary>
    public string Prompt { get; set; } = "";
}