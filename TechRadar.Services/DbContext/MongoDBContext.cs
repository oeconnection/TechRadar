#region copyright
// Copyright (c) 2017 OEConnection, LLC
// 
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
// 
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
// 
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.
#endregion

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