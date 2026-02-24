using Microsoft.Data.SqlClient;
using System.Data;

namespace ShoppingApi.Data;

public class Database
{
    private readonly IConfiguration _config;
    public Database(IConfiguration config) => _config = config;

    public IDbConnection CreateConnection()
        => new SqlConnection(_config.GetConnectionString("Default"));
}