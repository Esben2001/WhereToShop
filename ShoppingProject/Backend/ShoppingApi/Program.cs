using DotNetEnv;
using Microsoft.Extensions.Options;
using OpenAI.Chat;
using ShoppingApi.Data;
using ShoppingApi.Repositories;
using ShoppingApi.Services;

var builder = WebApplication.CreateBuilder(args);

// Load environment variables from a local .env file (ignored by git).
// Adjust path if your .env lives somewhere else.
try
{
    // Common choice in this repo: ShoppingProject/Database/.env (sibling to Backend)
    // Program runs from: ShoppingProject/Backend/ShoppingApi
    // So we go up two levels to reach ShoppingProject, then into Database.
    Env.Load("../../Database/.env");
}
catch
{
    // If the file doesn't exist locally, we just rely on real environment variables.
}

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", p =>
        p.AllowAnyOrigin()
         .AllowAnyHeader()
         .AllowAnyMethod());
});

// Db
builder.Services.AddSingleton<Database>();

// Repositories (DAO)
builder.Services.AddScoped<IShoppingListRepository, ShoppingListRepository>();

// Services (Business Logic)
builder.Services.AddScoped<IShoppingListService, ShoppingListService>();

// AI options from appsettings.json
builder.Services.Configure<AiOptions>(builder.Configuration.GetSection("Ai"));

// OpenAI Chat client
builder.Services.AddSingleton<ChatClient>(sp =>
{
    var opts = sp.GetRequiredService<IOptions<AiOptions>>().Value;
    var apiKey = Environment.GetEnvironmentVariable("OPENAI_API_KEY");
    if (string.IsNullOrWhiteSpace(apiKey))
        throw new InvalidOperationException("OPENAI_API_KEY mangler. Sæt den i .env eller som environment variable.");

    return new ChatClient(opts.Model, apiKey);
});

builder.Services.AddSingleton<AiShoppingService>();

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI();

app.UseCors("Frontend");
app.MapControllers();

app.Run();