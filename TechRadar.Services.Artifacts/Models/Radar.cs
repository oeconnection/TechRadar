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

using System.Collections.Generic;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace TechRadar.Services.Artifacts.Models
{
    [BsonIgnoreExtraElements]
    public class Radar
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }

        [BsonElement("name")]
        public string Name { get; set; }

        [BsonElement("sized")]
        public bool Sized { get; set; }

        [BsonElement("description")]
        public string Description { get; set; }

        [BsonElement("quadrants")]
        public IEnumerable<Quadrant> Quadrants { get; set; }

        [BsonElement("cycles")]
        public IEnumerable<Cycle> Cycles { get; set; }
    }
}
