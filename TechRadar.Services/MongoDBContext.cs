using TechRadar.Services.Models;
using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Options;

namespace TechRadar.Services
{
    public class MongoDBContext
    {
        private DatabaseSettings _settings;

        private IMongoDatabase _database { get; }

        public MongoDBContext(IOptions<DatabaseSettings> settings)
        {
            _settings = settings.Value;
            try
            {
                var client = new MongoClient(_settings.ConnectionString);
                _database = client.GetDatabase(_settings.DatabaseName);
            }
            catch (Exception ex)
            {
                throw new Exception("Can not access to db server.", ex);
            }
        }

        public IMongoCollection<Radar> Radars
        {
            get
            {
                return _database.GetCollection<Radar>("Radars");
            }
        }

        public IMongoCollection<Blip> Blips
        {
            get
            {
                return _database.GetCollection<Blip>("Blips");
            }
        }
    }
}