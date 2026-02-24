using ShoppingApi.Data;
using ShoppingApi.Repositories;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// CORS så dit frontend kan kalde API'en
builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", p =>
        p.AllowAnyOrigin()
         .AllowAnyHeader()
         .AllowAnyMethod());
});

// DI
builder.Services.AddSingleton<Db>();
builder.Services.AddScoped<ShoppingListRepository>();

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI();

app.UseCors("Frontend");

app.MapControllers();

app.Run();