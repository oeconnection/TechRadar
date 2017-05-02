using Microsoft.Extensions.Options;
using MongoDB.Driver;
using System;
using TechRadar.Services.Artifacts.Interfaces;
using TechRadar.Services.Artifacts.Models;

namespace TechRadar.Services.DbContext
{
    public class MongoDbContext : IMongoDbContext
    {
        private IMongoDatabase _database { get; }

        public MongoDbContext(IOptions<DatabaseSettings> settings)
        {
            var databaseSettings = settings.Value;
            try
            {
                var client = new MongoClient(databaseSettings.ConnectionString);
                _database = client.GetDatabase(databaseSettings.DatabaseName);
            }
            catch (Exception ex)
            {
                throw new Exception("Can not access to db server.", ex);
            }
        }

        public IMongoCollection<Radar> Radars => _database.GetCollection<Radar>("Radars");

        public IMongoCollection<Blip> Blips => _database.GetCollection<Blip>("Blips");
    }
}