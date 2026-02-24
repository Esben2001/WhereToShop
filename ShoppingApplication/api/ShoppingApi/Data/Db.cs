using Microsoft.Data.SqlClient;
using System.Data;

namespace ShoppingApi.Data;

public class Db
{
    private readonly IConfiguration _config;
    public Db(IConfiguration config) => _config = config;

    public IDbConnection CreateConnection()
        => new SqlConnection(_config.GetConnectionString("Default"));
}