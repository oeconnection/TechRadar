using TechRadar.Services.Models;
using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace TechRadar.Services
{
    public class MongoDBContext
    {
        public static string ConnectionString { get; set; }
        public static string DatabaseName { get; set; }
        public static bool IsSSL { get; set; }

        private IMongoDatabase _database { get; }

        public MongoDBContext()
        {
            try
            {
                MongoClientSettings settings = MongoClientSettings.FromUrl(new MongoUrl(ConnectionString));
                if (IsSSL)
                {
                    settings.SslSettings = new SslSettings { EnabledSslProtocols = System.Security.Authentication.SslProtocols.Tls12 };
                }
                var mongoClient = new MongoClient(settings);
                _database = mongoClient.GetDatabase(DatabaseName);
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
        public IMongoCollection<Cycle> Cycles
        {
            get
            {
                return _database.GetCollection<Cycle>("Cycles");
            }
        }

        public IMongoCollection<Quadrant> Quadrants
        {
            get
            {
                return _database.GetCollection<Quadrant>("Quadrants");
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