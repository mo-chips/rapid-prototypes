using QuizGenerator.Core;
using OpenAI.Chat;
using System.ClientModel;
using Microsoft.EntityFrameworkCore;

// Application entry point and composition root.
// Configures dependency injection, CORS, OpenAI client,
// persistence services, and HTTP middleware for the Quiz API.
// Keeps setup centralized to avoid leaking infrastructure
// concerns into the core domain.


var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// Register SQLiteHelper
string dbPath = builder.Configuration.GetConnectionString("DefaultConnection");

builder.Services.AddScoped<QuizGenerator.Core.ISQLiteHelper>(provider => new QuizGenerator.Core.SQLiteHelper(dbPath));

// Register Identity Context and Activate JWT
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(dbPath));

builder.Services.AddAuthorization();
builder.Services.AddIdentityApiEndpoints<AppUser>()
    .AddEntityFrameworkStores<AppDbContext>();


builder.Services.AddControllers();

// Register OpenAI ChatClient
builder.Services.AddSingleton<ChatClient>(sp =>
{
    var key = Environment.GetEnvironmentVariable("OPEN_AI_KEY");

    // Check if key is missing and throw a clear error
    if (string.IsNullOrEmpty(key))
    {
        throw new InvalidOperationException("CRITICAL ERROR: 'OPEN_AI_KEY' environment variable is missing or empty.");
    }

    return new ChatClient(model: "gpt-4o-mini", apiKey: key);
});

builder.Services.AddScoped<QuizService>();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

app.UseCors("AllowAll");

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseAuthorization();

app.MapIdentityApi<AppUser>();

app.MapControllers();

app.Run();
