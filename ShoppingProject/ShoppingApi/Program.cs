using ShoppingApi.Data;
using ShoppingApi.Repositories;
using ShoppingApi.Services;

var builder = WebApplication.CreateBuilder(args);

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

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI();

app.UseCors("Frontend");
app.MapControllers();

app.Run();